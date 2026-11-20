import { assertEquals, assertRejects } from 'jsr:@std/assert';
import { WorkspaceError } from './git.ts';
import { createHistory } from './history.ts';

const repo = { id: 4, name: 'shop/site', defaultBranch: 'main', private: true };
const head = 'a'.repeat(40);
const parent = 'b'.repeat(40);
const topic = 'c'.repeat(40);
const outside = 'd'.repeat(40);
const base = '/repos/shop/site';

function summary(sha: string, parents: string[]) {
  return { sha, parents: parents.map(sha => ({ sha })), commit: { message: 'External commit', author: { name: 'Contributor' } } };
}

Deno.test('history pins every page to the selected head and preserves both parents and real branch tips', async () => {
  let currentHead = head;
  const calls: string[] = [];
  const git = {
    repoPath: () => base,
    requireBranch: (_repo: typeof repo, branch: string) => {
      assertEquals(branch, 'release/next');
      return Promise.resolve(currentHead);
    },
    get: (url: string) => {
      calls.push(url);
      if (url.endsWith('/branches?per_page=100&page=1')) {
        return Promise.resolve(Response.json([{ name: 'feature', commit: { sha: topic } }]));
      }
      return Promise.resolve(url.endsWith('&page=1')
        ? Response.json([summary(head, [parent, topic])], { headers: { Link: '<next>; rel="next"' } })
        : Response.json([summary(topic, [parent])]));
    },
    atCommit: () => Promise.reject(new Error('History listing must not read file content')),
  };
  const history = createHistory(git, repo, 'release/next');
  const first = await history.list(1);
  assertEquals(first.commits[0].parents, [parent, topic]);
  assertEquals(first.refs, [{ name: 'release/next', sha: head }, { name: 'feature', sha: topic }]);
  assertEquals(first.next, 2);
  assertEquals((await history.list(2, first.head)).commits[0].sha, topic);
  assertEquals(calls.filter(url => url.includes('/commits?')), [1, 2].map(page => `${base}/commits?sha=${head}&per_page=25&page=${page}`));
  currentHead = outside;
  await assertRejects(() => history.list(2, first.head), WorkspaceError, 'branch_changed');
  assertEquals(calls.length, 4);
});

Deno.test('historical rename uses the first parent and denies commits outside the selected branch before reading any files', async () => {
  const reads: [string, string[]][] = [];
  const git = {
    repoPath: () => base,
    requireBranch: () => Promise.resolve(head),
    get: (url: string) => {
      if (url.includes('/compare/')) {
        assertEquals(url, `${base}/compare/${outside}...${head}?per_page=1`);
        return Promise.resolve(Response.json({ status: 'diverged', merge_base_commit: { sha: parent } }));
      }
      assertEquals(url, `${base}/commits/${head}?per_page=100&page=1`);
      return Promise.resolve(Response.json({ ...summary(head, [parent, topic]), files: [
        { filename: 'site/new.html', previous_filename: 'old.html', status: 'renamed' },
      ] }));
    },
    atCommit: (_repo: typeof repo, sha: string, path: string[]) => {
      reads.push([sha, path]);
      return Promise.resolve(sha === parent ? 'before' : 'after');
    },
  };
  const history = createHistory(git, repo, 'main');
  await assertRejects(() => history.diff(outside, 'site/new.html'), WorkspaceError, 'commit_out_of_scope');
  assertEquals(reads, []);
  assertEquals(await history.diff(head, 'site/new.html'), { original: 'before', proposed: 'after' });
  assertEquals(reads, [[parent, ['old.html']], [head, ['site', 'new.html']]]);
});
