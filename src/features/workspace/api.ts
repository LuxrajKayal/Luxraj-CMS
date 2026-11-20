import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '../../core/auth/supabase';
import type {
  Directory, SourceFile, Workspace, WorkspaceRequest,
} from '../../../supabase/functions/_shared/workspace-contracts';

export type { Directory, Repository, Selection, TreeEntry, Workspace } from '../../../supabase/functions/_shared/workspace-contracts';

type Responses = { load: Workspace; select: Workspace; tree: Directory; file: SourceFile };

export async function workspaceRequest<T extends WorkspaceRequest>(body: T, signal?: AbortSignal) {
  if (!supabase) throw new Error('unavailable');
  const { data, error } = await supabase.functions.invoke<Responses[T['action']]>('github-workspace', { body, signal });
  if (error instanceof FunctionsHttpError) {
    const payload = await error.context.json().catch(() => null);
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
  branch_changed: 'This branch received new changes. Refresh the file tree before opening files.',
  unsupported_file: 'This file is unavailable or is not supported UTF-8 HTML, CSS, or JavaScript source.',
  file_too_large: 'This file exceeds the 1 MiB preview limit.',
  directory_too_large: 'GitHub returned an incomplete listing for this directory.',
  list_too_large: 'GitHub returned too many results to read the complete list.',
  unauthenticated: 'Sign in again to use the workspace.',
  forbidden: 'Only the approved Super Admin can use the workspace.',
};

export function workspaceError(error: unknown) {
  const code = error instanceof Error ? error.message : '';
  return Object.hasOwn(errors, code)
    ? errors[code as keyof typeof errors]
    : 'The GitHub workspace could not be loaded. Try again.';
}
