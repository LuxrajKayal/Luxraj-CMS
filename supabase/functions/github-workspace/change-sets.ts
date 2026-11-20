import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.119.2';
import type { Draft, DraftIdentity, DraftSummary, FileVersion, ManagedDraft } from '../_shared/workspace-contracts.ts';
import { WorkspaceError } from './git.ts';

export type ChangeScope = { userId: string; repositoryId: number; branch: string };
type FileScope = ChangeScope & { path: string };

export interface ChangeSets {
  list(scope: ChangeScope): Promise<DraftSummary[]>;
  get(scope: FileScope): Promise<Draft | null>;
  save(scope: FileScope, base: FileVersion, proposed: string, revision: string | null): Promise<Draft | null>;
  catalog?(userId: string): Promise<Omit<ManagedDraft, 'repository' | 'available'>[]>;
  remove?(userId: string, item: DraftIdentity): Promise<boolean>;
}

type Row = {
  path: string; original_commit: string; original_blob: string; original_source: string;
  proposed_source: string; revision: string; updated_at: string;
};

function draft(row: Row): Draft {
  return {
    path: row.path, originalCommit: row.original_commit, originalBlob: row.original_blob,
    originalSource: row.original_source, proposedSource: row.proposed_source,
    revision: row.revision, updatedAt: row.updated_at,
  };
}

export function createChangeSets(client: SupabaseClient): ChangeSets {
  const table = 'cms_change_set_files';
  const keys = (scope: ChangeScope) => ({
    user_id: scope.userId, repository_id: scope.repositoryId, branch: scope.branch,
  });
  const fileKeys = (scope: FileScope) => ({ ...keys(scope), path: scope.path });
  const conflict = () => new WorkspaceError('draft_conflict', 409);

  async function get(scope: FileScope) {
    const { data, error } = await client.from(table).select('*').match(fileKeys(scope)).is('committed_sha', null).maybeSingle();
    if (error) throw error;
    return data ? draft(data as Row) : null;
  }

  return {
    get,
    async catalog(userId) {
      const files: Omit<ManagedDraft, 'repository' | 'available'>[] = [];
      const pageSize = 200;
      for (let offset = 0; ; offset += pageSize) {
        const { data, error } = await client.from('cms_draft_catalog')
          .select('repository_id,branch,path,revision,updated_at,content_bytes,pending,committed_sha')
          .eq('user_id', userId).order('repository_id').order('branch').order('path').order('revision')
          .range(offset, offset + pageSize - 1);
        if (error) throw error;
        files.push(...data.map(row => ({
          repositoryId: row.repository_id, branch: row.branch, path: row.path, revision: row.revision,
          updatedAt: row.updated_at, contentBytes: row.content_bytes, pending: row.pending, committedSha: row.committed_sha,
        })));
        if (data.length < pageSize) return files;
      }
    },
    async remove(userId, item) {
      const { data, error } = await client.from(table).delete().match(fileKeys({ ...item, userId }))
        .eq('revision', item.revision).select('path').maybeSingle();
      if (error) throw error;
      return !!data;
    },
    async list(scope) {
      const files: DraftSummary[] = [];
      const pageSize = 200;
      for (let offset = 0; ; offset += pageSize) {
        const { data, error } = await client.from('cms_draft_catalog').select('path,updated_at,revision').match(keys(scope)).eq('pending', true)
          .order('path').range(offset, offset + pageSize - 1);
        if (error) throw error;
        files.push(...data.map(row => ({ path: row.path, updatedAt: row.updated_at, revision: row.revision })));
        if (data.length < pageSize) return files;
      }
    },
    async save(scope, base, proposed, revision) {
      const existing = await get(scope);
      if ((existing?.revision ?? null) !== revision) {
        if (existing || !revision) throw conflict();
        const { data, error } = await client.from(table).select('proposed_source').match(fileKeys(scope))
          .eq('revision', revision).not('committed_sha', 'is', null).maybeSingle();
        if (error) throw error;
        if (data?.proposed_source !== base.source) throw conflict();
      }
      if (!existing && base.source === proposed) return null;
      if (existing?.proposedSource === proposed) return existing;

      const values = { proposed_source: proposed, revision: crypto.randomUUID(), updated_at: new Date().toISOString() };
      const result = existing
        ? await client.from(table).update(values).match(fileKeys(scope)).eq('revision', existing.revision)
          .is('committed_sha', null).select('*').maybeSingle()
        : await client.from(table).insert({
          ...fileKeys(scope), ...values, original_commit: base.commit, original_blob: base.blob, original_source: base.source,
        }).select('*').maybeSingle();
      if (result.error?.code === '23505') throw conflict();
      if (result.error?.code === 'P0001' && result.error.message === 'database_limit') {
        const { usedBytes, limitBytes } = JSON.parse(result.error.details ?? '{}');
        throw new WorkspaceError('database_limit', 409, { usedBytes, limitBytes });
      }
      if (result.error) throw result.error;
      if (!result.data) throw conflict();
      return draft(result.data as Row);
    },
  };
}
