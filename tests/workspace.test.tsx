import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { CodeEditorPage } from '../src/features/workspace/CodeEditorPage';
import { RepositoriesPage } from '../src/features/workspace/RepositoriesPage';
import { WorkspaceLayout } from '../src/features/workspace/WorkspaceLayout';
import type { WorkspaceRequest } from '../supabase/functions/_shared/workspace-contracts';

const request = vi.hoisted(() => vi.fn());
vi.mock('../src/features/workspace/api', async importOriginal => ({
  ...await importOriginal<typeof import('../src/features/workspace/api')>(),
  workspaceRequest: request,
}));

const repositories = [
  { id: 1, name: 'owner/alpha', defaultBranch: 'main', private: true },
  { id: 2, name: 'owner/beta', defaultBranch: 'trunk', private: false },
];
const alpha = { repositories, selection: { repositoryId: 1, branch: 'main' }, branches: ['main', 'next'] };
const beta = { repositories, selection: { repositoryId: 2, branch: 'trunk' }, branches: ['trunk'] };
const tree = { commit: 'a'.repeat(40), entries: [{ name: 'index.html', kind: 'file' }] };

beforeEach(() => { request.mockReset(); });
afterEach(cleanup);

function open(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Link to="/repositories">Repositories sidebar</Link>
      <Routes>
        <Route element={<WorkspaceLayout />}>
          <Route path="/repositories" element={<RepositoriesPage />} />
          <Route path="/code-editor" element={<CodeEditorPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

test('switches repositories and carries the selected branch into Code Editor', async () => {
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'load') return alpha;
    if (input.action === 'select') return beta;
    return tree;
  });
  open('/repositories');
  fireEvent.click(await screen.findByRole('button', { name: 'Select owner/beta' }));
  await screen.findByRole('button', { name: 'owner/beta selected' });
  expect((screen.getByLabelText('Branch') as HTMLSelectElement).value).toBe('trunk');
  fireEvent.click(screen.getByRole('link', { name: 'Open Code Editor' }));
  await screen.findByRole('button', { name: 'index.html' });
  expect(request).toHaveBeenCalledWith({ action: 'select', repositoryId: 2, branch: undefined });
  expect(request).toHaveBeenCalledWith(
    { action: 'tree', repositoryId: 2, branch: 'trunk', path: [] }, expect.any(AbortSignal),
  );
});

test('switching branches ignores a late source response and renders new HTML as text', async () => {
  let finishOld!: (result: { source: string }) => void;
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'load') return alpha;
    if (input.action === 'select') return { ...alpha, selection: { repositoryId: 1, branch: 'next' } };
    if (input.action === 'tree') return tree;
    if (input.branch === 'main') return new Promise(resolve => { finishOld = resolve; });
    return { source: '<script>newSource()</script>' };
  });
  open('/code-editor');
  fireEvent.click(await screen.findByRole('button', { name: 'index.html' }));
  await screen.findByText('Loading source…');
  fireEvent.change(screen.getByLabelText('Branch'), { target: { value: 'next' } });
  const newFile = await screen.findByRole('button', { name: 'index.html' });
  await act(async () => finishOld({ source: 'old-branch-source' }));
  expect(screen.queryByText('old-branch-source')).toBeNull();
  fireEvent.click(newFile);
  expect((await screen.findByText('<script>newSource()</script>')).tagName).toBe('CODE');
  expect(document.querySelector('pre script')).toBeNull();
});
