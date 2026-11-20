import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { App } from '../src/app/App';

vi.mock('../src/features/github-connection/api', () => ({
  githubConnection: async () => ({ status: 'connected' }),
}));

const auth = vi.hoisted(() => ({
  getSession: vi.fn(),
  getUser: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  unsubscribe: vi.fn(),
  onAuthStateChange: vi.fn(),
}));
const roles = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  abortSignal: vi.fn(),
  maybeSingle: vi.fn(),
}));
vi.mock('../src/core/auth/supabase', () => ({ supabase: { auth, from: roles.from } }));

const session = {
  access_token: 'test-access',
  refresh_token: 'test-refresh',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: { id: 'test-user', email: 'owner@example.test', is_anonymous: false },
} as Session;
let notify: (event: AuthChangeEvent, session: Session | null) => void;

beforeEach(() => {
  vi.resetAllMocks();
  window.history.replaceState(null, '', '/Luxraj-CMS/#/dashboard');
  auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
  auth.getUser.mockResolvedValue({ data: { user: session.user }, error: null });
  auth.signInWithPassword.mockResolvedValue({ data: { session }, error: null });
  auth.signOut.mockResolvedValue({ error: null });
  roles.from.mockReturnValue({ select: roles.select });
  roles.select.mockReturnValue({ eq: roles.eq });
  roles.eq.mockReturnValue({ abortSignal: roles.abortSignal });
  roles.abortSignal.mockReturnValue({ maybeSingle: roles.maybeSingle });
  roles.maybeSingle.mockResolvedValue({ data: { role: 'super_admin' }, error: null });
  auth.onAuthStateChange.mockImplementation(callback => {
    notify = callback;
    return { data: { subscription: { unsubscribe: auth.unsubscribe } } };
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  window.history.replaceState(null, '', '/Luxraj-CMS/');
});

async function submitLogin() {
  await screen.findByRole('heading', { name: 'Sign in to Luxraj CMS' });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'owner@example.test' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'test-password' } });
  fireEvent.submit(screen.getByRole('button', { name: 'Sign in' }).closest('form')!);
}

test('a stored session is checked before the dashboard renders', async () => {
  let resolve!: (value: unknown) => void;
  auth.getSession.mockReturnValue(new Promise(done => { resolve = done; }));
  render(<App />);
  expect(screen.getByRole('status').textContent).toContain('Checking your session');
  expect(screen.queryByRole('navigation')).toBeNull();
  await act(async () => resolve({ data: { session }, error: null }));
  await screen.findByRole('heading', { name: 'Dashboard' });
  expect(auth.getUser).toHaveBeenCalledOnce();
  expect(screen.getByRole('navigation')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Collapse main sidebar' }));
  expect(screen.getByRole('link', { name: 'Code Editor' }).getAttribute('title')).toBe('Code Editor');
  fireEvent.click(screen.getByRole('button', { name: 'Expand main sidebar' }));
});

test('email/password sign-in opens the dashboard and local logout returns to login', async () => {
  render(<App />);
  await submitLogin();
  await screen.findByRole('heading', { name: 'Dashboard' });
  expect(auth.signInWithPassword).toHaveBeenCalledWith({
    email: 'owner@example.test', password: 'test-password',
  });
  fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
  await screen.findByRole('heading', { name: 'Sign in to Luxraj CMS' });
  expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  expect(screen.queryByRole('navigation')).toBeNull();
});

test('invalid credentials show a safe error and allow retry', async () => {
  auth.signInWithPassword.mockResolvedValue({ data: { session: null }, error: { message: 'PRIVATE_DETAIL' } });
  render(<App />);
  await submitLogin();
  expect((await screen.findByRole('alert')).textContent).toContain('Check your email and password');
  expect(document.body.textContent).not.toContain('PRIVATE_DETAIL');
  expect(screen.queryByRole('navigation')).toBeNull();
  await waitFor(() => expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Sign in' }).disabled).toBe(false));
});

test('network failures during sign-in show recovery instructions', async () => {
  auth.signInWithPassword.mockRejectedValue(new Error('PRIVATE_DETAIL'));
  render(<App />);
  await submitLogin();
  expect((await screen.findByRole('alert')).textContent).toContain('Check your connection');
  expect(document.body.textContent).not.toContain('PRIVATE_DETAIL');
});

test.each(['expired', 'rejected', 'network'])('a %s stored session cannot open the dashboard', async reason => {
  auth.getSession.mockResolvedValue({
    data: { session: reason === 'expired' ? { ...session, expires_at: 1 } : session },
    error: null,
  });
  if (reason === 'rejected') auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'PRIVATE_DETAIL' } });
  if (reason === 'network') auth.getSession.mockRejectedValue(new Error('PRIVATE_DETAIL'));
  render(<App />);
  await screen.findByRole('heading', { name: 'Sign in to Luxraj CMS' });
  expect(screen.queryByRole('navigation')).toBeNull();
  expect(screen.getByRole('alert').textContent).toContain('Please sign in again');
  expect(document.body.textContent).not.toContain('PRIVATE_DETAIL');
});

test('auth events update the UI and the subscription is cleaned up', async () => {
  const view = render(<App />);
  await screen.findByRole('heading', { name: 'Sign in to Luxraj CMS' });
  act(() => notify('SIGNED_IN', session));
  await screen.findByRole('heading', { name: 'Dashboard' });
  act(() => notify('TOKEN_REFRESHED', { ...session, expires_at: session.expires_at! + 3600 }));
  expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy();
  act(() => notify('SIGNED_OUT', null));
  await screen.findByRole('heading', { name: 'Sign in to Luxraj CMS' });
  expect(screen.queryByRole('navigation')).toBeNull();
  view.unmount();
  expect(auth.unsubscribe).toHaveBeenCalledOnce();
});

