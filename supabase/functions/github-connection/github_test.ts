import assert from 'node:assert/strict';
import { generateKeyPairSync, verify } from 'node:crypto';
import { createGitHub } from './github.ts';

Deno.test('GitHub requests sign an App JWT and keep short-lived tokens within installation API calls', async () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const installationToken = 'mock-installation-token';
  let requestCount = 0;
  const github = createGitHub(10, privateKey.export({ format: 'pem', type: 'pkcs1' }).toString(), async (input, init) => {
    requestCount += 1;
    const url = new URL(String(input));
    assert.equal(url.origin, 'https://api.github.com');
    const bearer = new Headers(init?.headers).get('Authorization')?.slice(7);
    if (url.pathname.startsWith('/app/')) {
      assert.ok(bearer);
      const [header, claims, signature] = bearer.split('.');
      const decode = (part: string) => JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
      assert.equal(decode(header).alg, 'RS256');
      assert.equal(decode(claims).iss, '10');
      assert.ok(decode(claims).exp - decode(claims).iat < 600);
      assert.ok(verify('RSA-SHA256', new TextEncoder().encode(`${header}.${claims}`), publicKey,
        Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')), character => character.charCodeAt(0))));
    }
    if (init?.method === 'DELETE') return new Response(null, { status: 202 });
    if (url.pathname.endsWith('/access_tokens')) {
      assert.equal(init?.method, 'POST');
      assert.deepEqual(JSON.parse(String(init.body)), { permissions: { metadata: 'read' } });
      return Response.json({ token: installationToken });
    }
    if (url.pathname === '/installation/repositories') {
      assert.equal(bearer, installationToken);
      return url.searchParams.get('page') === '1'
        ? Response.json({ repositories: [{ full_name: 'owner/z' }] }, { headers: { Link: '<next>; rel="next"' } })
        : Response.json({ repositories: [{ full_name: 'owner/a' }] });
    }
    return Response.json({
      id: 12, app_id: 10, account: { id: 20, login: 'owner', type: 'User' },
      repository_selection: 'selected', suspended_at: null, permissions: { contents: 'write', metadata: 'read' },
    });
  });

  const installation = await github.installation(12);
  assert.ok(installation?.ready);
  assert.deepEqual(await github.repositories(installation), ['owner/a', 'owner/z']);
  await github.uninstall(12);
  assert.equal(requestCount, 5);
});

Deno.test('accepts all and selected repository scopes and discovers only the approved owner', async () => {
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  for (const selection of ['all', 'selected']) {
    const github = createGitHub(10, privateKey.export({ format: 'pem', type: 'pkcs1' }).toString(), async input => {
      const url = new URL(String(input));
      if (url.pathname === '/app/installations') return Response.json([
        { id: 13, app_id: 10, account: { id: 999, login: 'other', type: 'User' } },
        { id: 12, app_id: 10, account: { id: 20, login: 'owner', type: 'User' } },
      ]);
      if (url.pathname === '/app/installations/12') return Response.json({
        id: 12, app_id: 10, account: { id: 20, login: 'owner', type: 'User' },
        repository_selection: selection, suspended_at: null,
        permissions: { contents: 'write', metadata: 'read' },
      });
      throw new Error('Unexpected test URL: ' + url.pathname);
    });
    assert.equal((await github.existingInstallation(20))?.ready, true);
    assert.equal(await github.existingInstallation(888), null);
  }
});
