import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { CodeEditorPage } from '../src/features/workspace/CodeEditorPage';
import { RepositoriesPage } from '../src/features/workspace/RepositoriesPage';
import { WorkspaceLayout } from '../src/features/workspace/WorkspaceLayout';
import { EditBuffers } from '../src/features/workspace/EditBuffers';
import { SourceControlPage } from '../src/features/workspace/SourceControlPage';
import type { WorkspaceRequest } from '../supabase/functions/_shared/workspace-contracts';

const request = vi.hoisted(() => vi.fn());
vi.mock('../src/core/auth/AuthProvider', () => ({
  useAuth: () => ({ session: { user: { id: 'owner' } } }),
}));
vi.mock('../src/features/workspace/MonacoViews', () => ({
  MonacoSource: ({ source, readOnly, onChange }: {
    source: string; readOnly: boolean; onChange(value: string): void;
  }) => <textarea aria-label="Monaco source" value={source} readOnly={readOnly}
    onChange={event => onChange(event.target.value)} />,
  MonacoDiff: ({ original, proposed }: { original: string; proposed: string }) =>
    <><pre aria-label="Original source">{original}</pre><pre aria-label="Proposed source">{proposed}</pre></>,
}));
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
const original = '<h1>Original</h1>';
const current = { source: original, blob: 'b'.repeat(40), commit: tree.commit };

beforeEach(() => { request.mockReset(); });
afterEach(cleanup);

function open(path: string) {
  return render(
    <EditBuffers><MemoryRouter initialEntries={[path]}>
      <Link to="/repositories">Repositories sidebar</Link>
      <Link to="/source-control">Source Control sidebar</Link>
      <Routes>
        <Route element={<WorkspaceLayout />}>
          <Route path="/repositories" element={<RepositoriesPage />} />
          <Route path="/code-editor" element={<CodeEditorPage />} />
          <Route path="/source-control" element={<SourceControlPage />} />
        </Route>
      </Routes>
    </MemoryRouter></EditBuffers>,
  );
}

test('switches repositories and carries the selected branch into Code Editor', async () => {
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'load') return alpha;
    if (input.action === 'select') return beta;
    return tree;
  });
  open('/repositories');
  fireEvent.click(await screen.findByRole('button', { name: 'Medium' }));
  expect(screen.getByRole('button', { name: 'Medium' }).getAttribute('aria-pressed')).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: 'List' }));
  expect(screen.getByRole('button', { name: 'List' }).getAttribute('aria-pressed')).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: 'Open owner/beta' }));
  expect((await screen.findByRole<HTMLInputElement>('radio', { name: /trunk/ })).checked).toBe(true);
  expect(screen.queryByRole('button', { name: 'Open owner/alpha' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'All repositories' }));
  expect(screen.getByRole('button', { name: 'Open owner/alpha' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Open owner/beta' }));
  fireEvent.click(screen.getByRole('link', { name: 'Open with Code Editor' }));
  await screen.findByRole('button', { name: 'index.html' });
  expect(request).toHaveBeenCalledWith({ action: 'select', repositoryId: 2, branch: undefined });
  expect(request).toHaveBeenCalledWith(
    { action: 'tree', repositoryId: 2, branch: 'trunk', path: [] }, expect.any(AbortSignal),
  );
});

test('switching branches ignores a late source response and renders new HTML as text', async () => {
  let finishOld!: (result: unknown) => void;
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'load') return alpha;
    if (input.action === 'select') return { ...alpha, selection: { repositoryId: 1, branch: 'next' } };
    if (input.action === 'tree') return tree;
    if (input.action === 'changes') return { files: [] };
    if ('branch' in input && input.branch === 'main') return new Promise(resolve => { finishOld = resolve; });
    return { current: { ...current, source: '<script>newSource()</script>' }, draft: null };
  });
  open('/code-editor');
  fireEvent.click(await screen.findByRole('button', { name: 'index.html' }));
  await screen.findByText('Loading source…');
  fireEvent.change(screen.getByLabelText('Branch'), { target: { value: 'next' } });
  const newFile = await screen.findByRole('button', { name: 'index.html' });
  await act(async () => finishOld({ current: { ...current, source: 'old-branch-source' }, draft: null }));
  expect(screen.queryByText('old-branch-source')).toBeNull();
  fireEvent.click(newFile);
  const editor = await screen.findByRole<HTMLTextAreaElement>('textbox', { name: 'Monaco source' });
  expect(editor.value).toBe('<script>newSource()</script>');
  expect(editor.readOnly).toBe(true);
  expect(document.querySelector('textarea script')).toBeNull();
});