test('an older restoration result cannot overwrite a newer sign-out event', async () => {
  let resolve!: (value: unknown) => void;
  auth.getSession.mockReturnValue(new Promise(done => { resolve = done; }));
  render(<App />);
  act(() => notify('SIGNED_OUT', null));
  await act(async () => resolve({ data: { session }, error: null }));
  await screen.findByRole('heading', { name: 'Sign in to Luxraj CMS' });
  expect(screen.queryByRole('navigation')).toBeNull();
});

test('a logout failure remains visible and supports another attempt', async () => {
  auth.getSession.mockResolvedValue({ data: { session }, error: null });
  auth.signOut.mockResolvedValue({ error: { message: 'PRIVATE_DETAIL' } });
  render(<App />);
  fireEvent.click(await screen.findByRole('button', { name: 'Logout' }));
  expect((await screen.findByRole('alert')).textContent).toContain('Sign-out failed');
  expect(document.body.textContent).not.toContain('PRIVATE_DETAIL');
  auth.signOut.mockResolvedValue({ error: null });
  fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
  await screen.findByRole('heading', { name: 'Sign in to Luxraj CMS' });
});

test('a session restores after the application mounts again', async () => {
  auth.getSession.mockResolvedValue({ data: { session }, error: null });
  const view = render(<App />);
  await screen.findByRole('heading', { name: 'Dashboard' });
  view.unmount();
  render(<App />);
  await screen.findByRole('heading', { name: 'Dashboard' });
  expect(auth.getUser).toHaveBeenCalledTimes(2);
});

test('a session that expires without refresh removes the dashboard', async () => {
  vi.useFakeTimers();
  auth.getSession.mockResolvedValue({ data: { session }, error: null });
  await act(async () => { render(<App />); });
  expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy();
  await act(async () => { vi.advanceTimersByTime(3601 * 1000); });
  expect(screen.queryByRole('navigation')).toBeNull();
  expect(screen.getByRole('heading', { name: 'Sign in to Luxraj CMS' })).toBeTruthy();
});

test('a verified session waits for the role lookup before showing dashboard content', async () => {
  let resolve!: (value: unknown) => void;
  auth.getSession.mockResolvedValue({ data: { session }, error: null });
  roles.maybeSingle.mockReturnValue(new Promise(done => { resolve = done; }));
  render(<App />);

  await screen.findByText('Checking dashboard access…');
  expect(screen.queryByRole('navigation')).toBeNull();
  expect(screen.queryByRole('heading', { name: 'Dashboard' })).toBeNull();
  expect(roles.from).toHaveBeenCalledWith('cms_user_roles');
  expect(roles.select).toHaveBeenCalledWith('role');
  expect(roles.eq).toHaveBeenCalledWith('user_id', session.user.id);

  await act(async () => resolve({ data: { role: 'super_admin' }, error: null }));
  await screen.findByRole('heading', { name: 'Dashboard' });
});

test.each([null, { role: 'editor' }])('denies a signed-in user without a Super Admin assignment (%j)', async data => {
  roles.maybeSingle.mockResolvedValue({ data, error: null });
  render(<App />);
  await submitLogin();

  await screen.findByRole('heading', { name: 'Dashboard access denied' });
  expect(screen.queryByRole('navigation')).toBeNull();
  expect(screen.queryByRole('heading', { name: 'Dashboard' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
  await screen.findByRole('heading', { name: 'Sign in to Luxraj CMS' });
});

test('user metadata claiming Super Admin cannot grant access', async () => {
  const spoofedSession = {
    ...session,
    user: {
      ...session.user,
      user_metadata: { role: 'super_admin' },
    },
  };
  auth.getSession.mockResolvedValue({ data: { session: spoofedSession }, error: null });
  roles.maybeSingle.mockResolvedValue({ data: null, error: null });
  render(<App />);

  await screen.findByRole('heading', { name: 'Dashboard access denied' });
  expect(screen.queryByRole('navigation')).toBeNull();
});

test('a failed role lookup keeps the dashboard hidden and shows safe instructions', async () => {
  auth.getSession.mockResolvedValue({ data: { session }, error: null });
  roles.maybeSingle.mockResolvedValue({ data: null, error: { message: 'PRIVATE_DETAIL' } });
  render(<App />);

  await screen.findByRole('heading', { name: 'Dashboard access could not be verified' });
  expect(screen.getByRole('alert').textContent).toContain('Reload');
  expect(document.body.textContent).not.toContain('PRIVATE_DETAIL');
  expect(screen.queryByRole('navigation')).toBeNull();
});

test('an approval for an older session cannot open the dashboard for a different user', async () => {
  let resolve!: (value: unknown) => void;
  auth.getSession.mockResolvedValue({ data: { session }, error: null });
  roles.maybeSingle.mockReturnValueOnce(new Promise(done => { resolve = done; }));
  roles.maybeSingle.mockResolvedValue({ data: null, error: null });
  render(<App />);
  await screen.findByText('Checking dashboard access…');

  act(() => notify('SIGNED_IN', {
    ...session,
    access_token: 'another-access-token',
    user: { ...session.user, id: 'another-user' },
  }));
  await screen.findByRole('heading', { name: 'Dashboard access denied' });

  await act(async () => resolve({ data: { role: 'super_admin' }, error: null }));
  expect(roles.eq).toHaveBeenLastCalledWith('user_id', 'another-user');
  expect(screen.getByRole('heading', { name: 'Dashboard access denied' })).toBeTruthy();
  expect(screen.queryByRole('navigation')).toBeNull();
});
