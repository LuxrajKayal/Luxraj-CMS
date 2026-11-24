import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.119.2';
import { positiveId } from '../github-connection/github.ts';
import { decodeBytes, filePath } from '../_shared/file-bytes.ts';
import type { DraftIdentity, Selection, WebsiteRegistration, WorkspaceRequest } from '../_shared/workspace-contracts.ts';
import type { ChangeScope } from './change-sets.ts';
import { isBranch, isCommit, WorkspaceError, type WorkspaceGit } from './git.ts';

const actions = new Set(['website_list', 'website_register', 'website_launch', 'website_input']);
const uuid = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i;
const validPath = (value: unknown): value is string =>
  typeof value === 'string' && !!value && filePath(value.split('/'));
const paths = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(validPath) && new Set(value).size === value.length;
type Row = { id: string } & WebsiteRegistration;
const columns = 'id,name,application,inputs,destinations';

export function createWebsiteStore(client: SupabaseClient) {
  const table = 'cms_website_controls';
  const keys = ({ userId, repositoryId, branch }: ChangeScope) => ({ user_id: userId, repository_id: repositoryId, branch });
  return {
    async list(scope: ChangeScope) {
      const controls: Row[] = [];
      for (let start = 0; ; start += 200) {
        const { data, error } = await client.from(table).select(columns).match(keys(scope)).order('id').range(start, start + 199);
        if (error) throw error;
        controls.push(...data);
        if (data.length < 200) return controls;
      }
    },
    async get(scope: ChangeScope, id: string) {
      const { data, error } = await client.from(table).select(columns).match(keys(scope)).eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    },
    async add(scope: ChangeScope, registration: WebsiteRegistration) {
      const { data, error } = await client.from(table).insert({ ...keys(scope), ...registration }).select(columns).single();
      if (error) throw error;
      return data;
    },
  };
}

export async function websiteControls(body: Record<string, unknown> | null, userId: string, deps: {
  website?: ReturnType<typeof createWebsiteStore>;
  isAdmin(id: string): Promise<boolean>;
  getPreference(id: string): Promise<Selection | null>;
  openGit(): Promise<{
    repositories: WorkspaceGit['repositories'];
    forRepository(id: number): Promise<WorkspaceGit>;
    checkConnection(): Promise<void>;
  }>;
}) {
  if (typeof body?.action !== 'string' || !actions.has(body.action)) return;
  const request = body as Extract<WorkspaceRequest, { action: 'website_list' | 'website_register' | 'website_launch' | 'website_input' }>;
  const { repositoryId, branch, action } = request;
  const store = deps.website;
  if (!store) throw new Error('Website Controls unavailable.');
  if (!positiveId(repositoryId) || !isBranch(branch)) throw new WorkspaceError('invalid_website_control', 400);
  const scope = { userId, repositoryId, branch };

  async function checkScope() {
    const selected = await deps.getPreference(userId);
    if (selected?.repositoryId !== repositoryId || selected.branch !== branch) throw new WorkspaceError('selection_changed', 409);
    if (!await deps.isAdmin(userId)) throw new WorkspaceError('forbidden', 403);
  }
  await checkScope();
  const remote = await deps.openGit();
  const repository = (await remote.repositories()).find(item => item.id === repositoryId);
  if (!repository) throw new WorkspaceError('repository_out_of_scope', 403);
  async function check() {
    await remote.checkConnection();
    await checkScope();
  }
  if (action === 'website_list') {
    const controls = await store.list(scope);
    await check();
    return { controls };
  }
  const git = await remote.forRepository(repositoryId);
  if (action === 'website_register') {
    const { name, application, inputs, destinations } = request.registration ?? {};
    if (typeof name !== 'string' || !name.trim() || name.length > 100 || name.includes('\0') ||
        !validPath(application) || !/\.html$/i.test(application) || !paths(inputs) || !paths(destinations)) {
      throw new WorkspaceError('invalid_website_control', 400);
    }
    const commit = await git.requireBranch(repository, branch);
    for (const path of new Set([application, ...inputs])) {
      await git.websiteFile(repository, branch, path.split('/'), commit, false);
    }
    await check();
    return { control: await store.add(scope, { name: name.trim(), application, inputs, destinations }) };
  }

  if (typeof request.id !== 'string' || !uuid.test(request.id)) throw new WorkspaceError('invalid_website_control', 400);
  const control = await store.get(scope, request.id);
  if (!control) throw new WorkspaceError('website_control_missing', 404);
  const path = action === 'website_launch' ? control.application : request.path;
  const commit = action === 'website_launch' ? await git.requireBranch(repository, branch) : request.commit;
  if (!validPath(path) || !isCommit(commit)) throw new WorkspaceError('invalid_website_control', 400);
  const file = await git.websiteFile(repository, branch, path.split('/'), commit, true);
  if (!file || file.contents === null) throw new WorkspaceError('website_file_too_large', 422);
  await check();
  if (action === 'website_input') return { file };
  try {
    // HTML must be safe to transmit as text; associated inputs retain exact bytes.
    const source = new TextDecoder('utf-8', { fatal: true }).decode(decodeBytes(file.contents));
    return { commit, source, control };
  } catch {
    throw new WorkspaceError('website_application_encoding', 422);
  }
}

