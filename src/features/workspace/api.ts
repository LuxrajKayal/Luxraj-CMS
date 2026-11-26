import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '../../core/auth/supabase';
import type { MemberCalls, MemberRequest } from '../../../supabase/functions/_shared/member-contracts';
import type {
  CodeCatalog, CodeGroup, CodeTemplate, CommitLimit, InjectorHtmlMatches,
  CommitDetail, CommittedDiff, CommitReceipt, CommitReview, Directory, Draft, DraftDeletion, DraftSummary, HistoryPage, HtmlDiscovery,
  ManagedDraft, OpenDraft, SavedDraft, SourceFile, StorageUsage, Workspace, WorkspaceRequest,
  StoredFile, FileComparison, FileInspection, ProfilePictureLocation,
  WebsiteControl, WebsiteLaunch, FilePayload, MaintenanceResult,
} from '../../../supabase/functions/_shared/workspace-contracts';

export type { Directory, Repository, Selection, TreeEntry, Workspace } from '../../../supabase/functions/_shared/workspace-contracts';

type Responses = {
  load: Workspace; select: Workspace; tree: Directory; file: SourceFile;
  discover_html: HtmlDiscovery;
  discover_sources: HtmlDiscovery; scan_injector_html: InjectorHtmlMatches;
  injector_catalog: CodeCatalog; injector_template_add: CodeTemplate; injector_template_update: CodeTemplate; injector_group_add: CodeGroup;
  commit_limit: CommitLimit; save_commit_limit: CommitLimit;
  open_draft: OpenDraft; save_draft: SavedDraft; changes: { files: DraftSummary[]; maximumFiles?: number };
  diff: Draft | { kind: 'file'; revision: string };
  file_manager_tree: Directory; file_inspect: FileInspection; file_save: { draft: StoredFile };
  profile_picture_stage: { draft: StoredFile }; file_drafts: { drafts: StoredFile[] }; file_comparison: FileComparison;
  profile_picture_location: { location: ProfilePictureLocation | null };
  save_profile_picture_location: { location: ProfilePictureLocation };
  verify_profile_picture: { url: string; sha256: string; committedSha: string };
  draft_catalog: { files: ManagedDraft[] }; delete_drafts: { results: DraftDeletion[] };
  pending_count: { count: number };
  website_maintenance: MaintenanceResult;
  website_list: { controls: WebsiteControl[] }; website_register: { control: WebsiteControl };
  website_launch: WebsiteLaunch; website_input: { file: FilePayload };
  storage_status: StorageUsage; storage_save: StorageUsage;
  review_commit: CommitReview; confirm_commit: CommitReceipt; reconcile_commit: CommitReceipt; history: HistoryPage;
  release_commit: { released: true };
  commit_detail: CommitDetail; commit_diff: CommittedDiff;
};

export function formatMb(bytes: number) {
  return `${(bytes / 1_000_000).toFixed(2)} MB`;
}

export const pendingChangesEvent = 'luxraj:pending-changes';
const draftActions = new Set(['select', 'save_draft', 'file_save', 'profile_picture_stage', 'people_stage_picture', 'delete_drafts',
  'confirm_commit', 'reconcile_commit', 'website_maintenance', 'people_force_complete']);

export async function workspaceRequest<T extends WorkspaceRequest>(body: T, signal?: AbortSignal) {
  return invokeWorkspace<Responses[T['action']]>(body, signal);
}

export async function memberRequest<T extends MemberRequest>(body: T, signal?: AbortSignal) {
  return invokeWorkspace<MemberCalls[T['action']][1]>(body, signal);
}

