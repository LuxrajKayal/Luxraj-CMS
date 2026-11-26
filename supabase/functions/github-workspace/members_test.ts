import assert from 'node:assert/strict';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.119.2';
import { encodeBytes, sha256 } from '../_shared/file-bytes.ts';
import { createWorkspaceHandler } from './handler.ts';
import { createMembers, memberFields, taskId } from './members.ts';
import type { WorkspaceGit } from './git.ts';

const origin = 'https://cms.example.test';
const admin = '40000000-0000-4000-8000-000000000001';
const author = '40000000-0000-4000-8000-000000000002';
const developer = '40000000-0000-4000-8000-000000000003';
const appId = '60000000-0000-4000-8000-000000000001';
const draftId = '70000000-0000-4000-8000-000000000001';
const head = 'a'.repeat(40);
const fields = { email: 'author@example.test', role: 'author', full_name: 'Fixture member',
  birth_date: '1996-02-29', gender: 'Unspecified', qualifications: 'Testing', description: '' } as const;
const repository = { id: 7, name: 'fixture/tools', defaultBranch: 'main', private: true };

function fixture() {
  const known: Record<string, { id: string; email: string }> = {
    [admin]: { id: admin, email: 'admin@example.test' },
    [developer]: { id: developer, email: 'manual@example.test' },
  };
  const tables: Record<string, Record<string, unknown>[]> = {
    cms_members: [], cms_member_apps: [], cms_tasks: [], cms_member_files: [],
  };
  const calls: string[] = [];
  const remote: string[] = [];
  let passwordSeen = false;
  const client = {
    auth: { admin: {
      async listUsers() { return { data: { users: Object.values(known), nextPage: null } }; },
      async createUser(request: { email: string; password: string }) {
        passwordSeen = request.password === 'fixture pass';
        const user = { id: author, email: request.email };
        known[author] = user;
        return { data: { user } };
      },
      async getUserById(id: string) { return { data: { user: known[id] ?? null } }; },
      async updateUserById(id: string, update: { email: string }) {
        known[id].email = update.email;
        return { data: { user: known[id] } };
      },
      async deleteUser(id: string) {
        delete known[id];
        tables.cms_members = tables.cms_members.filter(row => row.user_id !== id);
        return { error: null };
      },
    } },
    from(table: string) {
      const filters: [string, unknown][] = [];
      let data: Record<string, unknown> | undefined;
      let upsert = false;
      let update = false;
      let erase = false;
      async function result() {
        const rows = tables[table];
        if (data) {
          if (update) {
            const previous = rows.find(row => filters.every(([key, value]) => row[key] === value));
            if (!previous) return { data: [], error: null };
            Object.assign(previous, data);
          } else if (upsert) {
            const previous = rows.find(row => row.user_id === data!.user_id);
            if (previous) Object.assign(previous, data);
            else rows.push(data);
          } else rows.push(data);
          return { data: [data], error: null };
        }
        const matches = rows.filter(row => filters.every(([key, value]) => row[key] === value));
        if (erase) tables[table] = rows.filter(row => !matches.includes(row));
        return { data: matches, error: null };
      }
      const query = {
        select: () => query, order: () => query, range: () => query,
        delete: () => { erase = true; return query; },
        eq: (key: string, value: unknown) => { filters.push([key, value]); return query; },
        insert: (row: Record<string, unknown>) => { data = row; return query; },
        update: (row: Record<string, unknown>) => { data = row; update = true; return query; },
        upsert: (row: Record<string, unknown>) => { data = row; upsert = true; return query; },
        async maybeSingle() { return { data: (await result()).data[0] ?? null, error: null }; },
        then: (resolve: (res: unknown) => void) => result().then(resolve),
      };
      return query;
    },
    async rpc(name: string, args: Record<string, unknown>) {
      calls.push(name);
      if (name === 'cms_save_member_file') {
        if (args.app && !tables.cms_member_apps.some(row => row.id === args.app && row.user_id === args.actor)) {
          return { data: null, error: { message: 'assignment_revoked' } };
        }
        return { data: args.file, error: null };
      }
      if (name === 'cms_read_member_file') {
        assert.equal(args.owner_id, developer);
        return { data: null, error: null };
      }
      if (name === 'cms_disable_member') return { data: null, error: null };
      throw new Error('Unexpected RPC');
    },
  } as unknown as SupabaseClient;
  const handler = createWorkspaceHandler({
    origin, members: createMembers(client), authenticate: async token => known[token]?.id ?? null,
    isAdmin: async id => id === admin,
    getPreference: async () => null, savePreference: async () => {},
    async openGit() {
      return {
        repositories: async () => [repository],
        forRepository: async () => ({
          requireBranch: async () => head,
          websiteFile: async (_repo: unknown, branch: string, path: string[], pinned: string) => {
            assert.equal(branch, 'release');
            assert.equal(pinned, head);
            remote.push(path.join('/'));
            return { contents: btoa('<!doctype html>') };
          },
        }) as unknown as WorkspaceGit,
        checkConnection: async () => {},
      };
    },
  });
  async function send(token: string, action: string, values: object = {}) {
    const response = await handler(new Request(origin, { method: 'POST', headers: { Origin: origin, Authorization: 'Bearer ' + token },
      body: JSON.stringify({ action, ...values }) }));
    return { status: response.status, data: await response.json() };
  }
  return { send, tables, remote, calls, passwordSeen: () => passwordSeen };
}

