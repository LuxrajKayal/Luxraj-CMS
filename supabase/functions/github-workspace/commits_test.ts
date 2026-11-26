import assert from 'node:assert/strict';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.119.2';
import { createCommitReviews, writeCommit } from './commits.ts';
import type { WorkspaceGit } from './git.ts';
import { encodeBytes, sha256 } from '../_shared/file-bytes.ts';
import type { FileDrafts } from './file-drafts.ts';

const head = '1'.repeat(40);
const blob = '2'.repeat(40);
const sha = '3'.repeat(40);
const paths = ['index.html', 'site.css'];
const scope = { userId: 'admin', repositoryId: 22, branch: 'feature/test' };
const repository = { id: 22, name: 'owner/site', defaultBranch: 'main', private: true };
const files = paths.map((path, index) => ({ path, revision: `version-${index}` }));

function setup(limit?: () => Promise<number>, hasTask = false) {
  const review = { id: 'review', repository: repository.name, branch: scope.branch, head, message: 'Two files',
    files, claimed: true, commit_sha: null,
    ...(hasTask ? { task_links: [{ task: 'TSK-25-11-2026-16-33', submission: 'submitted' }] } : {}) };
  let active = true;
  let current = head;
  let remoteBlob = blob;
  let rpcFailures = 0;
  const archived: unknown[] = [];
  const rpcNames: string[] = [];
  let inserted: Record<string, unknown> | undefined;
  const filters = new Map<string, unknown>();
  const db = {
    from() {
      const query = {
        update: () => query, select: () => query,
        insert: (values: Record<string, unknown>) => { inserted = values; return query; },
        single: async () => ({ data: { ...review, ...inserted }, error: null }),
        match: (values: object) => {
          filters.set('scope', values);
          return query;
        },
        eq: (column: string, value: unknown) => { filters.set(column, value); return query; },
        gt: () => query, is: () => query, lt: (column: string) => { filters.set('age', column); return query; },
        async maybeSingle() {
          if (!active) return { data: null, error: null };
          active = false;
          return { data: review, error: null };
        },
      };
      return query;
    },
    async rpc(name: string, values: unknown) {
      archived.push(values);
      rpcNames.push(name);
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
    fileTarget: async () => ({ blob: remoteBlob, commit: current, original: null }),
    repoPath: () => '/repos/owner/site',
    get: async () => Response.json({ sha, parents: [{ sha: head }], message: 'Two files' }),
    atCommit: async (_repo: typeof repository, commit: string, path: string[]) => {
      assert.equal(commit, sha);
      return `new ${path.join('/')}`;
    },
  } as unknown as WorkspaceGit;
  return { commits: createCommitReviews(db, limit, async () => 'TSK-25-11-2026-16-33'), review, archived, filters, rpcNames,
    inserted: () => inserted,
    input: { repository, scope, git, changes: source, check: async () => {} },
    moveHead: () => { current = '4'.repeat(40); },
    commitHead: () => { current = sha; },
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

Deno.test('task linkage comes from the reviewed draft and prefixes the descriptive commit message', async () => {
  const f = setup();
  const bytes = Uint8Array.of(255, 0, 100);
  const digest = await sha256(bytes);
  const stored = { get: async () => ({ revision: files[0].revision, file_size: bytes.length, file_digest: digest, original_blob: blob,
    submission_id: 'submitted' }),
  loadBytes: async () => ({ size: bytes.length, contents: encodeBytes(bytes), sha256: digest }) } as unknown as FileDrafts;
  const review = await f.commits.prepare({ ...f.input, fileDrafts: stored }, [files[0]], 'Updated the documentation');
  assert.equal(review.message, '[TSK-25-11-2026-16-33] Updated the documentation');
  assert.deepEqual(f.inserted()?.task_links, [{ task: 'TSK-25-11-2026-16-33', submission: 'submitted' }]);
  const unrelated = setup();
  await unrelated.commits.prepare(unrelated.input, files, '[TSK-25-11-2026-16-33] unrelated edit');
  assert.equal(unrelated.inserted()?.task_links, undefined);
});

Deno.test('linked review reserves before writing, releases definite failures, and records an accepted SHA without a second write', async () => {
  const rejected = setup(undefined, true);
  await assert.rejects(rejected.commits.confirm(rejected.input, 'review', async () => {
    assert.deepEqual(rejected.rpcNames, ['cms_claim_linked_review']);
    return Response.json({ errors: [{ message: 'Protected branch update failed' }] });
  }), { message: 'commit_rejected' });
  assert.deepEqual(rejected.rpcNames, ['cms_claim_linked_review', 'cms_release_linked_review']);

  const uncertain = setup(undefined, true);
  await assert.rejects(uncertain.commits.confirm(uncertain.input, 'review', async () => { throw new Error('lost connection'); }),
    { message: 'commit_unknown' });
  assert.deepEqual(uncertain.rpcNames, ['cms_claim_linked_review']);

  const accepted = setup(undefined, true);
  let writes = 0;
  const receipt = await accepted.commits.confirm(accepted.input, 'review', async () => {
    writes++;
    assert.deepEqual(accepted.rpcNames, ['cms_claim_linked_review']);
    accepted.failRecordOnce();
    return Response.json({ data: { createCommitOnBranch: { commit: { oid: sha } } } });
  });
  assert.equal(receipt.sha, sha);
  assert.equal(writes, 1);
  assert.deepEqual(accepted.rpcNames, ['cms_claim_linked_review', 'cms_record_linked_commit', 'cms_record_linked_commit']);
});

Deno.test('linked recovery checks branch reachability and an abandoned review without issuing a GitHub write', async () => {
  const unrelated = setup(undefined, true);
  await assert.rejects(unrelated.commits.reconcile(unrelated.input, 'review', sha), { message: 'commit_unverified' });
  assert.deepEqual(unrelated.rpcNames, []);

  const observed = setup(undefined, true);
  observed.commitHead();
  assert.equal((await observed.commits.reconcile(observed.input, 'review', sha)).sha, sha);
  assert.deepEqual(observed.rpcNames, ['cms_record_linked_commit']);

  const changed = setup(undefined, true);
  changed.moveHead();
  await assert.rejects(changed.commits.release!(changed.input, 'review'), { message: 'commit_release_blocked' });
  assert.deepEqual(changed.rpcNames, []);

  const unchanged = setup(undefined, true);
  assert.deepEqual(await unchanged.commits.release!(unchanged.input, 'review'), { released: true });
  assert.equal(unchanged.filters.get('age'), 'claimed_at');
  assert.deepEqual(unchanged.rpcNames, ['cms_release_linked_review']);
});
