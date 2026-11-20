import type { DraftDeletion, DraftIdentity, ManagedDraft, Selection, StorageUsage } from '../_shared/workspace-contracts.ts';
import { positiveId } from '../github-connection/github.ts';
import { isBranch, isCommit, isPath, type WorkspaceGit, WorkspaceError } from './git.ts';
import type { ChangeSets } from './change-sets.ts';

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
  changes?: ChangeSets;
  storage?: { usage(): Promise<StorageUsage>; set(databaseLimitMb: number, fileLimitMb: number): Promise<StorageUsage> };
}

const isRevision = (value: unknown) => typeof value === 'string' &&
  /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(value);

function isDraftIdentity(value: unknown): value is DraftIdentity {
  if (!value || typeof value !== 'object') return false;
  const { repositoryId, branch, path, revision } = value as DraftIdentity;
  return positiveId(repositoryId) && isBranch(branch) && typeof path === 'string' &&
    path.length <= 1024 && isPath(path.split('/')) && isRevision(revision);
}

function validLimit(value: unknown, ceiling: number) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= ceiling;
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
      if (action === 'storage_status' || action === 'storage_save') {
        if (!deps.storage) throw new Error('Storage policy unavailable.');
        if (action === 'storage_status') return json(await deps.storage.usage());
        if (!validLimit(body.databaseLimitMb, 450) || !validLimit(body.fileLimitMb, 900)) {
          return json({ error: 'invalid_storage_limits' }, 400);
        }
        return json(await deps.storage.set(body.databaseLimitMb, body.fileLimitMb));
      }
      if (action === 'draft_catalog' || action === 'delete_drafts') {
        if (action === 'delete_drafts' &&
            (!Array.isArray(body.drafts) || !body.drafts.length || body.drafts.length > 50 ||
              !body.drafts.every(isDraftIdentity))) return json({ error: 'invalid_request' }, 400);
        const changes = deps.changes;
        if (!changes?.catalog || !changes.remove) throw new Error('Draft management unavailable.');

        if (action === 'draft_catalog') {
          // Drafts belong to the authenticated Super Admin, even when their GitHub
          // repository was disconnected or the branch was deleted. GitHub is used
          // only to enrich the display, never to decide which drafts are visible.
          const catalog = await changes.catalog(userId);
          const repositories = new Map<number, { name: string; branches: string[] }>();
          try {
            const remote = await deps.openGit();
            const accessible = await remote.repositories();
            for (const repositoryId of new Set(catalog.map(item => item.repositoryId))) {
              const repository = accessible.find(item => item.id === repositoryId);
              if (!repository) continue;
              try {
                const git = await remote.forRepository(repositoryId);
                const branches = await git.branches(repository);
                repositories.set(repositoryId, { name: repository.name, branches });
              } catch {
                // The saved draft is still visible and removable even if GitHub fails.
              }
            }
            await remote.checkConnection();
          } catch {
            // GitHub App may be disconnected; Supabase draft cleanup must still work.
            repositories.clear();
          }
          const files: ManagedDraft[] = catalog.map(item => {
            const repository = repositories.get(item.repositoryId);
            return {
              ...item,
              repository: repository?.name ?? `Repository #${item.repositoryId} (unavailable)`,
              available: repository?.branches.includes(item.branch) ?? false,
            };
          });
          return json({ files });
        }

        // Removing a Supabase-only draft does not require GitHub access. The
        // service-role query is scoped to userId + repository + branch + path
        // and guarded by the exact revision to prevent stale/foreign deletes.
        const results: DraftDeletion[] = [];
        for (const { repositoryId, branch, path, revision } of body.drafts as DraftIdentity[]) {
          const item = { repositoryId, branch, path, revision };
          let result: DraftDeletion['result'];
          try {
            result = await changes.remove(userId, item) ? 'deleted' : 'conflict';
          } catch {
            result = 'unavailable';
          }
          results.push({ ...item, result });
        }
        return json({ results });
      }
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
      } else if (['open_draft', 'save_draft', 'changes', 'diff'].includes(action)) {
        if (!positiveId(body.repositoryId) || !isBranch(body.branch) ||
            (action !== 'changes' && (!isPath(body.path) || !body.path.length || body.path.join('/').length > 1024)) ||
            ((action === 'open_draft' || action === 'save_draft') && !isCommit(body.commit)) ||
            (action === 'save_draft' && (
              typeof body.source !== 'string' || body.source.includes('\0') ||
              new TextEncoder().encode(body.source).length > 1024 * 1024 ||
              (body.revision !== null && !isRevision(body.revision))
            ))) return json({ error: 'invalid_request' }, 400);
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
      if (['open_draft', 'save_draft', 'changes', 'diff'].includes(action)) {
        const changes = deps.changes;
        if (!changes) throw new Error('Change sets are unavailable.');
        const scope = { userId, repositoryId: repository.id, branch: body.branch };
        const fileScope = { ...scope, path: action === 'changes' ? '' : body.path.join('/') };
        if (action === 'save_draft' || action === 'open_draft') {
          const current = await git.fileVersion(repository, body.branch, body.path, body.commit);
          await remote.checkConnection();
          if (!matches(await deps.getPreference(userId))) return json({ error: 'selection_changed' }, 409);
          return action === 'save_draft'
            ? json({ draft: await changes.save(fileScope, current, body.source, body.revision) })
            : json({ current, draft: await changes.get(fileScope) });
        }
        await git.requireBranch(repository, body.branch);
        const result = action === 'changes' ? await changes.list(scope) : await changes.get(fileScope);
        await remote.checkConnection();
        if (!matches(await deps.getPreference(userId))) return json({ error: 'selection_changed' }, 409);
        if (action === 'changes') return json({ files: result });
        return result ? json(result) : json({ error: 'remote_missing' }, 404);
      }
      const result = action === 'tree'
        ? await git.tree(repository, body.branch, body.path, body.commit)
        : await git.file(repository, body.branch, body.path, body.commit);
      await remote.checkConnection();
      if (!matches(await deps.getPreference(userId))) return json({ error: 'selection_changed' }, 409);
      return json(result);
    } catch (error) {
      if (error instanceof WorkspaceError) return json({ error: error.code, ...error.details }, error.status);
      return json({ error: 'unavailable' }, 503);
    }
  };
}