Deno.test('Task 17 accepts real dates and formats time in the Admin time zone without seconds', () => {
  assert.equal(taskId(new Date('2026-11-25T11:03:59Z'), 'Asia/Colombo'), 'TSK-25-11-2026-16-33');
  assert.equal(taskId(new Date('2026-11-25T18:30:05Z'), 'Asia/Colombo'), 'TSK-26-11-2026-00-00');
  assert.throws(() => taskId(new Date(), 'incorrect'), { message: 'member_invalid' });
  assert.throws(() => memberFields({ ...fields, birth_date: '1999-02-29' }), { message: 'member_invalid' });
  assert.deepEqual(memberFields(fields), fields);
});

Deno.test('Admin provisions, imports and deletes Auth accounts without returning or storing a password', async () => {
  const { send, tables, passwordSeen } = fixture();
  assert.equal((await send('unknown', 'people_list')).status, 401);
  assert.equal((await send(developer, 'people_list')).status, 403);
  assert.equal((await send(developer, 'member_home')).status, 403);
  assert.deepEqual((await send(admin, 'people_list')).data.accounts,
    [{ id: developer, email: 'manual@example.test', profile: null }]);
  const created = await send(admin, 'people_save', { fields, password: 'fixture pass' });
  assert.deepEqual(created.data, { id: author });
  assert.equal(passwordSeen(), true);
  assert.equal('password' in tables.cms_members[0], false);
  assert.equal((await send(admin, 'people_save', { id: developer, fields: { ...fields, email: 'changed@example.test', role: 'advisor' } })).status, 200);
  assert.equal((await send(developer, 'member_home')).data.profile.role, 'advisor');
  assert.equal((await send(admin, 'people_delete', { id: admin })).status, 400);
  assert.equal((await send(admin, 'people_delete', { id: developer })).status, 200);
  assert.equal((await send(developer, 'member_home')).status, 401);
});

Deno.test('Restricted operations check ownership, assigned paths, profile bytes and revocation on an active session', async () => {
  const { send, tables, remote, calls } = fixture();
  await send(admin, 'people_save', { fields, password: 'fixture pass' });
  await send(admin, 'people_save', { id: developer, fields: { ...fields, role: 'developer', email: 'manual@example.test' } });
  tables.cms_member_apps.push({ id: appId, user_id: author, name: 'Generic tool', repository_id: 7,
    branch: 'release', application: 'tool.html', inputs: ['folder/allowed.dat'] });
  assert.equal((await send(author, 'load')).status, 403);
  assert.equal((await send(author, 'file_save')).status, 403);
  assert.equal((await send(author, 'confirm_commit')).status, 403);
  assert.equal((await send(author, 'people_submission_file')).status, 403);
  assert.equal((await send(developer, 'member_launch', { appId })).status, 403);
  assert.equal((await send(author, 'member_input', { appId, path: 'unassigned.dat', commit: head })).status, 403);
  assert.deepEqual(remote, []);
  const launch = await send(author, 'member_launch', { appId });
  assert.equal(launch.data.source, '<!doctype html>');
  assert.deepEqual(remote, ['tool.html']);
  assert.equal((await send(author, 'member_input', { appId, path: 'folder/allowed.dat', commit: head })).status, 200);
  const bytes = Uint8Array.of(0, 255, 1);
  const file = { id: draftId, name: 'output.bin', size: bytes.length, mime: '', contents: encodeBytes(bytes), sha256: await sha256(bytes) };
  assert.equal((await send(author, 'member_save', { appId: null, file })).data.error, 'invalid_profile_image');
  for (const size of [15_000, 150_000]) {
    const picture = new Uint8Array(size);
    picture.set(new TextEncoder().encode('RIFF'), 0);
    new DataView(picture.buffer).setUint32(4, size - 8, true);
    picture.set(new TextEncoder().encode('WEBPVP8 '), 8);
    const result = await send(author, 'member_save', { appId: null, file: {
      id: crypto.randomUUID(), name: 'profile.webp', size, mime: 'image/webp',
      sha256: await sha256(picture), contents: encodeBytes(picture),
    } });
    assert.equal(result.status, 200);
  }
  assert.equal((await send(author, 'member_save', { appId, file })).status, 200);
  tables.cms_member_apps = [{ ...tables.cms_member_apps[0], user_id: developer }];
  assert.equal((await send(author, 'member_save', { appId, file })).data.error, 'assignment_revoked');
  assert.equal((await send(developer, 'member_draft_input', { appId, fileId: draftId })).status, 404);
  assert.deepEqual(calls, ['cms_save_member_file', 'cms_save_member_file', 'cms_save_member_file', 'cms_save_member_file', 'cms_read_member_file']);
});

Deno.test('Admin can assign and replace an application but cannot carry forward the old assignment ID', async () => {
  const { send } = fixture();
  await send(admin, 'people_save', { fields, password: 'fixture pass' });
  const app = { userId: author, repositoryId: 7, branch: 'release', name: 'Generic tool',
    application: 'tool.html', inputs: ['allowed.dat'] };
  const created = await send(admin, 'people_assign', app);
  assert.equal(created.status, 200);
  const first = created.data.id;
  assert.equal((await send(author, 'member_launch', { appId: first })).status, 200);
  const modified = await send(admin, 'people_assign', { ...app, id: first, application: 'updated.html' });
  assert.equal(modified.status, 200);
  assert.notEqual(modified.data.id, first);
  assert.equal((await send(author, 'member_launch', { appId: first })).status, 403);
  assert.equal((await send(author, 'member_launch', { appId: modified.data.id })).status, 200);
  assert.equal((await send(admin, 'people_unassign', { userId: author, id: modified.data.id })).status, 200);
  assert.equal((await send(author, 'member_launch', { appId: modified.data.id })).status, 403);
});
