import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '../../core/auth/supabase';
import type {
  CommitDetail, CommittedDiff, CommitReceipt, CommitReview, Directory, Draft, DraftDeletion, DraftSummary, HistoryPage,
  ManagedDraft, OpenDraft, SavedDraft, SourceFile, StorageUsage, Workspace, WorkspaceRequest,
} from '../../../supabase/functions/_shared/workspace-contracts';

export type { Directory, Repository, Selection, TreeEntry, Workspace } from '../../../supabase/functions/_shared/workspace-contracts';

type Responses = {
  load: Workspace; select: Workspace; tree: Directory; file: SourceFile;
  open_draft: OpenDraft; save_draft: SavedDraft; changes: { files: DraftSummary[] }; diff: Draft;
  draft_catalog: { files: ManagedDraft[] }; delete_drafts: { results: DraftDeletion[] };
  storage_status: StorageUsage; storage_save: StorageUsage;
  review_commit: CommitReview; confirm_commit: CommitReceipt; history: HistoryPage;
  commit_detail: CommitDetail; commit_diff: CommittedDiff;
};

export function formatMb(bytes: number) {
  return `${(bytes / 1_000_000).toFixed(2)} MB`;
}

export async function workspaceRequest<T extends WorkspaceRequest>(body: T, signal?: AbortSignal) {
  if (!supabase) throw new Error('unavailable');
  const { data, error } = await supabase.functions.invoke<Responses[T['action']]>('github-workspace', { body, signal });
  if (error instanceof FunctionsHttpError) {
    const payload = await error.context.json().catch(() => null);
    if (['commit_file_conflict', 'commit_file_mode', 'draft_conflict'].includes(payload?.error) && typeof payload.path === 'string') {
      throw new Error(`${payload.error}:${payload.path}`);
    }
    if (payload?.error === 'database_limit' && Number.isFinite(payload.usedBytes) && Number.isFinite(payload.limitBytes)) {
      throw new Error(
        `database_limit:${formatMb(payload.usedBytes)} used of ${formatMb(payload.limitBytes)}. Delete saved drafts manually in Settings or adjust the allocation in Storage Management.`,
      );
    }
    throw new Error(typeof payload?.error === 'string' ? payload.error : 'unavailable');
  }
  if (error || !data) throw new Error('unavailable');
  return data;
}

const errors = {
  connection_required: 'Connect an active GitHub App in Settings to open the workspace.',
  connection_changed: 'The GitHub connection changed. Refresh the workspace and try again.',
  repository_out_of_scope: 'This repository is no longer available to the GitHub App. Refresh the workspace.',
  branch_not_found: 'This branch is no longer available. Refresh the workspace to choose a branch.',
  remote_missing: 'This branch or path is no longer available. Refresh the workspace.',
  selection_changed: 'The saved repository or branch changed. Refresh the workspace to open the current selection.',
  branch_changed: 'This branch received new changes. Refresh the file tree or History, then review your changes again.',
  unsupported_file: 'This file is unavailable or is not supported UTF-8 HTML, CSS, or JavaScript source.',
  unsupported_history_file: 'A text diff is unavailable for this change. History supports UTF-8 files with a readable before or after version.',
  file_too_large: 'This file exceeds the 1 MiB preview limit.',
  directory_too_large: 'GitHub returned an incomplete listing for this directory.',
  list_too_large: 'GitHub returned too many results to read the complete list.',
  unauthenticated: 'Sign in again to use the workspace.',
  forbidden: 'Only the approved Super Admin can use the workspace.',
  draft_conflict: 'This draft changed in another session. Reopen the saved draft before saving again.',
  invalid_request: 'This change could not be saved. Source must be UTF-8 text of at most 1 MiB.',
  invalid_storage_limits: 'Use whole megabytes within the PostgreSQL and File Storage ceilings.',
  invalid_commit_review: 'Select up to 20 saved changes and enter a commit message of up to 1,000 characters.',
  commit_file_conflict: 'A selected file changed on GitHub. Compare the current source and prepare a new draft before committing.',
  commit_file_mode: 'Commit this executable file in Git to preserve its executable permission.',
  commit_too_large: 'This commit exceeds the 8 MiB source limit. Review fewer changes at once.',
  commit_unknown: 'GitHub did not confirm the outcome. Refresh History and check the branch before starting a new review.',
  commit_rejected: 'GitHub rejected the commit. Check branch protection, repository permissions, and the selected files.',
  review_expired: 'This review expired or has already been submitted. Check History, then start a new review if needed.',
  commit_out_of_scope: 'This commit is no longer reachable from the selected branch.',
};

export function workspaceError(error: unknown) {
  const code = error instanceof Error ? error.message : '';
  if (code.startsWith('database_limit:')) return `PostgreSQL storage limit reached. ${code.slice('database_limit:'.length)}`;
  const separator = code.indexOf(':');
  if (separator > 0 && ['commit_file_conflict', 'commit_file_mode', 'draft_conflict'].includes(code.slice(0, separator))) {
    const category = code.slice(0, separator) as 'commit_file_conflict' | 'commit_file_mode' | 'draft_conflict';
    return `${code.slice(separator + 1)}. ${errors[category]}`;
  }
  return Object.hasOwn(errors, code)
    ? errors[code as keyof typeof errors]
    : 'The GitHub workspace could not be loaded. Try again.';
}
