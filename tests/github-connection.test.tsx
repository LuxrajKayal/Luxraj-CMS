import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import {
  GithubCallback, GithubOnboarding, GithubSettings, RequireGithubConnection,
} from '../src/features/github-connection/GithubConnectionPages';
import { githubConnection } from '../src/features/github-connection/api';

vi.mock('../src/features/github-connection/api', async importOriginal => ({
  ...await importOriginal<typeof import('../src/features/github-connection/api')>(),
  githubConnection: vi.fn(),
}));

const call = vi.mocked(githubConnection);
const disconnected = { status: 'disconnected' as const, owner: null, repositories: [], manageUrl: null };
const connected = {
  status: 'connected' as const, owner: 'owner', repositories: ['owner/site'],
  manageUrl: 'https://github.com/settings/installations/42',
};

beforeEach(() => { call.mockReset(); });
afterEach(cleanup);

function renderRoutes(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/github/connect" element={<GithubOnboarding />} />
        <Route path="/github/callback" element={<GithubCallback />} />
        <Route path="/settings" element={<GithubSettings />} />
        <Route element={<RequireGithubConnection />}>
          <Route path="/dashboard" element={<h1>Dashboard</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

test('first-time Super Admin sees onboarding while the dashboard stays hidden', async () => {
  call.mockResolvedValue(disconnected);
  renderRoutes('/dashboard');
  await screen.findByRole('button', { name: 'Connect GitHub' });
  expect(screen.queryByRole('heading', { name: 'Dashboard' })).toBeNull();
});

test('the callback completes on the backend before opening the dashboard', async () => {
  call.mockResolvedValue(connected);
  renderRoutes('/github/callback');
  await screen.findByRole('heading', { name: 'Dashboard' });
  expect(call.mock.calls).toEqual([['complete'], ['status']]);
});

test('a failed callback keeps the dashboard hidden and offers a restart', async () => {
  call.mockRejectedValue(new Error('invalid_attempt'));
  renderRoutes('/github/callback');
  expect((await screen.findByRole('alert')).textContent).toContain('Start again');
  expect(screen.getByRole('link', { name: 'Return to GitHub connection' })).toBeTruthy();
  expect(screen.queryByRole('heading', { name: 'Dashboard' })).toBeNull();
});

test('Settings displays selected scope and shows incomplete uninstall with a GitHub fallback', async () => {
  call.mockResolvedValueOnce(connected).mockResolvedValueOnce({
    ...connected, status: 'revocation_pending', repositories: [],
  });
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
  try {
    renderRoutes('/settings');
    await screen.findByText('owner/site');
    fireEvent.click(screen.getByRole('button', { name: 'Disconnect GitHub' }));
    expect((await screen.findByRole('alert')).textContent).toContain('GitHub revocation is pending');
    expect(screen.queryByText('owner/site')).toBeNull();
    expect(screen.getByRole('link', { name: 'Open GitHub installation settings' }).getAttribute('href'))
      .toBe(connected.manageUrl);
    expect(screen.queryByRole('button', { name: 'Reconnect GitHub' })).toBeNull();
    expect(call).toHaveBeenCalledWith('disconnect');
  } finally {
    confirm.mockRestore();
  }
});
