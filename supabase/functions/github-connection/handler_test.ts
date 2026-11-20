import assert from 'node:assert/strict';
import { createHandler, type Connection } from './handler.ts';
import type { GitHub, Installation } from './github.ts';

const publicUrl = new URL('https://owner.github.io/Luxraj-CMS/');
const endpoint = 'https://example.supabase.co/functions/v1/github-connection';
const verified: Installation = {
  id: 42, appId: 100, ownerId: 200, owner: 'approved-org', ownerType: 'Organization', ready: true,
};

function fixture() {
  let admin = true;
  let record: Connection = {
    revision: crypto.randomUUID(), status: 'disconnected',
    installation_id: null, app_id: null, owner_id: null, owner_login: null, owner_type: null,
    repositories: [], state_hash: null, initiated_by: null, initiator_session: null,
    expires_at: null, candidate_id: null,
  };
  const github: GitHub = {
    installation: async id => id === 42 ? verified : null,
    existingInstallation: async () => null,
    repositories: async () => ['approved-org/site'],
    uninstall: async () => {},
  };
  const handler = createHandler({
    publicUrl, appId: 100, ownerId: 200, slug: 'luxraj-cms', github,
    async verify(token) {
      if (token === 'owner' || token === 'other-session') return { userId: 'owner-id', sessionId: token };
      if (token === 'unapproved') return { userId: 'other-id', sessionId: token };
      return null;
    },
    isAdmin: async userId => admin && userId === 'owner-id',
    store: {
      get: async () => structuredClone(record),
      async update(revision, patch) {
        if (revision !== record.revision) return null;
        record = { ...record, ...patch, revision: crypto.randomUUID() };
        return structuredClone(record);
      },
    },
  });

  const post = (action: string, token = 'owner', extras = {}, origin = publicUrl.origin) => handler(
    new Request(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extras }),
    }),
  );
  const callback = (state: string, id = '42') => handler(
    new Request(`${endpoint}/callback?state=${state}&installation_id=${id}&redirect=https://attacker.test`),
  );
  async function start() {
    const result = await post('start');
    assert.equal(result.status, 200);
    const url = new URL((await result.json()).installUrl);
    assert.equal(url.origin, 'https://github.com');
    const state = url.searchParams.get('state');
    assert.ok(state);
    return state;
  }
  async function link() {
    await callback(await start());
    const result = await post('complete');
    assert.equal(result.status, 200);
    return result.json();
  }
  return {
    post, callback, start, link, github,
    record: () => record,
    revokeAdmin: () => { admin = false; },
    expire: () => { record.expires_at = new Date(0).toISOString(); },
  };
}

Deno.test('all API actions require a valid bearer token and current Super Admin role', async () => {
  const { post } = fixture();
  for (const action of ['status', 'start', 'complete', 'disconnect']) {
    assert.equal((await post(action, 'bad')).status, 401);
    assert.equal((await post(action, 'unapproved', { role: 'super_admin' })).status, 403);
    assert.equal((await post(action, 'owner', {}, 'https://attacker.test')).status, 403);
  }
});

Deno.test('callback state is hashed, short-lived, single-use and tied to the starting session', async () => {
  const { start, callback, post, record } = fixture();
  const state = await start();
  assert.notEqual(record().state_hash, state);
  assert.equal(record().state_hash?.length, 64);
  assert.ok(Date.parse(record().expires_at!) - Date.now() <= 600_000);
  assert.equal((await callback('a'.repeat(64))).headers.get('Location'),
    `${publicUrl}#/github/connect?result=callback_failed`);
  const accepted = await callback(state);
  assert.equal(accepted.status, 303);
  assert.equal(accepted.headers.get('Location'), `${publicUrl}#/github/callback`);
  assert.equal(accepted.headers.get('Cache-Control'), 'no-store');
  assert.equal((await callback(state)).headers.get('Location'),
    `${publicUrl}#/github/connect?result=callback_failed`);
  assert.equal((await post('complete', 'other-session')).status, 409);
  const [first, last] = await Promise.all([post('complete'), post('complete')]);
  assert.deepEqual([first.status, last.status].sort(), [200, 409]);
  assert.equal(record().state_hash, null);
});

Deno.test('expired attempts and attempts whose Super Admin was revoked cannot stage a callback', async () => {
  const f = fixture();
  const expired = await f.start();
  f.expire();
  assert.match((await f.callback(expired)).headers.get('Location')!, /callback_failed$/);
  const revoked = await f.start();
  f.revokeAdmin();
  assert.match((await f.callback(revoked)).headers.get('Location')!, /callback_failed$/);
  assert.equal(f.record().candidate_id, null);
});

