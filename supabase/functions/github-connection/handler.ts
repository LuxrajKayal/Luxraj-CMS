import { positiveId, type GitHub, type Installation } from './github.ts';

type Status = 'disconnected' | 'connected' | 'reconnect_required' | 'revocation_pending';

export interface Connection {
  revision: string;
  status: Status;
  installation_id: number | null;
  app_id: number | null;
  owner_id: number | null;
  owner_login: string | null;
  owner_type: Installation['ownerType'] | null;
  repositories: string[];
  state_hash: string | null;
  initiated_by: string | null;
  initiator_session: string | null;
  expires_at: string | null;
  candidate_id: number | null;
}

export interface ConnectionStore {
  get(): Promise<Connection>;
  update(revision: string, patch: Partial<Connection>): Promise<Connection | null>;
}

interface Dependencies {
  publicUrl: URL;
  appId: number;
  slug: string;
  ownerId: number;
  github: GitHub;
  store: ConnectionStore;
  verify(token: string): Promise<{ userId: string; sessionId: string } | null>;
  isAdmin(userId: string): Promise<boolean>;
}

const clearAttempt = {
  state_hash: null, initiated_by: null, initiator_session: null, expires_at: null, candidate_id: null,
};
const disconnected = {
  ...clearAttempt, status: 'disconnected' as const, installation_id: null, app_id: null,
  owner_id: null, owner_login: null, owner_type: null, repositories: [],
};

async function digest(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
}

function publicStatus(record: Connection) {
  let manageUrl = null;
  if (record.installation_id && record.owner_login) {
    const base = record.owner_type === 'Organization'
      ? `https://github.com/organizations/${encodeURIComponent(record.owner_login)}`
      : 'https://github.com';
    manageUrl = `${base}/settings/installations/${record.installation_id}`;
  }
  return {
    status: record.status,
    owner: record.owner_login,
    repositories: record.status === 'connected' ? record.repositories : [],
    manageUrl,
  };
}

class Conflict extends Error {}

