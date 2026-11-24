import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.119.2';
import { maxFileBytes, type DraftIdentity, type FilePayload, type ProfilePictureLocation, type StoredFile } from '../_shared/workspace-contracts.ts';
import { decodeBytes, encodeBytes, sha256, webp } from '../_shared/file-bytes.ts';
import type { ChangeScope } from './change-sets.ts';
import { WorkspaceError } from './git.ts';

type Scope = ChangeScope & { path: string };
type Row = {
  path: string; revision: string; original_blob: string | null; original_commit: string; committed_sha: string | null;
  storage_key: string; file_size: number; file_digest: string; mime_hint: string;
  file_state: 'uploading' | 'saved' | 'deleting'; updated_at: string; draft_origin?: StoredFile['origin'] | null;
};
const columns = 'path,revision,original_blob,original_commit,committed_sha,storage_key,file_size,file_digest,mime_hint,file_state,updated_at,draft_origin';

export function toStored(row: Row): StoredFile {
  return { path: row.path, revision: row.revision, originalBlob: row.original_blob, committedSha: row.committed_sha,
    size: row.file_size, sha256: row.file_digest, mime: row.mime_hint, ...(row.draft_origin ? { origin: row.draft_origin } : {}) };
}

export async function validateFile(body: { size: unknown; contents: unknown; sha256: unknown; mime: unknown }, profile = false) {
  const { size, contents, sha256: digest, mime } = body;
  if (typeof size !== 'number' || !Number.isInteger(size) || size < 0 || size > maxFileBytes ||
      typeof contents !== 'string' || contents.length !== 4 * Math.ceil(size / 3) ||
      typeof digest !== 'string' || !/^[a-f0-9]{64}$/.test(digest) || typeof mime !== 'string') {
    throw new WorkspaceError('invalid_file_upload', 422);
  }
  let bytes: Uint8Array<ArrayBuffer>;
  try { bytes = decodeBytes(contents); } catch { throw new WorkspaceError('file_integrity', 422); }
  if (bytes.length !== size || await sha256(bytes) !== digest) throw new WorkspaceError('file_integrity', 422);
  if (profile && (size < 15000 || size > 150000 || !webp(bytes))) throw new WorkspaceError('invalid_profile_image', 422);
  const hint = mime.split(';', 1)[0].trim().toLowerCase();
  return { bytes, size, sha256: digest, mime: profile ? 'image/webp'
    : hint.length <= 128 && /^[\w.+-]+\/[\w.+-]+$/.test(hint) ? hint : '' };
}

export function publicPrefix(value: unknown) {
  if (typeof value !== 'string' || value.length > 2048) throw new WorkspaceError('invalid_public_prefix', 422);
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash ||
        !url.hostname.includes('.') || /%2f|%5c|%00/i.test(url.pathname)) throw new Error();
    return url.href.replace(/\/+$/, '') + '/';
  } catch { throw new WorkspaceError('invalid_public_prefix', 422); }
}

export function profileAssetUrl(prefix: string, filename: string) {
  return new URL(encodeURIComponent(filename), publicPrefix(prefix)).href;
}

