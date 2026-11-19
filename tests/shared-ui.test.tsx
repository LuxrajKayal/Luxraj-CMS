import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { AppErrorFallback } from '../src/app/AppErrorFallback';
import { ErrorBoundary } from '../src/shared/ui/ErrorBoundary';
import { PagePanel } from '../src/shared/ui/PagePanel';

afterEach(cleanup);

test('the shared panel displays its content inside a main landmark', () => {
  render(<PagePanel><h1>Example screen</h1></PagePanel>);

  const heading = screen.getByRole('heading', { name: 'Example screen' });
  expect(screen.getByRole('main').contains(heading)).toBe(true);
});

test('the boundary renders its children when the page is healthy', () => {
  render(
    <ErrorBoundary fallback={<AppErrorFallback />}>
      <h1>Example screen</h1>
    </ErrorBoundary>,
  );

  expect(screen.getByRole('heading', { name: 'Example screen' })).toBeTruthy();
  expect(screen.queryByRole('alert')).toBeNull();
});

test('a rendering error shows safe recovery instructions', () => {
  const privateDetail = 'PRIVATE_TEST_DETAIL';
  const onCaughtError = vi.fn();

  function BrokenScreen(): never {
    throw new Error(privateDetail);
  }

  render(
    <ErrorBoundary fallback={<AppErrorFallback />}>
      <BrokenScreen />
    </ErrorBoundary>,
    { onCaughtError },
  );

  expect(onCaughtError).toHaveBeenCalled();
  expect(screen.getByRole('alert').textContent).toContain(
    'Luxraj CMS could not open this screen',
  );
  expect(screen.getByRole('alert').textContent).toContain('Reload the page to try again.');
  expect(screen.getByRole('button', { name: 'Reload page' })).toBeTruthy();
  expect(document.body.textContent).not.toContain(privateDetail);
  expect(document.body.textContent).not.toContain('BrokenScreen');
});