test('retains unsaved edits across navigation, saves the draft, and reviews its baseline and proposal', async () => {
  let draft: {
    path: string; originalCommit: string; originalBlob: string; originalSource: string;
    proposedSource: string; updatedAt: string; revision: string;
  } | null = null;
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'load') return alpha;
    if (input.action === 'tree') return tree;
    if (input.action === 'open_draft') return { current, draft };
    if (input.action === 'save_draft') {
      draft = { path: 'index.html', originalCommit: current.commit, originalBlob: current.blob,
        originalSource: original, proposedSource: input.source, updatedAt: '', revision: 'saved' };
      return { draft };
    }
    if (input.action === 'changes') return { files: draft ? [draft] : [] };
    if (input.action === 'diff') return draft;
    throw new Error('Unexpected request');
  });
  open('/code-editor');
  fireEvent.click(await screen.findByRole('button', { name: 'index.html' }));
  const editor = await screen.findByRole<HTMLTextAreaElement>('textbox', { name: 'Monaco source' });
  fireEvent.click(screen.getByRole('button', { name: 'Enable editing' }));
  fireEvent.change(editor, { target: { value: '<h1>Proposed</h1>' } });
  await screen.findByText('Unsaved changes');
  fireEvent.click(screen.getByRole('link', { name: 'Source Control sidebar' }));
  await screen.findByText('No saved changes for this branch.');
  fireEvent.click(screen.getByRole('link', { name: 'Code Editor' }));
  fireEvent.click(await screen.findByRole('button', { name: 'index.html' }));
  expect((await screen.findByRole<HTMLTextAreaElement>('textbox', { name: 'Monaco source' })).value).toBe('<h1>Proposed</h1>');
  fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
  await screen.findByText('Draft saved');
  fireEvent.click(screen.getByRole('button', { name: 'Reopen saved draft' }));
  expect((await screen.findByRole<HTMLTextAreaElement>('textbox', { name: 'Monaco source' })).value).toBe('<h1>Proposed</h1>');
  fireEvent.click(screen.getByRole('link', { name: 'Source Control sidebar' }));
  fireEvent.click(await screen.findByRole('button', { name: 'index.html' }));
  expect((await screen.findByLabelText('Original source')).textContent).toBe(original);
  expect(screen.getByLabelText('Proposed source').textContent).toBe('<h1>Proposed</h1>');
});

test('inline Source Control opens a diff and returns to unsaved edits in the same editor', async () => {
  const draft = { path: 'index.html', originalCommit: current.commit, originalBlob: current.blob,
    originalSource: original, proposedSource: '<h1>Saved</h1>', updatedAt: '', revision: 'saved' };
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'load') return alpha;
    if (input.action === 'tree') return tree;
    if (input.action === 'open_draft') return { current, draft };
    if (input.action === 'changes') return { files: [draft] };
    if (input.action === 'diff') return draft;
    throw new Error('Unexpected request');
  });
  open('/code-editor');
  fireEvent.click(await within(await screen.findByRole('complementary', { name: 'Files' })).findByRole('button', { name: 'index.html' }));
  const editor = await screen.findByRole<HTMLTextAreaElement>('textbox', { name: 'Monaco source' });
  fireEvent.click(screen.getByRole('button', { name: 'Enable editing' }));
  fireEvent.change(editor, { target: { value: 'Unsaved HTML' } });
  const panel = screen.getByRole('button', { name: 'Source Control panel' });
  fireEvent.click(panel);
  expect(screen.queryByRole('complementary', { name: 'Source Control' })).toBeNull();
  fireEvent.click(panel);
  fireEvent.click(await within(await screen.findByRole('complementary', { name: 'Source Control' }))
    .findByRole('button', { name: 'index.html' }));
  expect((await screen.findByLabelText('Proposed source')).textContent).toBe(draft.proposedSource);
  expect(screen.getByRole('heading', { name: 'Code Editor' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Return to editor' }));
  expect(screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Monaco source' }).value).toBe('Unsaved HTML');
});