async function invokeWorkspace<Response>(body: WorkspaceRequest | MemberRequest, signal?: AbortSignal) {
  if (!supabase) throw new Error('unavailable');
  const { data, error } = await supabase.functions.invoke<Response>('github-workspace', { body, signal });
  if (error instanceof FunctionsHttpError) {
    const payload = await error.context.json().catch(() => null);
    if (payload?.error === 'file_limit' && Number.isFinite(payload.usedBytes) && Number.isFinite(payload.limitBytes)) {
      throw new Error('file_limit:' + formatMb(payload.usedBytes) + ' used or reserved of ' + formatMb(payload.limitBytes) +
        '. Delete unused uploads in Draft Management or adjust the allocation in Storage Management.');
    }
    if (payload?.error === 'commit_limit_exceeded' && Number.isInteger(payload.maximumFiles)) {
      throw new Error('commit_limit_exceeded:' + payload.maximumFiles);
    }
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
  if (draftActions.has(body.action)) window.dispatchEvent(new Event(pendingChangesEvent));
  return data;
}

const errors = {
  member_forbidden: 'This account has no active CMS workspace.',
  member_invalid: 'Check the required account, application or task fields.',
  member_unavailable: 'This account or file is no longer available.',
  member_password: 'Assign a password between 8 and 256 characters.',
  member_account_create: 'Supabase could not create the account. Check the email and password requirements, then try again.',
  member_account_update: 'Supabase did not accept the email update. Check for another account with that email.',
  member_account_partial: 'Supabase created the sign-in account but the profile could not be saved. Open Modify Existing User to finish setup.',
  member_delete_failed: 'Deletion could not be confirmed. The workspace stays disabled. Retry deletion from Users & Permissions.',
  assignment_revoked: 'This application is no longer assigned. Refresh your workstation.',
  assignment_exists: 'This user already has an assignment for this application, repository and branch.',
  member_file_forbidden: 'Choose a file supplied with this application assignment.',
  task_has_publish_drafts: 'Discard the uncommitted linked publishing drafts in Source Control before deleting this task.',
  member_file_linked: 'Unlink this draft from active tasks first. Submitted snapshots cannot be deleted.',
  member_file_conflict: 'This draft identifier already refers to other content.',
  member_storage_limit: 'The CMS PostgreSQL storage allocation has been reached.',
  task_files_invalid: 'Select your own saved work drafts for this task.',
  task_unavailable: 'This task can no longer be submitted. Refresh the task list.',
  force_reason_required: 'Enter a reason for forced completion.',
  task_review_stale: 'This submission has changed or is already in commit review. Refresh the task before continuing.',
  picture_review_stale: 'The profile picture changed or is already in review. Refresh the account before continuing.',
  review_in_progress: 'A linked GitHub review is still being verified. Finish that review first.',
  duplicate_task_id: 'A task already uses this minute’s Task ID. Wait until the next minute and try again.',
  commit_release_blocked: 'Release requires an unrecorded linked review at least ten minutes old and an unchanged GitHub branch head. If the commit exists, verify its SHA instead.',
  invalid_website_control: 'Enter a name, a repository HTML application and valid, distinct repository paths.',
  website_control_missing: 'This control was cleared or belongs to another workspace. Reopen Website Controls.',
  website_file_too_large: 'This application or input exceeds the existing 8 MiB file limit.',
  website_application_encoding: 'Save the application as UTF-8 HTML to run it.',
  invalid_maintenance: 'Choose a valid maintenance operation.',
  invalid_file_upload: 'Choose a file of at most 8 MiB and a valid destination.',
  file_path_collision: 'This name conflicts with a folder, link, executable file, or a differently spelled path.',
  file_integrity: 'The file bytes could not be verified. Reload the file or stage it again.',
  file_unavailable: 'The file draft is unavailable for this workspace.',
  file_unchanged: 'The upload has the same bytes as the current GitHub file.',
  file_upload_failed: 'Private Storage did not accept the upload. Check the project upload limits and try again.',
  file_usage_unavailable: 'File Storage usage is unavailable. Uploads resume when usage can be verified.',
  invalid_public_prefix: 'Enter an HTTPS asset URL prefix without credentials, a query, or a fragment.',
  invalid_profile_destination: 'Choose the configured repository, branch and folder, with a .webp destination.',
  invalid_profile_image: 'Choose a valid WebP picture between 15 KB and 150 KB.',
  profile_image_uncommitted: 'Commit the staged WebP through Source Control before verifying the website image.',
  connection_required: 'Connect an active GitHub App in Settings to open the workspace.',
  connection_changed: 'The GitHub connection changed. Refresh the workspace and try again.',
  repository_out_of_scope: 'This repository is no longer available to the GitHub App. Refresh the workspace.',
  branch_not_found: 'This branch is no longer available. Refresh the workspace to choose a branch.',
  remote_missing: 'This branch or path is no longer available. Refresh the workspace.',
  selection_changed: 'The saved repository or branch changed. Refresh the workspace to open the current selection.',
  branch_changed: 'This branch received new changes. Refresh the file tree or History, then review your changes again.',
  unsupported_file: 'This file is unavailable or is not supported UTF-8 text source.',
  unsupported_history_file: 'A text diff is unavailable for this change. History supports UTF-8 files with a readable before or after version.',
  file_too_large: 'This file exceeds the 1 MiB preview limit.',
  directory_too_large: 'GitHub returned an incomplete listing for this directory.',
  list_too_large: 'GitHub returned too many results to read the complete list.',
  unauthenticated: 'Sign in again to use the workspace.',
  forbidden: 'Only the approved Super Admin can use the workspace.',
  draft_conflict: 'This draft changed in another session. Reopen the saved draft before saving again.',
  invalid_request: 'This change could not be saved. Source must be UTF-8 text of at most 1 MiB.',
  invalid_storage_limits: 'Use whole megabytes within the PostgreSQL and File Storage ceilings.',
  invalid_commit_review: 'Select saved changes within the commit limit and enter a commit message of up to 1,000 characters.',
  invalid_commit_limit: 'Enter a whole number from 1 to 100.',
  catalog_name_taken: 'A saved item already uses this name.',
  catalog_members: 'One or more templates are unavailable. Reload the catalog and try again.',
  catalog_missing: 'This template is no longer available. Reload the catalog before editing.',
  invalid_catalog_input: 'Enter a name and valid content. Template source must fit within 1 MiB.',
  commit_file_conflict: 'A selected file changed on GitHub. Compare the current source and prepare a new draft before committing.',
  commit_file_mode: 'Commit this executable file in Git to preserve its executable permission.',
  commit_too_large: 'This commit exceeds the 8 MiB total file limit. Review fewer changes at once.',
  commit_unknown: 'GitHub did not confirm the outcome. Refresh History and check the branch before starting a new review.',
  commit_unverified: 'Could not verify this GitHub commit against the original review. The saved drafts were not changed.',
  commit_rejected: 'GitHub rejected the commit. Check branch protection, repository permissions, and the selected files.',
  review_expired: 'This review expired or has already been submitted. Check History, then start a new review if needed.',
  commit_out_of_scope: 'This commit is no longer reachable from the selected branch.',
};

export function workspaceError(error: unknown) {
  const code = error instanceof Error ? error.message : '';
  if (code.startsWith('file_limit:')) return 'File Storage allocation reached. ' + code.slice('file_limit:'.length);
  if (/^commit_limit_exceeded:\d+$/.test(code)) {
    return 'The current limit is ' + code.split(':')[1] + ' files per commit. Refresh changes and select a smaller batch.';
  }
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
