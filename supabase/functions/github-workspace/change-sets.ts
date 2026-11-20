import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.119.2';
import type { Draft, DraftSummary, FileVersion } from '../_shared/workspace-contracts.ts';
import { WorkspaceError } from './git.ts';

export type ChangeScope = { userId: string; repositoryId: number; branch: string };
type FileScope = ChangeScope & { path: string };

export interface ChangeSets {
  list(scope: ChangeScope): Promise<DraftSummary[]>;
  get(scope: FileScope): Promise<Draft | null>;
  save(scope: FileScope, base: FileVersion, proposed: string, revision: string | null): Promise<Draft | null>;
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
    const { data, error } = await client.from(table).select('*').match(fileKeys(scope)).maybeSingle();
    if (error) throw error;
    return data ? draft(data as Row) : null;
  }

  return {
    get,
    async list(scope) {
      const files: DraftSummary[] = [];
      const pageSize = 200;
      for (let offset = 0; ; offset += pageSize) {
        const { data, error } = await client.from(table).select('path,updated_at').match(keys(scope))
          .order('path').range(offset, offset + pageSize - 1);
        if (error) throw error;
        files.push(...data.map(row => ({ path: row.path, updatedAt: row.updated_at })));
        if (data.length < pageSize) return files;
      }
    },
    async save(scope, base, proposed, revision) {
      const existing = await get(scope);
      if ((existing?.revision ?? null) !== revision) throw conflict();
      if ((existing?.originalSource ?? base.source) === proposed) {
        if (!existing) return null;
        const { data, error } = await client.from(table).delete().match(fileKeys(scope))
          .eq('revision', existing.revision).select('path').maybeSingle();
        if (error) throw error;
        if (!data) throw conflict();
        return null;
      }

      const values = { proposed_source: proposed, revision: crypto.randomUUID(), updated_at: new Date().toISOString() };
      const result = existing
        ? await client.from(table).update(values).match(fileKeys(scope)).eq('revision', existing.revision).select('*').maybeSingle()
        : await client.from(table).insert({
          ...fileKeys(scope), ...values, original_commit: base.commit, original_blob: base.blob, original_source: base.source,
        }).select('*').maybeSingle();
      if (result.error?.code === '23505') throw conflict();
      if (result.error) throw result.error;
      if (!result.data) throw conflict();
      return draft(result.data as Row);
    },
  };
}
