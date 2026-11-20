import type { CommitDetail, HistoryCommit, HistoryPage, Repository } from '../_shared/workspace-contracts.ts';
import { isBranch, isCommit, isPath, WorkspaceError, type WorkspaceGit } from './git.ts';

function commit(value: any): HistoryCommit {
  if (!isCommit(value?.sha) || !Array.isArray(value.parents) || !value.parents.every((parent: any) => isCommit(parent?.sha))) {
    throw new Error('Invalid commit history.');
  }
  return {
    sha: value.sha, parents: value.parents.map((parent: { sha: string }) => parent.sha),
    message: typeof value.commit?.message === 'string' ? value.commit.message : '',
    author: value.commit?.author?.name || value.author?.login || '',
    date: value.commit?.author?.date || value.commit?.committer?.date || '',
  };
}

function readMissing(response: Response) {
  if (!response.ok) throw new WorkspaceError('remote_missing', response.status === 404 ? 404 : 503);
  return response.json();
}

function next(response: Response) {
  return response.headers.get('Link')?.includes('rel="next"') ?? false;
}

export function createHistory(
  git: Pick<WorkspaceGit, 'repoPath' | 'requireBranch' | 'get' | 'atCommit'>,
  repository: Repository,
  branch: string,
) {
  const base = git.repoPath(repository);
  async function verifyReachable(sha: string) {
    const head = await git.requireBranch(repository, branch);
    if (sha === head) return;
    const comparison = await readMissing(await git.get(`${base}/compare/${sha}...${head}?per_page=1`));
    if (comparison.merge_base_commit?.sha !== sha || !['ahead', 'identical'].includes(comparison.status)) {
      throw new WorkspaceError('commit_out_of_scope', 404);
    }
  }

  async function detail(sha: string): Promise<CommitDetail> {
    await verifyReachable(sha);
    const files: CommitDetail['files'] = [];
    let summary: HistoryCommit | undefined;
    for (let page = 1; page <= 30; page += 1) {
      const response = await git.get(`${base}/commits/${sha}?per_page=100&page=${page}`);
      const value = await readMissing(response);
      summary ??= commit(value);
      if (value.sha !== sha || !Array.isArray(value.files)) throw new Error('Invalid commit details.');
      for (const file of value.files) {
        if (typeof file.filename !== 'string' || typeof file.status !== 'string') continue;
        files.push({
          path: file.filename, status: file.status,
          previousPath: typeof file.previous_filename === 'string' ? file.previous_filename : undefined,
        });
      }
      if (!next(response)) return { ...summary, files, complete: files.length < 3000 };
    }
    if (!summary) throw new Error('Missing commit details.');
    return { ...summary, files, complete: false };
  }

  return {
    async list(page: number, expected?: string): Promise<HistoryPage> {
      const head = await git.requireBranch(repository, branch);
      if (expected && expected !== head) throw new WorkspaceError('branch_changed', 409);
      const response = await git.get(`${base}/commits?sha=${head}&per_page=25&page=${page}`);
      const values = await readMissing(response);
      if (!Array.isArray(values)) throw new Error('Invalid history.');
      // Branch tips do not change between pages pinned to the same head.
      // Load them only on page 1; the client retains these labels while paging.
      const refs = [{ name: branch, sha: head }];
      for (let branchPage = 1; page === 1 && branchPage <= 100; branchPage += 1) {
        const response = await git.get(`${base}/branches?per_page=100&page=${branchPage}`);
        const values = await readMissing(response);
        if (!Array.isArray(values)) throw new Error('Invalid branches.');
        for (const item of values) {
          if (isBranch(item.name) && item.name !== branch && isCommit(item.commit?.sha)) {
            refs.push({ name: item.name, sha: item.commit.sha });
          }
        }
        if (!next(response)) break;
      }
      return { head, commits: values.map(commit), refs, next: next(response) ? page + 1 : null };
    },
    detail,
    async diff(sha: string, path: string) {
      const value = await detail(sha);
      const file = value.files.find(file => file.path === path);
      const previousPath = file?.previousPath ?? path;
      if (!file || !isPath(path.split('/')) || !isPath(previousPath.split('/')) ||
          !['added', 'removed', 'modified', 'renamed'].includes(file.status) ||
          (file.status !== 'added' && !value.parents[0]) || (file.status === 'renamed' && !file.previousPath)) {
        throw new WorkspaceError('unsupported_history_file', 422);
      }
      try {
        const [original, proposed] = await Promise.all([
          file.status === 'added' ? '' : git.atCommit(repository, value.parents[0], previousPath.split('/')),
          file.status === 'removed' ? '' : git.atCommit(repository, sha, path.split('/')),
        ]);
        return { original, proposed };
      } catch (error) {
        if (error instanceof WorkspaceError && error.code === 'unsupported_file') {
          throw new WorkspaceError('unsupported_history_file', 422);
        }
        throw error;
      }
    },
  };
}
