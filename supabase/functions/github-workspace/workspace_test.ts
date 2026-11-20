import assert from 'node:assert/strict';
import type { Draft, Selection } from '../_shared/workspace-contracts.ts';
import { createWorkspaceGit, WorkspaceError } from './git.ts';
import { createWorkspaceHandler } from './handler.ts';

const origin = 'https://cms.example.test';
const commit = '1'.repeat(40);
const root = '2'.repeat(40);
const folder = '3'.repeat(40);
const blob = '4'.repeat(40);
const contents = '<script>alert(1)</script>';

function fixture() {
  const repositories = [
    { id: 11, full_name: 'owner/alpha', default_branch: 'main', private: true },
    { id: 22, full_name: 'owner/beta', default_branch: 'trunk', private: false },
  ];
  const branchNames = ['main', 'feature/next'];
  const prefs = new Map<string, Selection>();
  const drafts = new Map<string, Draft>();
  const draftKey = (scope: object) => JSON.stringify(scope);
  const calls: string[] = [];
  let allowed = true;
  let changed = false;
  let liveCommit = commit;
  const git = createWorkspaceGit(async path => {
    calls.push(path);
    if (path.startsWith('/installation/repositories?')) {
      const first = path.endsWith('=1');
      const page = first ? repositories.slice(0, 1) : repositories.slice(1);
      return Response.json({ repositories: page }, { headers: first && repositories.length > 1 ? { Link: '<next>; rel="next"' } : {} });
    }
    if (path.startsWith('/repos/owner/beta/branches?')) return Response.json([{ name: 'trunk' }]);
    if (path.startsWith('/repos/owner/alpha/branches?')) return Response.json(branchNames.map(name => ({ name })));
    if (path === '/repos/owner/alpha/branches/feature%2Fnext') return Response.json({
      name: 'feature/next', commit: { sha: liveCommit, commit: { tree: { sha: root } } },
    });
    if (path.endsWith(root)) return Response.json({ tree: [
      { path: 'site', mode: '040000', type: 'tree', sha: folder },
      { path: 'link.html', mode: '120000', type: 'blob', sha: blob },
      { path: 'README.md', mode: '100644', type: 'blob', sha: blob },
    ] });
    if (path.endsWith(folder)) return Response.json({ tree: [
      { path: 'index.HTML', mode: '100644', type: 'blob', sha: blob, size: contents.length },
    ] });
    if (path.endsWith(blob)) return Response.json({
      encoding: 'base64', size: contents.length, content: btoa(contents),
    });
    return new Response('', { status: 404 });
  });

  const handler = createWorkspaceHandler({
    origin,
    changes: {
      async list(scope) {
        return [...drafts].filter(([key]) => {
          const { path: _path, ...owner } = JSON.parse(key);
          return draftKey(scope) === draftKey(owner);
        }).map(([, draft]) => ({ path: draft.path, updatedAt: draft.updatedAt }));
      },
      async get(scope) { return drafts.get(draftKey(scope)) ?? null; },
      async save(scope, base, proposed, revision) {
        const key = draftKey(scope);
        const previous = drafts.get(key);
        if ((previous?.revision ?? null) !== revision) throw new WorkspaceError('draft_conflict', 409);
        const draft = {
          path: scope.path, originalSource: previous?.originalSource ?? base.source,
          originalCommit: previous?.originalCommit ?? base.commit, originalBlob: previous?.originalBlob ?? base.blob,
          proposedSource: proposed, revision: crypto.randomUUID(), updatedAt: new Date().toISOString(),
        };
        drafts.set(key, draft);
        return draft;
      },
    },
    authenticate: async token => token === 'session' || token === 'new-session' ? 'owner' : token === 'other' ? 'other' : null,
    isAdmin: async userId => userId === 'owner',
    async openGit() {
      if (!allowed) throw new WorkspaceError('connection_required', 409);
      return {
        repositories: git.repositories,
        forRepository: async id => { calls.push(`repository-token:${id}`); return git; },
        async checkConnection() { if (changed) throw new WorkspaceError('connection_changed', 409); },
      };
    },
    getPreference: async userId => prefs.get(userId) ?? null,
    savePreference: async (userId, selection) => { prefs.set(userId, selection); },
  });
  const post = (body: object, token = 'session') => handler(new Request('https://supabase.example/workspace', {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, Origin: origin },
    body: JSON.stringify(body),
  }));
  return { post, prefs, calls, repositories, branchNames,
    disconnect: () => { allowed = false; },
    changeConnection: () => { changed = true; },
    advanceBranch: () => { liveCommit = 'f'.repeat(40); },
  };
}

Deno.test('workspace requires an authenticated Super Admin before contacting GitHub', async () => {
  const f = fixture();
  assert.equal((await f.post({ action: 'load' }, 'invalid')).status, 401);
  assert.equal((await f.post({ action: 'load', role: 'super_admin', userId: 'owner' }, 'other')).status, 403);
  assert.deepEqual(f.calls, []);
  f.disconnect();
  assert.equal((await f.post({ action: 'load' })).status, 409);
  assert.deepEqual(f.calls, []);
});

