import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { App } from '../src/app/App';

const basePath = '/Luxraj-CMS/';
vi.mock('../src/core/auth/supabase', () => ({ supabase: null }));

afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', basePath);
});

test.each([
  '',
  '#/login',
  '#/dashboard',
  '#/dashboard/subpage',
  '#/repositories',
  '#/code-editor',
  '#/settings',
  '#/github/connect',
  '#/github/callback',
  '#/unknown',
])('the hash route "%s" only shows the login stage', async (hash) => {
  window.history.replaceState(null, '', basePath + hash);

  render(<App />);

  await screen.findByRole('heading', { name: 'Sign in to Luxraj CMS' });
  expect(screen.getByRole('alert').textContent).toContain('Configure the Supabase');
  expect(screen.queryByRole('navigation')).toBeNull();
  expect(screen.queryByRole('complementary')).toBeNull();
  expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Sign in' }).disabled).toBe(true);
  await waitFor(() => expect(window.location.hash).toBe('#/login'));
  expect(window.location.pathname).toBe(basePath);
});
