import assert from 'node:assert/strict';
import { createWorkspaceHandler } from './handler.ts';
import { createWorkspaceGit, WorkspaceError } from './git.ts';
import { profileAssetUrl, publicPrefix, validateFile, type FileDrafts } from './file-drafts.ts';
import { decodeBytes, encodeBytes, filePath, gitBlobSha, sha256 } from '../_shared/file-bytes.ts';
import { checkedDrafts, writeCommit } from './commits.ts';
import type { Draft, ProfilePictureLocation, ReviewFile } from '../_shared/workspace-contracts.ts';

const head = 'a'.repeat(40);
const root = 'b'.repeat(40);
const folder = 'c'.repeat(40);
const bytes = Uint8Array.of(0, 255, 128, 10, 0, 33);
const revision = '11111111-1111-4111-8111-111111111111';
const repo = { id: 4, name: 'owner/site', defaultBranch: 'main', private: true };
const scope = { userId: 'owner', repositoryId: repo.id, branch: 'main' };

Deno.test('validates exact bytes independently of file type or MIME, and rejects traversal or bad checksums', async () => {
  for (const mime of ['', 'application/pdf', 'application/msword', 'image/png', 'application/octet-stream']) {
    assert.deepEqual((await validateFile({ size: bytes.length, contents: encodeBytes(bytes), sha256: await sha256(bytes), mime })).bytes, bytes);
  }
  await assert.rejects(validateFile({ size: bytes.length, contents: encodeBytes(bytes), sha256: '0'.repeat(64), mime: '' }),
    { message: 'file_integrity' });
  assert.equal(filePath(['assets', 'unfamiliar.payload']), true);
  for (const path of [['..', 'x'], ['.git', 'config'], ['x\\..\\y'], ['/x'], ['bad\u0000x']]) assert.equal(filePath(path), false);
  assert.equal(publicPrefix('https://example.test/images'), 'https://example.test/images/');
  assert.equal(profileAssetUrl('https://example.test/images', 'name #1.webp'), 'https://example.test/images/name%20%231.webp');
  assert.throws(() => publicPrefix('https://user:secret@example.test/image#hash'), { message: 'invalid_public_prefix' });
});

async function fixture() {
  let live = head;
  let chosen = { repositoryId: repo.id, branch: 'main' };
  const blob = await gitBlobSha(bytes);
  let calls = 0;
  const staged: { scope: typeof scope & { path: string }; original: string | null; bytes: Uint8Array }[] = [];
  const fakeGit = createWorkspaceGit(async path => {
    calls++;
    if (path.endsWith('/branches/main')) return Response.json({ name: 'main', commit: { sha: live, commit: { tree: { sha: root } } } });
    if (path.endsWith('/git/trees/' + root)) return Response.json({ tree: [{ path: 'assets', type: 'tree', mode: '040000', sha: folder }] });
    if (path.endsWith('/git/trees/' + folder)) return Response.json({ tree: [
      { path: 'existing.unknown', type: 'blob', mode: '100644', sha: blob, size: bytes.length },
      { path: 'symlink.dat', type: 'blob', mode: '120000', sha: blob, size: bytes.length },
    ] });
    if (path.endsWith('/git/blobs/' + blob)) return Response.json({ encoding: 'base64', size: bytes.length, content: encodeBytes(bytes) });
    return Response.json({}, { status: 404 });
  });
  let location: ProfilePictureLocation | null = null;
  const fileDrafts = {
    async save(fileScope, _head, original, payload, check) {
      await check();
      staged.push({ scope: fileScope, original, bytes: payload.bytes });
      return { path: fileScope.path, originalBlob: original, revision, committedSha: null,
        sha256: payload.sha256, mime: payload.mime, size: payload.size };
    },
    async get(_scope, _revision) { return null; },
    async location() { return location; },
    async saveLocation(value) { location = value; return value; },
  } satisfies Partial<FileDrafts>;
  const handler = createWorkspaceHandler({
    origin: 'https://cms.example.test',
    authenticate: async token => token === 'admin-token' ? 'owner' : token === 'reader-token' ? 'reader' : null,
    isAdmin: async user => user === 'owner',
    openGit: async () => ({ repositories: async () => [repo], forRepository: async () => fakeGit, checkConnection: async () => {} }),
    getPreference: async () => chosen, savePreference: async () => {},
    fileDrafts: fileDrafts as FileDrafts,
  });
  const post = (body: object, token = 'admin-token') => handler(new Request('https://example.test/functions', {
    method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: JSON.stringify(body),
  }));
  return { blob, post, staged, calls: () => calls, advance: () => { live = 'd'.repeat(40); },
    switchBranch: () => { chosen = { repositoryId: repo.id, branch: 'other' }; } };
}

