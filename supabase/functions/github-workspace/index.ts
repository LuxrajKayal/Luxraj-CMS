import { createClient } from 'npm:@supabase/supabase-js@2.119.2';
import { createGitHub, positiveId } from '../github-connection/github.ts';
import { createWorkspaceGit, WorkspaceError } from './git.ts';
import { createWorkspaceHandler } from './handler.ts';
import { createChangeSets } from './change-sets.ts';

function env(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error('Workspace configuration is incomplete.');
  return value;
}

function configure() {
  const origin = new URL(env('CMS_PUBLIC_URL')).origin;
  const appId = Number(env('GITHUB_APP_ID'));
  const ownerId = Number(env('GITHUB_INSTALLATION_OWNER_ID'));
  if (!positiveId(appId) || !positiveId(ownerId)) throw new Error('Invalid GitHub configuration.');
  const github = createGitHub(appId, env('GITHUB_APP_PRIVATE_KEY'));
  const client = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  async function connection() {
    const { data, error } = await client.from('cms_github_connection')
      .select('status, installation_id, app_id, owner_id, revision').eq('singleton', true).single();
    if (error) throw error;
    if (data.status !== 'connected' || data.app_id !== appId || data.owner_id !== ownerId ||
        !positiveId(data.installation_id)) throw new WorkspaceError('connection_required', 409);
    return data;
  }

  return createWorkspaceHandler({
    origin,
    changes: createChangeSets(client),
    async authenticate(token) {
      const { data, error } = await client.auth.getUser(token);
      return error || !data.user || data.user.is_anonymous ? null : data.user.id;
    },
    async isAdmin(userId) {
      const { data, error } = await client.from('cms_user_roles').select('role')
        .eq('user_id', userId).eq('role', 'super_admin').maybeSingle();
      if (error) throw error;
      return data?.role === 'super_admin';
    },
    async openGit() {
      const saved = await connection();
      const installation = await github.installation(saved.installation_id);
      if (!installation?.ready || installation.id !== saved.installation_id ||
          installation.appId !== appId || installation.ownerId !== ownerId) {
        throw new WorkspaceError('connection_required', 409);
      }
      async function checkConnection() {
        if ((await connection()).revision !== saved.revision) {
          throw new WorkspaceError('connection_changed', 409);
        }
      }
      await checkConnection();
      const metadata = createWorkspaceGit(await github.workspace(installation));
      return {
        repositories: metadata.repositories,
        async forRepository(repositoryId) {
          await checkConnection();
          return createWorkspaceGit(await github.workspace(installation, repositoryId));
        },
        checkConnection,
      };
    },
    async getPreference(userId) {
      const { data, error } = await client.from('cms_workspace_preferences')
        .select('repository_id, branch').eq('user_id', userId).maybeSingle();
      if (error) throw error;
      return data ? { repositoryId: data.repository_id, branch: data.branch } : null;
    },
    async savePreference(userId, selection) {
      const { error } = await client.from('cms_workspace_preferences').upsert({
        user_id: userId, repository_id: selection.repositoryId, branch: selection.branch,
      });
      if (error) throw error;
    },
  });
}

let handler: ReturnType<typeof configure> | undefined;
Deno.serve(request => {
  try {
    handler ??= configure();
    return handler(request);
  } catch {
    return Response.json({ error: 'unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
});
