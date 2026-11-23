import { positiveId } from '../github-connection/github.ts';
import { filePath, gitBlobSha } from '../_shared/file-bytes.ts';
import type { Selection } from '../_shared/workspace-contracts.ts';
import { isBranch, isCommit, WorkspaceError, type WorkspaceGit } from './git.ts';
import { profileAssetUrl, publicPrefix, toStored, validateFile, type FileDrafts } from './file-drafts.ts';

const actions = new Set(['file_manager_tree', 'file_inspect', 'file_save', 'file_drafts', 'file_comparison',
  'profile_picture_location', 'save_profile_picture_location', 'profile_picture_stage', 'verify_profile_picture']);
const uuid = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i;

export async function fileManager(body: Record<string, unknown> | null, userId: string, deps: {
  fileDrafts?: FileDrafts;
  isAdmin(id: string): Promise<boolean>;
  getPreference(id: string): Promise<Selection | null>;
  openGit(): Promise<{
    repositories: WorkspaceGit['repositories'];
    forRepository(id: number): Promise<WorkspaceGit>;
    checkConnection(): Promise<void>;
  }>;
}) {
  const action = body?.action;
  if (typeof action !== 'string' || !actions.has(action)) return;
  if (!body || !deps.fileDrafts) throw new Error('File Manager unavailable.');
  const files = deps.fileDrafts;
  if (action === 'profile_picture_location') return { location: await files.location() };
  const { repositoryId, branch, commit, revision, originalBlob } = body;
  const path = typeof body.folder === 'string' && action === 'save_profile_picture_location'
    ? body.folder.split('/') : body.path;
  if (!positiveId(repositoryId) || !isBranch(branch) ||
      (action !== 'file_drafts' && (!filePath(path) ||
        (!path.length && action !== 'file_manager_tree'))) ||
      (['file_inspect', 'file_save', 'profile_picture_stage'].includes(action) && !isCommit(commit)) ||
      (['file_comparison', 'verify_profile_picture'].includes(action) && (typeof revision !== 'string' || !uuid.test(revision))) ||
      (['file_save', 'profile_picture_stage'].includes(action) && originalBlob !== null && !isCommit(originalBlob))) {
    throw new WorkspaceError('invalid_request', 400);
  }
  const segments = filePath(path) ? path : [];
  const target = segments.join('/');
  const locationOperation = action === 'save_profile_picture_location';
  const profile = action === 'profile_picture_stage' || action === 'verify_profile_picture';
  async function checkRole() {
    if (!await deps.isAdmin(userId)) throw new WorkspaceError('forbidden', 403);
    if (locationOperation) return;
    const selection = await deps.getPreference(userId);
    if (!selection || selection.repositoryId !== repositoryId || selection.branch !== branch) throw new WorkspaceError('selection_changed', 409);
  }
  await checkRole();
  const remote = await deps.openGit();
  const repository = (await remote.repositories()).find(repo => repo.id === repositoryId);
  if (!repository) throw new WorkspaceError('repository_out_of_scope', 403);
  const git = await remote.forRepository(repository.id);
  async function check() {
    await remote.checkConnection();
    await checkRole();
  }
  if (locationOperation) {
    const prefix = publicPrefix(body.publicPrefix);
    await git.fileManagerTree(repository, branch, segments);
    await check();
    return { location: await files.saveLocation({ repositoryId: repository.id, branch, folder: target, publicPrefix: prefix }) };
  }

  const scope = { userId, repositoryId: repository.id, branch };
  const fileScope = { ...scope, path: target };
  const location = profile ? await files.location() : null;
  if (profile && (!location || location.repositoryId !== repository.id || location.branch !== branch ||
      location.folder !== segments.slice(0, -1).join('/') || !/\.webp$/i.test(segments.at(-1)!))) {
    throw new WorkspaceError('invalid_profile_destination', 422);
  }
  switch (action) {
    case 'file_manager_tree': {
      const result = await git.fileManagerTree(repository, branch, segments);
      await check();
      return result;
    }
    case 'file_drafts': {
      const drafts = await files.list(scope);
      await check();
      return { drafts };
    }
    case 'file_inspect': {
      const inspected = await git.fileTarget(repository, branch, segments, commit as string, true);
      await check();
      return { commit: inspected.commit, original: inspected.original };
    }
    case 'file_save':
    case 'profile_picture_stage': {
      const payload = await validateFile({ size: body.size, sha256: body.sha256, contents: body.contents, mime: body.mime }, profile);
      const inspected = await git.fileTarget(repository, branch, segments, commit as string);
      if (inspected.blob !== originalBlob) throw new WorkspaceError('commit_file_conflict', 409, { path: target });
      if (originalBlob && await gitBlobSha(payload.bytes) === originalBlob) throw new WorkspaceError('file_unchanged', 422);
      await check();
      const draft = await files.save(fileScope, inspected.commit, inspected.blob, payload, async () => {
        if (await git.requireBranch(repository, branch) !== inspected.commit) throw new WorkspaceError('branch_changed', 409);
        if (profile) {
          const current = await files.location();
          if (JSON.stringify(current) !== JSON.stringify(location)) throw new WorkspaceError('invalid_profile_destination', 409);
        }
        await check();
      });
      return { draft };
    }
    case 'file_comparison': {
      const row = await files.get(fileScope, revision as string);
      if (!row) throw new WorkspaceError('file_unavailable', 404);
      const [original, proposed] = await Promise.all([
        row.original_blob ? git.fileAtCommit(repository, row.original_commit, segments) : null,
        files.loadBytes(row),
      ]);
      if (row.original_blob && original?.blob !== row.original_blob) throw new WorkspaceError('file_integrity', 409);
      await check();
      return { draft: toStored(row), original, proposed };
    }
    case 'verify_profile_picture': {
      const row = await files.get(fileScope, revision as string);
      if (!row?.committed_sha || row.mime_hint !== 'image/webp') throw new WorkspaceError('profile_image_uncommitted', 409);
      const committed = await git.fileAtCommit(repository, row.committed_sha, segments);
      const head = await git.requireBranch(repository, branch);
      const actual = await git.fileTarget(repository, branch, segments, head);
      if (!committed?.blob || committed.blob !== actual.blob || committed.sha256 !== row.file_digest) {
        throw new WorkspaceError('file_integrity', 409);
      }
      await check();
      return { url: profileAssetUrl(location!.publicPrefix, segments.at(-1)!), sha256: row.file_digest, committedSha: row.committed_sha };
    }
  }
}
