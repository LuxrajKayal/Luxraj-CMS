import { positiveId } from '../github-connection/github.ts';
import type { Directory, FileVersion, Repository, SourceFile, TreeEntry } from '../_shared/workspace-contracts.ts';

const maxSourceBytes = 1024 * 1024;
const sourceName = /\.(?:html?|css|js|mjs|cjs)$/i;
export const isCommit = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{40}$/i.test(value);
export const isBranch = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= 1024 &&
  !value.startsWith('/') && !value.endsWith('/') && !value.includes('..') && value !== '.' &&
  value.split('').every(character => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127);
const isSegment = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= 1024 &&
  value !== '.' && value !== '..' && !value.includes('/') && !value.includes(String.fromCharCode(0));
export const isPath = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length <= 64 && value.every(isSegment);

export class WorkspaceError extends Error {
  constructor(public code: string, public status: number) {
    super(code);
  }
}

type Get = (path: string) => Promise<Response>;
type GitEntry = { path: string; type: string; mode: string; sha: string; size?: number };

export function createWorkspaceGit(get: Get) {
  async function pages(path: string, list: (body: any) => unknown, emptyOnConflict = false) {
    const result: any[] = [];
    for (let page = 1; page <= 100; page += 1) {
      const response = await get(`${path}?per_page=100&page=${page}`);
      if (emptyOnConflict && response.status === 409 && page === 1) return [];
      if (!response.ok) throw githubError(response);
      const values = list(await response.json());
      if (!Array.isArray(values)) throw new Error('Invalid GitHub list.');
      result.push(...values);
      if (!response.headers.get('Link')?.includes('rel="next"')) return result;
    }
    throw new WorkspaceError('list_too_large', 422);
  }

  function githubError(response: Response) {
    return response.status === 404 ? new WorkspaceError('remote_missing', 404) : new Error('GitHub read failed.');
  }

  async function object(path: string) {
    const response = await get(path);
    if (!response.ok) throw githubError(response);
    return response.json();
  }

  function repoPath(repo: Repository) {
    return '/repos/' + repo.name.split('/').map(encodeURIComponent).join('/');
  }

  async function getTree(base: string, sha: string): Promise<GitEntry[]> {
    const value = await object(`${base}/git/trees/${sha}`);
    if (value.truncated) throw new WorkspaceError('directory_too_large', 422);
    if (!Array.isArray(value.tree)) throw new Error('Invalid GitHub tree.');
    return value.tree;
  }

  function directory(entry: GitEntry) {
    return entry.type === 'tree' && entry.mode === '040000' && isCommit(entry.sha);
  }

  function file(entry: GitEntry) {
    return entry.type === 'blob' && ['100644', '100755'].includes(entry.mode) &&
      isCommit(entry.sha) && sourceName.test(entry.path);
  }

  async function readDirectory(repo: Repository, branch: string, path: string[], expected?: string) {
    const base = repoPath(repo);
    const value = await object(`${base}/branches/${encodeURIComponent(branch)}`);
    if (value.name !== branch || !isCommit(value.commit?.sha)) {
      throw new WorkspaceError('remote_missing', 404);
    }
    const commit: string = value.commit.sha;
    if (expected && commit !== expected) throw new WorkspaceError('branch_changed', 409);
    let sha = value.commit.commit?.tree?.sha;
    if (!isCommit(sha)) {
      const gitCommit = await object(`${base}/git/commits/${commit}`);
      sha = gitCommit.tree?.sha;
    }
    if (!isCommit(sha)) throw new Error('Invalid GitHub tree SHA.');
    let entries = await getTree(base, sha);
    for (const segment of path) {
      const entry = entries.find(item => item.path === segment && directory(item));
      if (!entry) throw new WorkspaceError('remote_missing', 404);
      entries = await getTree(base, entry.sha);
    }
    return { base, commit, entries };
  }

  async function fileVersion(repo: Repository, branch: string, path: string[], commit: string): Promise<FileVersion> {
    const name = path.at(-1);
    if (!name || !sourceName.test(name)) throw new WorkspaceError('unsupported_file', 422);
    const { base, entries } = await readDirectory(repo, branch, path.slice(0, -1), commit);
    const entry = entries.find(item => item.path === name && file(item));
    if (!entry) throw new WorkspaceError('unsupported_file', 422);
    if (!Number.isSafeInteger(entry.size) || entry.size! < 0 || entry.size! > maxSourceBytes) {
      throw new WorkspaceError('file_too_large', 422);
    }
    const blob = await object(`${base}/git/blobs/${entry.sha}`);
    if (blob.encoding !== 'base64' || blob.size !== entry.size || typeof blob.content !== 'string' ||
        blob.content.length > maxSourceBytes * 1.5) throw new Error('Invalid GitHub blob.');
    try {
      const bytes = Uint8Array.from(atob(blob.content), character => character.charCodeAt(0));
      if (bytes.length !== entry.size || bytes.includes(0)) throw new Error('Invalid source data.');
      return { source: new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes), commit, blob: entry.sha };
    } catch {
      throw new WorkspaceError('unsupported_file', 422);
    }
  }

  return {
    async repositories(): Promise<Repository[]> {
      const values = await pages('/installation/repositories', value => value.repositories);
      const repositories = new Map<number, Repository>();
      for (const value of values) {
        if (!positiveId(value.id) || typeof value.full_name !== 'string' ||
            !/^[a-z\d-]+\/[a-z\d_.-]+$/i.test(value.full_name) || /\/\.{1,2}$/.test(value.full_name) ||
            typeof value.default_branch !== 'string' || typeof value.private !== 'boolean') {
          throw new Error('Invalid GitHub repository.');
        }
        repositories.set(value.id, {
          id: value.id, name: value.full_name, defaultBranch: value.default_branch, private: value.private,
        });
      }
      return [...repositories.values()].sort((a, b) => a.name.localeCompare(b.name));
    },
    async branches(repo: Repository): Promise<string[]> {
      const values = await pages(`${repoPath(repo)}/branches`, value => value, true);
      return [...new Set<string>(values.map(value => value.name as unknown).filter(isBranch))].sort();
    },
    async tree(repo: Repository, branch: string, path: string[], expected?: string): Promise<Directory> {
      const { commit, entries } = await readDirectory(repo, branch, path, expected);
      const visible: TreeEntry[] = [];
      for (const entry of entries) {
        if (!isSegment(entry.path)) continue;
        if (directory(entry)) visible.push({ name: entry.path, kind: 'folder' });
        else if (file(entry)) visible.push({ name: entry.path, kind: 'file' });
      }
      visible.sort((a, b) => a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === 'folder' ? -1 : 1);
      return { commit, entries: visible };
    },
    async file(repo: Repository, branch: string, path: string[], commit: string): Promise<SourceFile> {
      const { source } = await fileVersion(repo, branch, path, commit);
      return { source };
    },
    fileVersion,
    async requireBranch(repo: Repository, branch: string) {
      const value = await object(`${repoPath(repo)}/branches/${encodeURIComponent(branch)}`);
      if (value.name !== branch || !isCommit(value.commit?.sha)) throw new WorkspaceError('remote_missing', 404);
    },
  };
}

export type WorkspaceGit = ReturnType<typeof createWorkspaceGit>;
