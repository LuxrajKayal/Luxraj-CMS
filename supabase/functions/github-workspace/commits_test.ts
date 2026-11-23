import assert from 'node:assert/strict';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.119.2';
import { createCommitReviews, writeCommit } from './commits.ts';
import type { WorkspaceGit } from './git.ts';

const head = '1'.repeat(40);
const blob = '2'.repeat(40);
const sha = '3'.repeat(40);
const paths = ['index.html', 'site.css'];
const scope = { userId: 'admin', repositoryId: 22, branch: 'feature/test' };
const repository = { id: 22, name: 'owner/site', defaultBranch: 'main', private: true };
const files = paths.map((path, index) => ({ path, revision: `version-${index}` }));

function setup(limit?: () => Promise<number>) {
  const review = { id: 'review', repository: repository.name, branch: scope.branch, head, message: 'Two files',
    files, claimed: true, commit_sha: null };
  let active = true;
  let current = head;
  let remoteBlob = blob;
  let rpcFailures = 0;
  const archived: unknown[] = [];
  const filters = new Map<string, unknown>();
  const db = {
    from() {
      const query = {
        update: () => query, select: () => query,
        match: (values: object) => {
          filters.set('scope', values);
          return query;
        },
        eq: (column: string, value: unknown) => { filters.set(column, value); return query; },
        gt: () => query,
        async maybeSingle() {
          if (!active) return { data: null, error: null };
          active = false;
          return { data: review, error: null };
        },
      };
      return query;
    },
    async rpc(_name: string, values: unknown) {
      archived.push(values);
      if (rpcFailures-- > 0) return { data: null, error: { message: 'network failure' } };
      return { data: 2, error: null };
    },
  } as unknown as SupabaseClient;
  const source = {
    async get({ path }: { path: string }) {
      return { path, revision: files.find(file => file.path === path)!.revision, originalSource: 'old',
        proposedSource: `new ${path}`, originalCommit: head, originalBlob: blob, updatedAt: '' };
    },
    async list() { return []; },
    async save() { return null; },
  };
  const git = {
    requireBranch: async () => current,
    fileVersion: async () => ({ blob: remoteBlob, commit: current, source: 'old' }),
    repoPath: () => '/repos/owner/site',
    get: async () => Response.json({ sha, parents: [{ sha: head }], message: 'Two files' }),
    atCommit: async (_repo: typeof repository, commit: string, path: string[]) => {
      assert.equal(commit, sha);
      return `new ${path.join('/')}`;
    },
  } as unknown as WorkspaceGit;
  return { commits: createCommitReviews(db, limit), review, archived, filters,
    input: { repository, scope, git, changes: source, check: async () => {} },
    moveHead: () => { current = '4'.repeat(40); },
    changeFile: () => { remoteBlob = '5'.repeat(40); },
    failRecordOnce: () => { rpcFailures = 1; },
  };
}

Deno.test('a lower live commit limit stops a previously prepared review before any GitHub mutation', async () => {
  let calls = 0;
  const f = setup(async () => ++calls === 1 ? 2 : 1);
  await assert.rejects(f.commits.confirm(f.input, 'review', () => { throw new Error('unexpected write'); }),
    { message: 'commit_limit_exceeded', status: 409, details: { maximumFiles: 1 } });
  assert.equal(calls, 2);
  assert.deepEqual(f.archived, []);
});

Deno.test('confirmation writes a single atomic mutation to the reviewed branch, then archives the exact revisions', async () => {
  const f = setup();
  let writes = 0;
  const result = await f.commits.confirm(f.input, 'review', async value => {
    writes++;
    assert.deepEqual(value, { input: {
      branch: { repositoryNameWithOwner: 'owner/site', branchName: 'feature/test' },
      expectedHeadOid: head, message: { headline: 'Two files', body: '' },
      fileChanges: { additions: paths.map(path => ({ path, contents: btoa(`new ${path}`) })) },
    } });
    return Response.json({ data: { createCommitOnBranch: { commit: { oid: sha } } } });
  });
  assert.equal(writes, 1);
  assert.equal(result.sha, sha);
  assert.equal(result.retained, 2);
  assert.deepEqual(f.filters.get('scope'), { user_id: 'admin', repository_id: 22, branch: 'feature/test' });
  assert.deepEqual(f.archived, [{ review_id: 'review', actor_id: 'admin', github_sha: sha }]);
  await assert.rejects(f.commits.confirm(f.input, 'review', () => { throw new Error('Must not write twice'); }), { message: 'review_expired' });
});

Deno.test('stale branch heads and changed files stop the whole set before GitHub writes', async () => {
  for (const reason of ['branch_changed', 'commit_file_conflict']) {
    const f = setup();
    if (reason === 'branch_changed') f.moveHead();
    else f.changeFile();
    await assert.rejects(f.commits.confirm(f.input, 'review', () => { throw new Error('unexpected write'); }), { message: reason });
    assert.deepEqual(f.archived, []);
  }
});

Deno.test('GitHub branch protection and final head conflicts do not produce a success receipt', async () => {
  const f = setup();
  for (const [message, expected] of [
    ['Protected branch update failed', 'commit_rejected'],
    ['Expected branch head OID to be unchanged', 'branch_changed'],
  ]) {
    await assert.rejects(writeCommit(async () => Response.json({ errors: [{ message }] }), f.review, []), { message: expected });
  }
  await assert.rejects(writeCommit(async () => { throw new Error('network'); }, f.review, []), { message: 'commit_unknown' });
});

Deno.test('lost database response is retried without another GitHub write', async () => {
  const f = setup();
  f.failRecordOnce();
  let writes = 0;
  const result = await f.commits.confirm(f.input, 'review', async () => {
    writes++;
    return Response.json({ data: { createCommitOnBranch: { commit: { oid: sha } } } });
  });
  assert.equal(writes, 1);
  assert.equal(result.retained, 2);
  assert.equal(result.reviewId, 'review');
  assert.equal(f.archived.length, 2);
});

Deno.test('a confirmed GitHub SHA can securely reconcile retained draft status', async () => {
  const f = setup();
  const result = await f.commits.reconcile(f.input, 'review', sha);
  assert.equal(result.sha, sha);
  assert.equal(result.retained, 2);
  assert.deepEqual(f.archived, [{ review_id: 'review', actor_id: 'admin', github_sha: sha }]);
  const invalid = setup();
  await assert.rejects(invalid.commits.reconcile(invalid.input, 'review', '0'.repeat(40)),
    { message: 'commit_unverified' });
  assert.deepEqual(invalid.archived, []);
});
