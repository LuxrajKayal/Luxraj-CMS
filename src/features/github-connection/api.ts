import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '../../core/auth/supabase';

export interface ConnectionStatus {
  status: 'disconnected' | 'connected' | 'reconnect_required' | 'revocation_pending';
  owner: string | null;
  repositories: string[];
  manageUrl: string | null;
}

export type ConnectionAction = 'status' | 'start' | 'complete' | 'disconnect';
export type ConnectionStartResult = { installUrl: string } | ConnectionStatus;

export async function githubConnection(action: 'start'): Promise<ConnectionStartResult>;
export async function githubConnection(action: Exclude<ConnectionAction, 'start'>): Promise<ConnectionStatus>;
export async function githubConnection(action: ConnectionAction) {
  if (!supabase) throw new Error('unavailable');
  const { data, error } = await supabase.functions.invoke('github-connection', { body: { action } });
  if (error instanceof FunctionsHttpError) {
    const body = await error.context.json().catch(() => null);
    throw new Error(typeof body?.error === 'string' ? body.error : 'unavailable');
  }
  if (error || !data) throw new Error('unavailable');
  return data;
}

export function connectionError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === 'invalid_installation') {
      return 'GitHub could not verify an active installation for the approved account with the required repository permissions.';
    }
    if (error.message === 'invalid_attempt') {
      return 'This GitHub setup attempt expired or was started in another session. Start again from this session.';
    }
    if (error.message === 'forbidden' || error.message === 'unauthenticated') {
      return 'Sign in as the approved Super Admin to manage the GitHub connection.';
    }
    if (error.message === 'revocation_pending') {
      return 'Finish revoking the previous GitHub installation before reconnecting.';
    }
    if (error.message === 'conflict') {
      return 'The connection changed in another request. Refresh its status and try again.';
    }
  }
  return 'GitHub connection could not be checked. Try again.';
}
