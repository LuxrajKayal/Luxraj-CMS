import { createPrivateKey, sign } from 'node:crypto';

export interface Installation {
  id: number;
  appId: number;
  ownerId: number;
  owner: string;
  ownerType: 'User' | 'Organization';
  ready: boolean;
}

export interface GitHub {
  installation(id: number): Promise<Installation | null>;
  repositories(installation: Installation): Promise<string[]>;
  uninstall(id: number): Promise<void>;
}

export function positiveId(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

export function createGitHub(appId: number, privateKey: string, request: typeof fetch = fetch): GitHub {
  const key = createPrivateKey(privateKey.replace(/\\n/g, '\n'));

  function appToken() {
    const now = Math.floor(Date.now() / 1000);
    const encode = (value: object) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const unsigned = encode({ alg: 'RS256', typ: 'JWT' }) +
      '.' + encode({ iat: now - 30, exp: now + 8 * 60, iss: String(appId) });
    return unsigned + '.' + sign('RSA-SHA256', new TextEncoder().encode(unsigned), key).toString('base64url');
  }

  function api(path: string, token: string, method = 'GET', body?: object) {
    const headers = new Headers({
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2026-03-10',
      'User-Agent': 'Luxraj-CMS',
    });
    if (body) headers.set('Content-Type', 'application/json');
    return request(`https://api.github.com${path}`, {
      method, headers, body: body ? JSON.stringify(body) : undefined,
      redirect: 'error', signal: AbortSignal.timeout(10_000),
    });
  }

  return {
    async installation(id) {
      const response = await api(`/app/installations/${id}`, appToken());
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Installation lookup failed.');
      const value = await response.json();
      const account = value?.account;
      if (value?.id !== id || !positiveId(value.app_id) || !positiveId(account?.id) ||
          typeof account.login !== 'string' || !/^[a-z\d][a-z\d-]{0,99}$/i.test(account.login) ||
          (account.type !== 'User' && account.type !== 'Organization')) {
        throw new Error('GitHub returned invalid installation data.');
      }
      return {
        id, appId: value.app_id, ownerId: account.id, owner: account.login, ownerType: account.type,
        ready: value.repository_selection === 'selected' && value.suspended_at === null &&
          value.permissions?.contents === 'write' && value.permissions?.metadata === 'read',
      };
    },
    async repositories(installation) {
      const response = await api(`/app/installations/${installation.id}/access_tokens`, appToken(), 'POST', {
        permissions: { metadata: 'read' },
      });
      if (!response.ok) throw new Error('Installation authorization failed.');
      const { token } = await response.json();
      if (typeof token !== 'string' || !token) throw new Error('GitHub returned invalid authorization data.');

      const names = new Set<string>();
      for (let page = 1; page <= 100; page += 1) {
        const result = await api(`/installation/repositories?per_page=100&page=${page}`, token);
        if (!result.ok) throw new Error('Repository scope lookup failed.');
        const value = await result.json();
        if (!Array.isArray(value.repositories)) throw new Error('GitHub returned invalid repository data.');
        for (const repository of value.repositories) {
          if (typeof repository?.full_name !== 'string') throw new Error('GitHub returned invalid repository data.');
          names.add(repository.full_name);
        }
        if (!result.headers.get('Link')?.includes('rel="next"')) return [...names].sort();
      }
      throw new Error('Repository scope could not be read completely.');
    },
    async uninstall(id) {
      const response = await api(`/app/installations/${id}`, appToken(), 'DELETE');
      if (response.status !== 404 && !response.ok) throw new Error('GitHub uninstall failed.');
    },
  };
}
