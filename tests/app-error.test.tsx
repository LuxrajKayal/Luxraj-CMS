import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { App } from '../src/app/App';

vi.mock('../src/app/routes/AppRoutes', () => ({
  AppRoutes() {
    throw new Error('PRIVATE_TEST_DETAIL');
  },
}));

afterEach(cleanup);

test('the application catches a failing route and shows a safe recovery screen', () => {
  render(<App />, { onCaughtError: vi.fn() });

  expect(screen.getByRole('alert').textContent).toContain(
    'Luxraj CMS could not open this screen',
  );
  expect(screen.getByRole('button', { name: 'Reload page' })).toBeTruthy();
  expect(document.body.textContent).not.toContain('PRIVATE_TEST_DETAIL');
  expect(screen.queryByRole('navigation')).toBeNull();
});