export function createHandler(deps: Dependencies) {
  const { store, github } = deps;

  async function update(record: Connection, patch: Partial<Connection>) {
    const result = await store.update(record.revision, patch);
    if (!result) throw new Conflict();
    return result;
  }

  async function ensureCurrent(record: Connection) {
    if ((await store.get()).revision !== record.revision) throw new Conflict();
  }

  const expected = (installation: Installation | null) => installation !== null &&
    installation.appId === deps.appId && installation.ownerId === deps.ownerId;

  async function status(record: Connection): Promise<Connection> {
    if (!record.installation_id) return record;
    if (record.app_id !== deps.appId || record.owner_id !== deps.ownerId) {
      if (record.status === 'revocation_pending' || record.status === 'reconnect_required') return record;
      return update(record, { status: 'reconnect_required', repositories: [] });
    }

    if (record.status === 'revocation_pending') {
      // A GitHub outage must not hide the manual uninstall link.
      const installation = await github.installation(record.installation_id).catch(() => undefined);
      if (installation === undefined) return record;
      return installation ? record : update(record, disconnected);
    }
    const installation = await github.installation(record.installation_id);
    if (!installation || !expected(installation) || !installation.ready) {
      if (record.status === 'reconnect_required') return record;
      return update(record, { status: 'reconnect_required', repositories: [] });
    }
    // An invalid installation must finish the explicit reconnect flow before use.
    if (record.status === 'reconnect_required') return record;

    await ensureCurrent(record);
    const repositories = await github.repositories(installation);
    if (record.owner_login === installation.owner && record.owner_type === installation.ownerType &&
        JSON.stringify(record.repositories) === JSON.stringify(repositories)) {
      await ensureCurrent(record);
      return record;
    }
    return update(record, { repositories, owner_login: installation.owner, owner_type: installation.ownerType });
  }

  return async function handle(request: Request) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const headers = {
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'Access-Control-Allow-Origin': deps.publicUrl.origin,
      'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      Vary: 'Origin',
    };
    const json = (data: object, code = 200) => Response.json(data, { status: code, headers });
    const redirect = (hash: string) => {
      const target = new URL(deps.publicUrl);
      target.hash = hash;
      return new Response(null, { status: 303, headers: { ...headers, Location: target.href } });
    };

    if (request.method === 'GET' && url.pathname.endsWith('/callback')) {
      try {
        const state = url.searchParams.get('state');
        const id = url.searchParams.get('installation_id');
        if (!state && url.searchParams.get('setup_action') === 'update') return redirect('/settings');
        if (state && /^[\da-f]{64}$/.test(state) && id && /^\d+$/.test(id) && positiveId(Number(id))) {
          const record = await store.get();
          if (record.state_hash === await digest(state) && record.candidate_id === null &&
              record.expires_at && Date.parse(record.expires_at) > Date.now() &&
              record.initiated_by && await deps.isAdmin(record.initiated_by)) {
            await update(record, { candidate_id: Number(id) });
            return redirect('/github/callback');
          }
        }
      } catch {
        // Always return to the configured site without echoing callback parameters.
      }
      return redirect('/github/connect?result=callback_failed');
    }

    if (origin && origin !== deps.publicUrl.origin) return json({ error: 'forbidden' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST' || url.pathname.endsWith('/callback')) {
      return json({ error: 'method_not_allowed' }, 405);
    }

    try {
      const auth = request.headers.get('Authorization')?.match(/^Bearer (\S+)$/i);
      const identity = auth ? await deps.verify(auth[1]) : null;
      if (!identity) return json({ error: 'unauthenticated' }, 401);
      if (!await deps.isAdmin(identity.userId)) return json({ error: 'forbidden' }, 403);

      const body = await request.json().catch(() => null);
      const action = body?.action;
      if (!['status', 'start', 'complete', 'disconnect'].includes(action)) {
        return json({ error: 'invalid_action' }, 400);
      }
      const record = await store.get();
      if (action === 'status') return json(publicStatus(await status(record)));

      if (action === 'start') {
        if (record.status === 'revocation_pending') return json({ error: 'revocation_pending' }, 409);
        const state = crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');
        await update(record, {
          ...clearAttempt,
          state_hash: await digest(state),
          initiated_by: identity.userId,
          initiator_session: identity.sessionId,
          expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
        });
        const installUrl = new URL(`https://github.com/apps/${deps.slug}/installations/new`);
        installUrl.searchParams.set('state', state);
        return json({ installUrl: installUrl.href });
      }

      if (action === 'complete') {
        if (record.initiated_by !== identity.userId || record.initiator_session !== identity.sessionId ||
            !record.state_hash || !record.candidate_id || !record.expires_at ||
            Date.parse(record.expires_at) <= Date.now() || record.status === 'revocation_pending') {
          return json({ error: 'invalid_attempt' }, 409);
        }
        const claimed = await update(record, clearAttempt);
        const installation = await github.installation(record.candidate_id);
        if (!installation || !expected(installation) || !installation.ready) {
          return json({ error: 'invalid_installation' }, 409);
        }
        const repositories = await github.repositories(installation);
        if (!repositories.length) return json({ error: 'invalid_installation' }, 409);
        if (!await deps.isAdmin(identity.userId)) return json({ error: 'forbidden' }, 403);
        const connected = await update(claimed, {
          status: 'connected',
          app_id: installation.appId,
          installation_id: installation.id,
          owner_id: installation.ownerId,
          owner_login: installation.owner,
          owner_type: installation.ownerType,
          repositories,
        });
        return json(publicStatus(connected));
      }

      if (!record.installation_id) return json(publicStatus(await update(record, disconnected)));
      const pending = await update(record, { ...clearAttempt, status: 'revocation_pending', repositories: [] });
      if (pending.app_id === deps.appId && pending.owner_id === deps.ownerId) {
        try {
          await github.uninstall(record.installation_id);
          if (!await github.installation(record.installation_id)) {
            return json(publicStatus(await update(pending, disconnected)));
          }
        } catch {
          // Keep the installation disabled and retain the GitHub settings link.
        }
      }
      return json(publicStatus(pending));
    } catch (error) {
      return error instanceof Conflict ? json({ error: 'conflict' }, 409) : json({ error: 'unavailable' }, 503);
    }
  };
}
