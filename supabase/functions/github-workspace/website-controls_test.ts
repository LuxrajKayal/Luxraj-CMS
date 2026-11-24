import assert from 'node:assert/strict';
import { decodeBytes, encodeBytes, gitBlobSha } from '../_shared/file-bytes.ts';
import type { Selection, WebsiteControl } from '../_shared/workspace-contracts.ts';
import type { ChangeScope } from './change-sets.ts';
import { createWorkspaceGit } from './git.ts';
import { createWorkspaceHandler } from './handler.ts';
import { runMaintenance } from './website-controls.ts';

const head = 'a'.repeat(40);
const tree = 'b'.repeat(40);
const id = '8bfdf001-8793-4481-8e10-7be9388a6025';
const origin = 'https://cms.example.test';
const registration = {
  name: 'Generic app', application: 'app.html', inputs: ['fixture.unknown', 'executable'], destinations: ['different.output', 'extensionless'],
};

Deno.test('Website Controls authenticates the actor, persists references by scope and pins reads to the active head', async () => {
  const html = new TextEncoder().encode('<!doctype html><script>start()</script>');
  const bytes = Uint8Array.of(0, 255, 1, 128);
  const blob = await gitBlobSha(html);
  const rawBlob = await gitBlobSha(bytes);
  let selection: Selection = { repositoryId: 11, branch: 'main' };
  let currentHead = head;
  let inScope = true;
  const calls: string[] = [];
  const records = new Map<string, WebsiteControl[]>();
  const key = (scope: ChangeScope) => JSON.stringify(scope);
  const repo = { id: 11, name: 'fixture/sample', defaultBranch: 'main', private: true };
  const git = createWorkspaceGit(async path => {
    calls.push(path);
    if (path.includes('/branches/')) return Response.json({ name: selection.branch, commit: { sha: currentHead, commit: { tree: { sha: tree } } } });
    if (path.endsWith('/git/trees/' + tree)) return Response.json({ tree: [
      { path: 'app.html', mode: '100644', type: 'blob', sha: blob, size: html.length },
      { path: 'fixture.unknown', mode: '100644', type: 'blob', sha: rawBlob, size: bytes.length },
      { path: 'executable', mode: '100755', type: 'blob', sha: rawBlob, size: bytes.length },
      { path: 'link.html', mode: '120000', type: 'blob', sha: blob, size: html.length },
    ] });
    if (path.endsWith('/git/blobs/' + blob)) return Response.json({ size: html.length, encoding: 'base64', content: encodeBytes(html) });
    if (path.endsWith('/git/blobs/' + rawBlob)) return Response.json({ size: bytes.length, encoding: 'base64', content: encodeBytes(bytes) });
    return new Response(null, { status: 404 });
  });
  const handler = createWorkspaceHandler({
    origin,
    authenticate: async token => token === 'invalid' ? null : token === 'ordinary' ? 'member' : 'actor',
    isAdmin: async actor => actor === 'actor',
    async getPreference() { return selection; },
    async savePreference() {},
    async openGit() { return {
      async repositories() { return inScope ? [repo] : []; },
      async forRepository() { return git; },
      async checkConnection() {},
    }; },
    website: {
      async list(scope) { return records.get(key(scope)) ?? []; },
      async get(scope, requestedId) { return records.get(key(scope))?.find(row => row.id === requestedId) ?? null; },
      async add(scope, preferences) {
        const control = { ...preferences, id: preferences.inputs.length ? id : crypto.randomUUID() };
        records.set(key(scope), [...(records.get(key(scope)) ?? []), control]);
        return control;
      },
    },
  });
  async function send(action: string, values: object = {}, token = 'session') {
    const response = await handler(new Request(origin, { method: 'POST',
      headers: { Origin: origin, Authorization: 'Bearer ' + token },
      body: JSON.stringify({ action, repositoryId: 11, branch: 'main', ...values }),
    }));
    return { status: response.status, data: await response.json() };
  }
  assert.equal((await send('website_list', {}, 'invalid')).status, 401);
  assert.equal((await send('website_register', { registration }, 'ordinary')).status, 403);
  assert.equal((await send('website_maintenance', { mode: 'all' }, 'ordinary')).status, 403);
  assert.equal(calls.length, 0);
  assert.equal((await send('website_register', { registration: { ...registration, application: '../app.html' } })).status, 400);
  assert.equal((await send('website_register', { registration: { ...registration, application: 'link.html' } })).status, 404);
  assert.deepEqual((await send('website_register', { registration: { ...registration, inputs: [], destinations: [] } })).data.control.inputs, []);
  assert.equal((await send('website_register', { registration })).status, 200);
  assert.equal(calls.some(path => path.includes('/blobs/')), false);
  assert.deepEqual((await send('website_list', {}, 'later-session')).data.controls[1], { id, ...registration });
  const run = await send('website_launch', { id });
  assert.equal(run.status, 200);
  assert.deepEqual(Object.keys(run.data).sort(), ['commit', 'control', 'source']);
  assert.equal(run.data.commit, head);
  assert.equal(run.data.source, new TextDecoder().decode(html));
  const response = await send('website_input', { id, path: 'executable', commit: head });
  assert.deepEqual(decodeBytes(response.data.file.contents), bytes);
  currentHead = 'c'.repeat(40);
  assert.equal((await send('website_input', { id, path: 'fixture.unknown', commit: head })).data.error, 'branch_changed');
  selection = { repositoryId: 11, branch: 'other' };
  assert.equal((await send('website_input', { id, path: 'fixture.unknown', commit: head })).data.error, 'selection_changed');
  assert.deepEqual((await send('website_list', { branch: 'other' })).data.controls, []);
  assert.equal((await send('website_launch', { id, branch: 'other' })).status, 404);
  selection = { repositoryId: 22, branch: 'main' };
  assert.equal((await send('website_list', { repositoryId: 22 })).data.error, 'repository_out_of_scope');
  selection = { repositoryId: 11, branch: 'main' };
  inScope = false;
  assert.equal((await send('website_input', { id, path: 'executable', commit: head })).status, 403);
});

