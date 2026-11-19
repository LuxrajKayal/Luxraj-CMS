import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import { App } from '../src/app/App';

const basePath = '/Luxraj-CMS/';

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
  '#/settings',
  '#/unknown',
])('the hash route "%s" only shows the login stage', async (hash) => {
  window.history.replaceState(null, '', basePath + hash);

  render(<App />);

  await screen.findByRole('heading', { name: 'Sign in to Luxraj CMS' });
  expect(screen.getByText('Sign-in is not available yet.')).toBeTruthy();
  expect(screen.queryByRole('navigation')).toBeNull();
  expect(screen.queryByRole('complementary')).toBeNull();
  expect(screen.queryByRole('textbox')).toBeNull();
  await waitFor(() => expect(window.location.hash).toBe('#/login'));
  expect(window.location.pathname).toBe(basePath);
});
