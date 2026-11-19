import { expect, test, vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn(() => ({ auth: {} })) }));
import { createClient } from '@supabase/supabase-js';
import { createAuthClient } from '../src/core/auth/supabase';

test.each([
  [undefined, undefined],
  ['invalid-url', 'sb_publishable_example'],
  ['https://example.supabase.co', 'sb_secret_example'],
  ['https://example.supabase.co', 'legacy-jwt-key'],
])('missing or invalid public configuration fails closed', (url, key) => {
  expect(createAuthClient(url, key)).toBeNull();
});

test('public configuration enables SDK session persistence and refresh', () => {
  expect(createAuthClient('https://example.supabase.co', 'sb_publishable_example')).toBeTruthy();
  expect(createClient).toHaveBeenLastCalledWith(
    'https://example.supabase.co',
    'sb_publishable_example',
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } },
  );
});