Deno.test('maintenance keeps selective operations independent and retries incomplete temporary object removal', async () => {
  const actor = 'admin';
  const uuid = (i: number) => '00000000-0000-0000-0000-' + i.toString().padStart(12, '0');
  const revisions = Array.from({ length: 17 }, (_, i) => ({
    repositoryId: i % 2 + 1, branch: 'branch/' + i, path: 'source', revision: uuid(i), stored: i % 2 === 1,
  }));
  const rows = new Map(revisions.map(item => [item.revision, item]));
  const objects = new Set(revisions.filter(item => item.stored).map(item => item.revision));
  let controls = true;
  let settings = true;
  let storageOffline = true;
  const apply = async (mode: 'all' | 'drafts' | 'controls', after?: string) => runMaintenance({ mode, after }, actor, {
    async page(user, cursor) {
      assert.equal(user, actor);
      return [...rows.values()].filter(item => !cursor || item.revision > cursor).slice(0, 16);
    },
    async count(user) { assert.equal(user, actor); return rows.size; },
    async reset(user, full) {
      assert.equal(user, actor);
      controls = false;
      if (full) settings = false;
    },
  }, async (item, stored) => {
    if (stored && storageOffline && item.revision === uuid(1)) throw new Error('Storage unavailable');
    if (stored) assert.equal(objects.delete(item.revision), true);
    return rows.delete(item.revision);
  }, async () => true);
  assert.equal((await apply('controls')).reset, true);
  assert.equal(controls, false);
  assert.equal(rows.size, 17);
  assert.equal(objects.size, 8);
  controls = true;
  const first = await apply('drafts');
  assert.equal(first.deleted, 14);
  assert.ok(first.next);
  assert.deepEqual(await apply('drafts', first.next), { deleted: 2, next: null, remaining: 1, reset: false });
  assert.equal(controls, true);
  assert.equal(settings, true);
  assert.equal(objects.size, 1);
  assert.equal((await apply('all')).reset, false);
  storageOffline = false;
  assert.deepEqual(await apply('all'), { deleted: 1, next: null, remaining: 0, reset: true });
  assert.equal(controls, false);
  assert.equal(settings, false);
  assert.equal(objects.size, 0);
});