Deno.test('a GitHub settings update without state returns to Settings without linking', async () => {
  const f = fixture();
  const revision = f.record().revision;
  const response = await f.callback('', '42&setup_action=update');
  assert.equal(response.headers.get('Location'), `${publicUrl}#/settings`);
  assert.equal(f.record().revision, revision);
});

Deno.test('complete verifies owner, app and repository readiness before minting tokens', async () => {
  for (const installation of [
    null,
    { ...verified, appId: 999 },
    { ...verified, ownerId: 999 },
    { ...verified, ready: false },
  ]) {
    const f = fixture();
    f.github.installation = async () => installation;
    f.github.repositories = () => { assert.fail('Must verify installation before requesting scope'); };
    await f.callback(await f.start());
    const response = await f.post('complete', 'owner', { installationId: 123 });
    assert.equal(response.status, 409);
    assert.equal(f.record().status, 'disconnected');
  }
});

Deno.test('the saved connection is reused by a later session and scope reflects GitHub changes', async () => {
  const f = fixture();
  assert.deepEqual(await f.link(), {
    status: 'connected', owner: 'approved-org', repositories: ['approved-org/site'],
    manageUrl: 'https://github.com/organizations/approved-org/settings/installations/42',
  });
  f.github.repositories = async () => ['approved-org/another-site'];
  const response = await f.post('status', 'other-session');
  assert.deepEqual((await response.json()).repositories, ['approved-org/another-site']);
  assert.deepEqual(f.record().repositories, ['approved-org/another-site']);
  f.github.installation = async () => ({ ...verified, ready: false });
  assert.equal((await (await f.post('status')).json()).status, 'reconnect_required');
  assert.deepEqual(f.record().repositories, []);
});

Deno.test('disconnect disables CMS use before uninstall and retains manual recovery during an outage', async () => {
  const f = fixture();
  await f.link();
  f.github.uninstall = async id => {
    assert.equal(id, verified.id);
    assert.equal(f.record().status, 'revocation_pending');
    throw new Error('sensitive upstream error');
  };
  f.github.installation = async () => { throw new Error('GitHub unavailable'); };
  const pending = await (await f.post('disconnect')).json();
  assert.equal(pending.status, 'revocation_pending');
  assert.ok(pending.manageUrl.startsWith('https://github.com/'));
  assert.equal((await (await f.post('status')).json()).status, 'revocation_pending');
  assert.equal((await f.post('start')).status, 409);
  f.github.installation = async () => null;
  assert.equal((await (await f.post('status')).json()).status, 'disconnected');
  assert.equal(f.record().installation_id, null);
});

Deno.test('successful uninstall is confirmed by a fresh GitHub lookup', async () => {
  const f = fixture();
  await f.link();
  f.github.uninstall = async () => { f.github.installation = async () => null; };
  const result = await (await f.post('disconnect')).json();
  assert.equal(result.status, 'disconnected');
  assert.equal(result.manageUrl, null);
});

Deno.test('an in-flight scope check cannot report a connection after a concurrent disconnect', async () => {
  const f = fixture();
  await f.link();
  let release!: (value: string[]) => void;
  let started!: () => void;
  const reading = new Promise<void>(resolve => { started = resolve; });
  f.github.repositories = () => {
    started();
    return new Promise(resolve => { release = resolve; });
  };
  const checking = f.post('status');
  await reading;
  f.github.uninstall = async () => { f.github.installation = async () => null; };
  assert.equal((await (await f.post('disconnect')).json()).status, 'disconnected');
  release(['approved-org/site']);
  assert.equal((await checking).status, 409);
});

Deno.test('existing approved-owner installation reconnects without a second GitHub installation callback', async () => {
  const f = fixture();
  f.github.existingInstallation = async ownerId => {
    assert.equal(ownerId, 200);
    return verified;
  };
  const response = await f.post('start');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: 'connected', owner: 'approved-org', repositories: ['approved-org/site'],
    manageUrl: 'https://github.com/organizations/approved-org/settings/installations/42',
  });
  assert.equal(f.record().installation_id, 42);
  assert.equal(f.record().state_hash, null);
});

Deno.test('existing installation with another owner is never linked', async () => {
  const f = fixture();
  f.github.existingInstallation = async () => ({ ...verified, ownerId: 999 });
  const response = await f.post('start');
  assert.equal(response.status, 200);
  assert.ok((await response.json()).installUrl);
  assert.equal(f.record().installation_id, null);
});