Deno.test('list, select, switch, and restore workspace against live repository and branch scope', async () => {
  const f = fixture();
  const loaded = await (await f.post({ action: 'load' })).json();
  assert.deepEqual(loaded.repositories.map((repo: { id: number }) => repo.id), [11, 22]);
  assert.equal(loaded.selection, null);
  await f.post({ action: 'select', repositoryId: 11, branch: 'feature/next', userId: 'other' });
  assert.deepEqual(f.prefs.get('owner'), { repositoryId: 11, branch: 'feature/next' });
  assert.equal(f.prefs.has('other'), false);
  const restored = await (await f.post({ action: 'load' }, 'new-session')).json();
  assert.deepEqual(restored.selection, { repositoryId: 11, branch: 'feature/next' });
  f.branchNames.pop();
  const removed = await (await f.post({ action: 'load' })).json();
  assert.deepEqual(removed.selection, { repositoryId: 11, branch: null });
  const switched = await (await f.post({ action: 'select', repositoryId: 22 })).json();
  assert.deepEqual(switched.selection, { repositoryId: 22, branch: 'trunk' });
  f.repositories.pop();
  assert.equal((await (await f.post({ action: 'load' })).json()).selection, null);
  assert.equal((await f.post({ action: 'select', repositoryId: 99 })).status, 403);
  assert.equal((await f.post({ action: 'select', repositoryId: 11, branch: 'deleted' })).status, 404);
});

Deno.test('read-only tree and source are scoped to a selected branch and its current commit', async () => {
  const f = fixture();
  const selection = { repositoryId: 11, branch: 'feature/next' };
  await f.post({ action: 'select', ...selection });
  const tree = await (await f.post({ action: 'tree', ...selection, path: [] })).json();
  assert.deepEqual(tree, { commit, entries: [{ name: 'site', kind: 'folder' }] });
  const child = await (await f.post({ action: 'tree', ...selection, commit, path: ['site'] })).json();
  assert.deepEqual(child.entries, [{ name: 'index.HTML', kind: 'file' }]);
  const file = { action: 'file', ...selection, commit, path: ['site', 'index.HTML'] };
  assert.deepEqual(await (await f.post(file)).json(), { source: contents });
  assert.ok(f.calls.includes('repository-token:11'));
  assert.equal((await f.post({ ...file, branch: 'main' })).status, 409);
  assert.equal((await f.post({ ...file, path: ['..', 'index.HTML'] })).status, 400);
  assert.equal((await f.post({ ...file, path: ['link.html'] })).status, 422);
  assert.equal((await f.post({ ...file, path: ['README.md'] })).status, 422);
  f.advanceBranch();
  assert.deepEqual(await (await f.post(file)).json(), { error: 'branch_changed' });
});

Deno.test('a connection change during a read suppresses source and fails before saving selections', async () => {
  const f = fixture();
  const selection = { repositoryId: 11, branch: 'feature/next' };
  await f.post({ action: 'select', ...selection });
  f.changeConnection();
  const response = await f.post({ action: 'file', ...selection, commit, path: ['site', 'index.HTML'] });
  assert.equal(response.status, 409);
  assert.deepEqual(await response.json(), { error: 'connection_changed' });
  assert.equal((await f.post({ action: 'select', repositoryId: 22 })).status, 409);
  assert.deepEqual(f.prefs.get('owner'), selection);
});

Deno.test('drafts keep the GitHub baseline, reject old revisions, and list only the selected scope', async () => {
  const f = fixture();
  const selection = { repositoryId: 11, branch: 'feature/next' };
  const path = ['site', 'index.HTML'];
  await f.post({ action: 'select', ...selection });
  const request = { action: 'save_draft', ...selection, path, commit, source: 'first edit', revision: null };
  assert.equal((await f.post(request, 'other')).status, 403);
  const first = await (await f.post({ ...request, originalSource: 'fake original', userId: 'other' })).json();
  assert.equal(first.draft.originalSource, contents);
  assert.equal(first.draft.originalCommit, commit);
  assert.equal(first.draft.originalBlob, blob);
  assert.equal((await f.post(request, 'new-session')).status, 409);

  f.advanceBranch();
  const reopened = await (await f.post({ action: 'open_draft', ...selection, path, commit: 'f'.repeat(40) }, 'new-session')).json();
  assert.equal(reopened.draft.proposedSource, 'first edit');
  assert.equal((await f.post({ ...request, revision: first.draft.revision })).status, 409);
  const updated = await (await f.post({ ...request, commit: 'f'.repeat(40), source: 'second edit', revision: first.draft.revision })).json();
  assert.equal(updated.draft.originalCommit, commit);
  assert.equal(updated.draft.proposedSource, 'second edit');
  assert.deepEqual((await (await f.post({ action: 'changes', ...selection })).json()).files.map((file: Draft) => file.path),
    ['site/index.HTML']);
  assert.equal((await (await f.post({ action: 'diff', ...selection, path })).json()).originalSource, contents);
  assert.equal((await f.post({ action: 'diff', ...selection, repositoryId: 99, path })).status, 403);
  await f.post({ action: 'select', repositoryId: 22 });
  assert.equal((await f.post({ action: 'diff', ...selection, path })).status, 409);
});