export function createFileDrafts(client: SupabaseClient) {
  const table = 'cms_change_set_files';
  const bucket = client.storage.from('cms-file-drafts');
  const scopeKeys = (scope: ChangeScope) => ({ user_id: scope.userId, repository_id: scope.repositoryId, branch: scope.branch });
  const keys = (scope: Scope) => ({ ...scopeKeys(scope), path: scope.path });

  async function get(scope: Scope, revision?: string): Promise<Row | null> {
    const query = client.from(table).select(columns).match(keys(scope)).eq('file_state', 'saved');
    const { data, error } = await (revision ? query.eq('revision', revision) : query.is('committed_sha', null)).maybeSingle();
    if (error) throw error;
    return data as Row | null;
  }

  async function loadBytes(row: Row): Promise<FilePayload> {
    const { data, error } = await bucket.download(row.storage_key);
    if (error || !data || data.size !== row.file_size) throw new WorkspaceError('file_integrity', 409);
    const bytes = new Uint8Array(await data.arrayBuffer());
    if (await sha256(bytes) !== row.file_digest) throw new WorkspaceError('file_integrity', 409);
    return { size: row.file_size, sha256: row.file_digest, mime: row.mime_hint, contents: encodeBytes(bytes) };
  }

  async function remove(userId: string, item: DraftIdentity) {
    const filter = { ...keys({ ...item, userId }), revision: item.revision };
    const { data, error } = await client.from(table).select(columns).match(filter).not('storage_key', 'is', null).maybeSingle();
    if (error) throw error;
    if (!data) return false;
    const row = data as Row;
    if (row.file_state === 'uploading' && Date.now() - Date.parse(row.updated_at) < 5 * 60 * 1000) return false;
    const claim = await client.from(table).update({ file_state: 'deleting' }).match(filter)
      .eq('file_state', row.file_state).select('revision').maybeSingle();
    if (claim.error) throw claim.error;
    if (!claim.data) return false;
    const removed = await bucket.remove([row.storage_key]);
    if (removed.error) throw removed.error;
    const deleted = await client.from(table).delete().match(filter).eq('file_state', 'deleting').select('revision').maybeSingle();
    if (deleted.error) throw deleted.error;
    return !!deleted.data;
  }

  return {
    get, loadBytes, remove,
    async list(scope: ChangeScope) {
      const items: StoredFile[] = [];
      for (let start = 0; ; start += 200) {
        const { data, error } = await client.from(table).select(columns).match(scopeKeys(scope))
          .eq('file_state', 'saved').order('path').order('revision').range(start, start + 199);
        if (error) throw error;
        items.push(...(data as Row[]).map(toStored));
        if (data.length < 200) return items;
      }
    },
    async save(scope: Scope, commit: string, originalBlob: string | null, file: Awaited<ReturnType<typeof validateFile>>,
      check: () => Promise<void>, origin?: StoredFile['origin']) {
      const revision = crypto.randomUUID();
      const object = scope.userId + '/' + revision;
      const row = {
        ...keys(scope), revision, original_commit: commit, original_blob: originalBlob, original_source: '', proposed_source: '',
        file_state: 'uploading', storage_key: object, file_size: file.size, file_digest: file.sha256, mime_hint: file.mime,
        draft_origin: origin ?? null,
      };
      const { error } = await client.from(table).insert(row);
      if (error?.code === '23505') throw new WorkspaceError('draft_conflict', 409, { path: scope.path });
      if (error && ['database_limit', 'file_limit'].includes(error.message)) {
        throw new WorkspaceError(error.message, 409, JSON.parse(error.details || '{}'));
      }
      if (error?.message === 'file_usage_unavailable') throw new WorkspaceError('file_usage_unavailable', 503);
      if (error) throw error;
      try {
        const uploaded = await bucket.upload(object, file.bytes, { contentType: 'application/octet-stream', upsert: false });
        if (uploaded.error) throw new WorkspaceError('file_upload_failed', 503);
        await loadBytes({ ...row, committed_sha: null, updated_at: '', file_state: 'uploading' });
        await check();
      } catch (error) {
        // Keep the reservation if Storage cannot confirm cleanup. Settings can retry it after expiry.
        try {
          const deleted = await bucket.remove([object]);
          if (!deleted.error) await client.from(table).delete().match({ ...keys(scope), revision }).eq('file_state', 'uploading');
        } catch { /* the reservation remains visible for manual cleanup */ }
        throw error;
      }
      const { data, error: savedError } = await client.from(table).update({ file_state: 'saved' })
        .match({ ...keys(scope), revision }).eq('file_state', 'uploading').select(columns).single();
      if (savedError) throw savedError;
      return toStored(data as Row);
    },
    async location(): Promise<ProfilePictureLocation | null> {
      const { data, error } = await client.from('cms_profile_picture_location').select('repository_id,branch,folder,public_prefix')
        .eq('singleton', true).maybeSingle();
      if (error) throw error;
      return data ? { repositoryId: data.repository_id, branch: data.branch, folder: data.folder, publicPrefix: data.public_prefix } : null;
    },
    async saveLocation(location: ProfilePictureLocation) {
      const { error } = await client.from('cms_profile_picture_location').upsert({
        singleton: true, repository_id: location.repositoryId, branch: location.branch,
        folder: location.folder, public_prefix: location.publicPrefix,
      });
      if (error) throw error;
      return location;
    },
  };
}

export type FileDrafts = ReturnType<typeof createFileDrafts>;