export function createMaintenanceStore(client: SupabaseClient) {
  async function count(userId: string, selection?: Selection): Promise<number> {
    const query = client.from('cms_draft_catalog').select('revision', { count: 'exact', head: true }).eq('user_id', userId);
    if (selection) query.eq('repository_id', selection.repositoryId).eq('branch', selection.branch).eq('pending', true);
    const { count, error } = await query;
    if (error || count === null) throw error ?? new Error('Draft count unavailable.');
    return count;
  }
  return {
    count,
    async page(userId: string, after?: string) {
      const query = client.from('cms_draft_catalog').select('repository_id,branch,path,revision,file_state')
        .eq('user_id', userId).order('revision').limit(16);
      const { data, error } = await (after ? query.gt('revision', after) : query);
      if (error) throw error;
      return data.map(({ repository_id, branch, path, revision, file_state }) => ({
        repositoryId: repository_id, branch, path, revision, stored: file_state !== null,
      }));
    },
    async reset(userId: string, fullReset: boolean) {
      const { error } = await client.rpc('cms_reset_website_preferences', { actor: userId, full_reset: fullReset });
      if (error) throw error;
    },
  };
}

export async function runMaintenance(
  body: Record<string, unknown>, userId: string, store: ReturnType<typeof createMaintenanceStore>,
  remove: (item: DraftIdentity, stored: boolean) => Promise<boolean>,
  checkAdmin: () => Promise<boolean>,
) {
  const { mode, after } = body;
  if (typeof mode !== 'string' || !['controls', 'drafts', 'all'].includes(mode) ||
      (after !== undefined && (mode === 'controls' || typeof after !== 'string' || !uuid.test(after)))) {
    throw new WorkspaceError('invalid_maintenance', 400);
  }
  const check = async () => {
    if (!await checkAdmin()) throw new WorkspaceError('forbidden', 403);
  };
  if (mode === 'controls') {
    await check();
    await store.reset(userId, false);
    return { deleted: 0, next: null, remaining: null, reset: true };
  }
  const page = await store.page(userId, typeof after === 'string' ? after : undefined);
  const batch = page.slice(0, 15);
  let deleted = 0;
  for (const { stored, ...item } of batch) {
    await check();
    try {
      if (await remove(item, stored)) deleted++;
    } catch {
      // Storage may have rejected a deletion. The remaining count exposes the retryable row.
    }
  }
  if (page.length > batch.length) return { deleted, next: batch.at(-1)!.revision, remaining: null, reset: false };
  const remaining = await store.count(userId);
  const reset = mode === 'all' && remaining === 0;
  if (reset) {
    await check();
    await store.reset(userId, true);
  }
  return { deleted, next: null, remaining, reset };
}