Deno.test('prepares a new file and unknown binary replacement with pinned versions and no writes on invalid scope', async () => {
  const f = await fixture();
  const body = { repositoryId: repo.id, branch: 'main', commit: head };
  const path = ['assets', 'existing.unknown'];
  const inspected = { action: 'file_inspect', ...body, path };
  assert.equal((await f.post(inspected, 'reader-token')).status, 403);
  assert.equal(f.calls(), 0);
  assert.equal((await f.post({ ...inspected, repositoryId: 1 })).status, 409);
  const original = (await (await f.post(inspected)).json()).original;
  assert.equal(original.blob, f.blob);
  assert.equal(original.sha256, await sha256(bytes));
  assert.deepEqual(decodeBytes(original.contents), bytes);
  assert.equal((await f.post({ ...inspected, path: ['assets', 'Existing.unknown'] })).status, 409);
  assert.equal((await f.post({ ...inspected, path: ['assets', 'symlink.dat'] })).status, 409);
  const proposed = Uint8Array.of(2, 0, 255);
  const upload = { action: 'file_save', ...body, path, contents: encodeBytes(proposed), sha256: await sha256(proposed),
    size: proposed.length, mime: 'application/octet-stream', userId: 'spoofed', originalBlob: f.blob };
  assert.equal((await f.post({ ...upload, originalBlob: null })).status, 409);
  assert.equal((await f.post(upload)).status, 200);
  assert.equal((await f.post({ ...upload, path: ['assets', 'new.data'], originalBlob: null })).status, 200);
  assert.deepEqual(f.staged.map(item => item.original), [f.blob, null]);
  assert.deepEqual(f.staged.map(item => item.scope.userId), ['owner', 'owner']);
  assert.deepEqual(f.staged[1].bytes, proposed);
  f.advance();
  assert.equal((await f.post({ ...upload, path: ['assets', 'late.data'], originalBlob: null })).status, 409);
  f.switchBranch();
  assert.equal((await f.post(inspected)).status, 409);
  assert.equal(f.staged.length, 2);
});

Deno.test('profile location validates the repository and existing folder, and rejects draft access without a scoped row', async () => {
  const f = await fixture();
  const target = { repositoryId: repo.id, branch: 'main', folder: 'assets', publicPrefix: 'https://example.test/public' };
  assert.equal((await f.post({ action: 'save_profile_picture_location', ...target, folder: '../other' })).status, 400);
  assert.equal((await f.post({ action: 'save_profile_picture_location', ...target, folder: 'missing' })).status, 404);
  assert.deepEqual(await (await f.post({ action: 'save_profile_picture_location', ...target })).json(),
    { location: { ...target, publicPrefix: target.publicPrefix + '/' } });
  assert.equal((await f.post({ action: 'file_comparison', repositoryId: target.repositoryId, branch: 'main',
    path: ['assets', 'another-owner.webp'], revision })).status, 404);
  assert.equal((await f.post({ action: 'verify_profile_picture', repositoryId: target.repositoryId, branch: 'main',
    path: ['assets', 'another-owner.webp'], revision })).status, 409);
});

Deno.test('one shared commit carries exact encoded bytes for mixed binary and text drafts', async () => {
  const digest = await sha256(bytes);
  const binary = { path: 'new.pdf', revision, original_blob: null, original_commit: head, committed_sha: null,
    file_size: bytes.length, file_digest: digest, file_state: 'saved' as const, storage_key: 'private', mime_hint: '', updated_at: '' };
  const text: Draft = { path: 'index.html', revision: 'text', originalCommit: head, originalBlob: root,
    originalSource: 'before', proposedSource: 'after', updatedAt: '' };
  const files: ReviewFile[] = [{ path: binary.path, revision }, { path: text.path, revision: text.revision }];
  let currentBlob: string | null = null;
  const git = {
    fileTarget: async () => ({ commit: head, blob: currentBlob, original: null }),
    fileVersion: async () => ({ commit: head, blob: root, source: 'before' }),
  } as unknown as ReturnType<typeof createWorkspaceGit>;
  const input = { repository: repo, scope, git, check: async () => {},
    changes: { get: async () => text, list: async () => [], save: async () => null },
    fileDrafts: {
      get: async ({ path }: { path: string }) => path === binary.path ? binary : null,
      loadBytes: async () => ({ size: bytes.length, sha256: digest, mime: '', contents: encodeBytes(bytes) }),
    },
  };
  const checked = await checkedDrafts(input, files, head);
  assert.equal(checked[0].reviewFile.file?.sha256, digest);
  let requests = 0;
  await writeCommit(async ({ input: mutation }: any) => {
    requests++;
    assert.equal(mutation.expectedHeadOid, head);
    assert.deepEqual(mutation.fileChanges.additions, [
      { path: binary.path, contents: encodeBytes(bytes) }, { path: text.path, contents: btoa('after') },
    ]);
    return Response.json({ data: { createCommitOnBranch: { commit: { oid: folder } } } });
  }, { id: revision, repository: repo.name, branch: scope.branch, message: 'Reviewed files', head, files },
  checked.map(item => ({ path: item.reviewFile.path, contents: item.contents })));
  assert.equal(requests, 1);
  currentBlob = root;
  await assert.rejects(checkedDrafts(input, files, head), WorkspaceError, 'commit_file_conflict');
});
