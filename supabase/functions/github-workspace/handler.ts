import type { Selection } from '../_shared/workspace-contracts.ts';
import { positiveId } from '../github-connection/github.ts';
import { isBranch, isCommit, isPath, type WorkspaceGit, WorkspaceError } from './git.ts';

interface Dependencies {
  origin: string;
  authenticate(token: string): Promise<string | null>;
  isAdmin(userId: string): Promise<boolean>;
  openGit(): Promise<{
    repositories: WorkspaceGit['repositories'];
    forRepository(repositoryId: number): Promise<WorkspaceGit>;
    checkConnection(): Promise<void>;
  }>;
  getPreference(userId: string): Promise<Selection | null>;
  savePreference(userId: string, selection: Selection): Promise<void>;
}

export function createWorkspaceHandler(deps: Dependencies) {
  const headers = {
    'Access-Control-Allow-Origin': deps.origin,
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  };
  const json = (body: object, status = 200) => Response.json(body, { status, headers });

  return async (request: Request) => {
    const origin = request.headers.get('Origin');
    if (origin && origin !== deps.origin) return json({ error: 'forbidden' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

    try {
      const bearer = request.headers.get('Authorization')?.match(/^Bearer (\S+)$/i);
      const userId = bearer ? await deps.authenticate(bearer[1]) : null;
      if (!userId) return json({ error: 'unauthenticated' }, 401);
      if (!await deps.isAdmin(userId)) return json({ error: 'forbidden' }, 403);

      const body = await request.json().catch(() => null);
      const action = body?.action;
      if (action === 'select') {
        if (!positiveId(body.repositoryId) || (body.branch !== undefined && !isBranch(body.branch))) {
          return json({ error: 'invalid_request' }, 400);
        }
      } else if (action === 'tree' || action === 'file') {
        if (!positiveId(body.repositoryId) || !isBranch(body.branch) || !isPath(body.path) ||
            ((action === 'file' || body.path.length > 0 || body.commit !== undefined) && !isCommit(body.commit)) ||
            (action === 'file' && !body.path.length)) {
          return json({ error: 'invalid_request' }, 400);
        }
      } else if (action !== 'load') {
        return json({ error: 'invalid_request' }, 400);
      }

      const remote = await deps.openGit();
      const repositories = await remote.repositories();
      const saved = await deps.getPreference(userId);
      if (action === 'load') {
        const repository = repositories.find(repo => repo.id === saved?.repositoryId);
        const branches = repository
          ? await remote.forRepository(repository.id).then(git => git.branches(repository)).catch(error => {
            if (error instanceof WorkspaceError && error.code === 'remote_missing') return null;
            throw error;
          })
          : null;
        await remote.checkConnection();
        return json({
          repositories,
          branches: branches ?? [],
          selection: repository && branches
            ? { repositoryId: repository.id, branch: saved?.branch && branches.includes(saved.branch) ? saved.branch : null }
            : null,
        });
      }

      const repository = repositories.find(repo => repo.id === body.repositoryId);
      if (!repository) return json({ error: 'repository_out_of_scope' }, 403);
      if (action === 'select') {
        const git = await remote.forRepository(repository.id);
        const branches = await git.branches(repository);
        if (body.branch !== undefined && !branches.includes(body.branch)) {
          return json({ error: 'branch_not_found' }, 404);
        }
        // Selecting a repository may pick its live default. Restoring a deleted branch does not.
        const preferred = body.branch ?? (saved?.repositoryId === repository.id ? saved?.branch : null);
        const branch = preferred && branches.includes(preferred)
          ? preferred
          : branches.includes(repository.defaultBranch) ? repository.defaultBranch : branches[0] ?? null;
        const selection = { repositoryId: repository.id, branch };
        await remote.checkConnection();
        await deps.savePreference(userId, selection);
        return json({ repositories, selection, branches });
      }

      const matches = (selection: Selection | null) =>
        selection?.repositoryId === repository.id && selection.branch === body.branch;
      if (!matches(saved)) return json({ error: 'selection_changed' }, 409);
      const git = await remote.forRepository(repository.id);
      const result = action === 'tree'
        ? await git.tree(repository, body.branch, body.path, body.commit)
        : await git.file(repository, body.branch, body.path, body.commit);
      await remote.checkConnection();
      if (!matches(await deps.getPreference(userId))) return json({ error: 'selection_changed' }, 409);
      return json(result);
    } catch (error) {
      if (error instanceof WorkspaceError) return json({ error: error.code }, error.status);
      return json({ error: 'unavailable' }, 503);
    }
  };
}
