import { createClient } from 'npm:@supabase/supabase-js@2.119.2';
import { createGitHub, positiveId } from './github.ts';
import { createHandler, type Connection, type ConnectionStore } from './handler.ts';

function required(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error('GitHub connection configuration is incomplete.');
  return value;
}

function configure() {
  const publicUrl = new URL(required('CMS_PUBLIC_URL'));
  const localHttp = publicUrl.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(publicUrl.hostname);
  const slug = required('GITHUB_APP_SLUG');
  const appId = Number(required('GITHUB_APP_ID'));
  const ownerId = Number(required('GITHUB_INSTALLATION_OWNER_ID'));
  if ((publicUrl.protocol !== 'https:' && !localHttp) || publicUrl.username || publicUrl.password ||
      publicUrl.search || publicUrl.hash || !publicUrl.pathname.endsWith('/') ||
      !/^[a-z\d][a-z\d-]*$/i.test(slug) || !positiveId(appId) || !positiveId(ownerId)) {
    throw new Error('GitHub connection configuration is invalid.');
  }

  const client = createClient(required('SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const store: ConnectionStore = {
    async get() {
      const { data, error } = await client.from('cms_github_connection').select('*').eq('singleton', true).single();
      if (error) throw error;
      return data as Connection;
    },
    async update(revision, patch) {
      const { data, error } = await client.from('cms_github_connection')
        .update({ ...patch, revision: crypto.randomUUID() })
        .eq('singleton', true).eq('revision', revision).select('*').maybeSingle();
      if (error) throw error;
      return data as Connection | null;
    },
  };

  return createHandler({
    publicUrl, slug, appId, ownerId, store,
    github: createGitHub(appId, required('GITHUB_APP_PRIVATE_KEY')),
    async verify(token) {
      const { data, error } = await client.auth.getUser(token);
      if (error || !data.user || data.user.is_anonymous) return null;
      const verification = await client.auth.getClaims(token);
      const claims = verification.data?.claims;
      if (verification.error || claims?.sub !== data.user.id || claims.role !== 'authenticated' ||
          typeof claims.session_id !== 'string' ||
          !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(claims.session_id)) return null;
      return { userId: data.user.id, sessionId: claims.session_id };
    },
    async isAdmin(userId) {
      const { data, error } = await client.from('cms_user_roles').select('role')
        .eq('user_id', userId).eq('role', 'super_admin').maybeSingle();
      if (error) throw error;
      return data?.role === 'super_admin';
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
