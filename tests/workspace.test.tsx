import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { CodeEditorPage } from '../src/features/workspace/CodeEditorPage';
import { RepositoriesPage } from '../src/features/workspace/RepositoriesPage';
import { WorkspaceLayout } from '../src/features/workspace/WorkspaceLayout';
import { EditBuffers, readEditorRecovery } from '../src/features/workspace/EditBuffers';
import { SourceControlPage } from '../src/features/workspace/SourceControlPage';
import CodeInjectorPage from '../src/features/code-injector/CodeInjectorPage';
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

test('copies boilerplate, reviews replacement, saves the exact draft revision, and opens its existing Monaco diff', async () => {
  const path = 'nested/example.htm';
  const baseline = '<html lang="fr" data-cms-seo-type="Old"><body>GitHub</body></html>';
  const saved = baseline.replace('GitHub', 'Previously saved draft');
  let draft = { path, originalCommit: current.commit, originalBlob: current.blob,
    originalSource: baseline, proposedSource: saved, updatedAt: '', revision: 'old-revision' };
  const clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
  const previousClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: clipboard });
  try {
    request.mockImplementation(async (input: WorkspaceRequest) => {
      if (input.action === 'load') return alpha;
      if (input.action === 'discover_html') return { commit: tree.commit, files: [path] };
      if (input.action === 'tree') return tree;
      if (input.action === 'open_draft') return { current: { ...current, source: baseline }, draft };
      if (input.action === 'changes') return { files: [draft] };
      if (input.action === 'diff') return draft;
      if (input.action === 'save_draft') {
        draft = { ...draft, proposedSource: input.source, revision: 'new-revision' };
        return { draft };
      }
      throw new Error('Unexpected request');
    });
    open('/code-injector');
    fireEvent.change(await screen.findByLabelText('Website Type'), { target: { value: 'blog' } });
    expect(screen.queryByRole('option', { name: 'Article - News' })).toBeNull();
    fireEvent.change(screen.getByLabelText('Page Type'), { target: { value: 'BlogPosting' } });
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    await screen.findByText('Boilerplate copied.');
    expect(clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('data-cms-seo-type="BlogPosting"'));
    fireEvent.click(screen.getByRole('button', { name: /Detect all HTML/ }));
    fireEvent.change(await screen.findByLabelText('HTML file'), { target: { value: path } });
    expect(screen.getByRole('link', { name: 'Open in Code Editor' }).getAttribute('href')).toBe('/code-editor');
    fireEvent.click(screen.getByRole('button', { name: 'Inject' }));
    const warning = await screen.findByRole('alertdialog');
    expect(within(warning).getByText(/replaces existing CMS identification attributes/)).toBeTruthy();
    fireEvent.click(within(warning).getByRole('button', { name: 'Cancel' }));
    expect(request.mock.calls.some(([input]) => input.action === 'save_draft')).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Inject' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Save Draft' }));
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ action: 'save_draft', repositoryId: 1, branch: 'main',
      commit: tree.commit, path: ['nested', 'example.htm'], revision: 'old-revision' }), expect.any(AbortSignal));
    fireEvent.click(await screen.findByRole('link', { name: 'Review in Code Editor' }));
    expect((await screen.findByLabelText('Original source')).textContent).toBe(baseline);
    expect(screen.getByLabelText('Proposed source').textContent).toBe(
      '<html lang="fr" data-cms-seo-type="BlogPosting" data-cms-seo="true" data-cms-website="blog"><body>Previously saved draft</body></html>',
    );
    expect(request.mock.calls.some(([input]) => ['confirm_commit', 'review_commit'].includes(input.action))).toBe(false);
  } finally {
    if (previousClipboard) Object.defineProperty(navigator, 'clipboard', previousClipboard);
    else Reflect.deleteProperty(navigator, 'clipboard');
  }
});

test('HTML injection leaves a target with unsaved editor changes untouched and inspection restores the buffer', async () => {
  const path = 'nested/example.htm';
  window.sessionStorage.setItem('luxraj-cms-editor-session-v1:owner', JSON.stringify({
    buffers: { [JSON.stringify([1, 'main', path])]: { source: 'Unsaved content', commit: tree.commit, revision: null } },
  }));
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'load') return alpha;
    if (input.action === 'discover_html') return { commit: tree.commit, files: [path] };
    if (input.action === 'tree') return tree;
    if (input.action === 'changes') return { files: [] };
    if (input.action === 'open_draft') return { current, draft: null };
    throw new Error('Unexpected request');
  });
  open('/code-injector');
  fireEvent.click(await screen.findByRole('button', { name: /Detect all HTML/ }));
  fireEvent.change(await screen.findByLabelText('HTML file'), { target: { value: path } });
  expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Inject' }).disabled).toBe(true);
  expect(screen.getByRole('alert').textContent).toContain('unsaved editor changes');
  fireEvent.click(screen.getByRole('link', { name: 'Open in Code Editor' }));
  expect((await screen.findByRole<HTMLTextAreaElement>('textbox', { name: 'Monaco source' })).value).toBe('Unsaved content');
  expect(request.mock.calls.some(([input]) => input.action === 'save_draft')).toBe(false);
});

test('requires explicit confirmation for exact saved revisions and preserves unsaved source after a commit', async () => {
  const draft = { path: 'index.html', revision: 'saved-revision', originalCommit: current.commit, originalBlob: current.blob,
    originalSource: original, proposedSource: '<h1>Saved version</h1>', updatedAt: '' };
  const other = { ...draft, path: 'styles.css', revision: 'css-revision' };
  const sha = 'c'.repeat(40);
  let committed = false;
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'load') return alpha;
    if (input.action === 'tree') return { ...tree, commit: committed ? sha : tree.commit };
    if (input.action === 'open_draft') return committed
      ? { current: { ...current, commit: sha, source: draft.proposedSource }, draft: null }
      : { current, draft };
    if (input.action === 'changes') return { files: committed ? [] : [draft, other] };
    if (input.action === 'review_commit') return { id: 'review-id', repository: 'owner/alpha', branch: 'main',
      files: input.files, message: input.message,
    };
    if (input.action === 'confirm_commit') {
      committed = true;
      return { sha, url: `https://github.com/owner/alpha/commit/${sha}`, fileCount: 2, retained: 2 };
    }
    throw new Error('Unexpected request');
  });
  open('/code-editor');
  const filesPanel = await screen.findByRole('complementary', { name: 'Files' });
  fireEvent.click(await within(filesPanel).findByRole('button', { name: 'index.html' }));
  const editor = await screen.findByRole<HTMLTextAreaElement>('textbox', { name: 'Monaco source' });
  fireEvent.click(screen.getByRole('button', { name: 'Enable editing' }));
  fireEvent.change(editor, { target: { value: '<h1>Still unsaved</h1>' } });
  fireEvent.click(await screen.findByRole('checkbox', { name: 'Include index.html in commit' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Include styles.css in commit' }));
  fireEvent.change(screen.getByLabelText('Commit message'), { target: { value: 'Update site' } });
  fireEvent.click(screen.getByRole('button', { name: 'Review & Commit' }));
  const dialog = await screen.findByRole('dialog', { name: 'Confirm GitHub commit' });
  for (const value of ['owner/alpha', 'main', 'index.html', 'styles.css', 'Update site']) {
    expect(within(dialog).getByText(value)).toBeTruthy();
  }
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  expect(request.mock.calls.some(([input]) => input.action === 'confirm_commit')).toBe(false);
  expect(request).toHaveBeenCalledWith({ action: 'review_commit', repositoryId: 1, branch: 'main', message: 'Update site',
    files: [{ path: 'index.html', revision: 'saved-revision' }, { path: 'styles.css', revision: 'css-revision' }] });
  fireEvent.click(screen.getByRole('button', { name: 'Review & Commit' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Confirm commit' }));
  expect(request).toHaveBeenCalledWith({ action: 'confirm_commit', repositoryId: 1, branch: 'main', reviewId: 'review-id' });
  await screen.findByRole('link', { name: sha.slice(0, 12) });
  await screen.findByText('No saved changes for this branch.');
  expect((await screen.findByRole<HTMLTextAreaElement>('textbox', { name: 'Monaco source' })).value).toBe('<h1>Still unsaved</h1>');
});

test('shows remote merge history, follows its page cursor, and opens a committed diff in the center', async () => {
  const merge = { sha: 'd'.repeat(40), parents: [current.commit, current.blob], message: 'Merge external branch',
    author: 'External contributor', date: '2026-11-19T12:00:00Z' };
  const previous = { ...merge, sha: current.blob, message: 'Earlier external commit', parents: [] };
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'load') return alpha;
    if (input.action === 'tree') return tree;
    if (input.action === 'changes') return { files: [] };
    if (input.action === 'history') return { head: merge.sha, refs: [{ name: 'main', sha: merge.sha }, { name: 'topic', sha: previous.sha }],
      commits: input.page === 1 ? [merge] : [previous], next: input.page === 1 ? 2 : null };
    if (input.action === 'commit_detail') return { ...merge, complete: true, files: [{ path: 'index.html', status: 'modified' }] };
    if (input.action === 'commit_diff') return { original, proposed: '<h1>Externally merged</h1>' };
    throw new Error('Unexpected request');
  });
  open('/code-editor');
  fireEvent.click(await screen.findByRole('tab', { name: 'History' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Load more commits' }));
  await screen.findByRole('button', { name: /Earlier external commit.*topic/ });
  expect(request).toHaveBeenCalledWith({ action: 'history', repositoryId: 1, branch: 'main', page: 2, head: merge.sha }, expect.any(AbortSignal));
  fireEvent.click(screen.getByRole('button', { name: /Merge external branch/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'modified · index.html' }));
  expect((await screen.findByLabelText('Original source')).textContent).toBe(original);
  expect(screen.getByLabelText('Proposed source').textContent).toBe('<h1>Externally merged</h1>');
  expect(request).toHaveBeenCalledWith({ action: 'commit_diff', repositoryId: 1, branch: 'main', sha: merge.sha, path: 'index.html' }, expect.any(AbortSignal));
  fireEvent.click(screen.getByRole('button', { name: 'Return to editor' }));
  expect(screen.queryByLabelText('Original source')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Refresh history' }));
  await screen.findByRole('button', { name: /Merge external branch/ });
  expect(screen.queryByRole('button', { name: /Earlier external commit/ })).toBeNull();
});

beforeEach(() => { request.mockReset(); window.sessionStorage.clear(); });
afterEach(cleanup);

function open(path: string) {
  return render(
    <EditBuffers><MemoryRouter initialEntries={[path]}>
      <Link to="/repositories">Repositories sidebar</Link>
      <Link to="/source-control">Source Control sidebar</Link>
      <Link to="/code-editor">Code Editor sidebar</Link>
      <Link to="/settings">Settings sidebar</Link>
      <Routes>
        <Route element={<WorkspaceLayout />}>
          <Route path="/repositories" element={<RepositoriesPage />} />
          <Route path="/code-editor" element={<CodeEditorPage />} />
          <Route path="/source-control" element={<SourceControlPage />} />
          <Route path="/code-injector" element={<CodeInjectorPage />} />
        </Route>
        <Route path="/settings" element={<h1>Mock Settings</h1>} />
      </Routes>
    </MemoryRouter></EditBuffers>,
  );
}

test('shows the current workspace after returning and confirms a repository switch before opening Code Editor', async () => {
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
  try {
    request.mockImplementation(async (input: WorkspaceRequest) => {
      if (input.action === 'load') return alpha;
      if (input.action === 'select') return beta;
      if (input.action === 'tree') return tree;
      if (input.action === 'changes') return { files: [] };
      throw new Error('Unexpected request');
    });
    open('/repositories');
    const status = await screen.findByRole('status', { name: 'Current workspace' });
    expect(within(status).getByText('owner/alpha / main')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Medium' }));
    expect(screen.getByRole('button', { name: 'Medium' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'List' }));
    expect(screen.getByRole('button', { name: 'List' }).getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Open owner/alpha' }));
    await screen.findByRole('radio', { name: /main/ });
    fireEvent.click(screen.getByRole('button', { name: 'All repositories' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open owner/beta' }));

    expect(confirm).toHaveBeenCalledWith('Want to switch from owner/alpha / main to owner/beta / trunk?');
    await screen.findByRole('heading', { name: 'Code Editor' });
    await screen.findByRole('button', { name: 'index.html' });
    expect(request).toHaveBeenCalledWith({ action: 'select', repositoryId: 2, branch: undefined });
    expect(request).toHaveBeenCalledWith(
      { action: 'tree', repositoryId: 2, branch: 'trunk', path: [] }, expect.any(AbortSignal),
    );

    fireEvent.click(screen.getByRole('link', { name: 'Repositories sidebar' }));
    expect(within(await screen.findByRole('status', { name: 'Current workspace' }))
      .getByText('owner/beta / trunk')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open owner/alpha' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open owner/beta' })).toBeTruthy();
  } finally {
    confirm.mockRestore();
  }
});

test('canceling a repository switch leaves the selected workspace and screen unchanged', async () => {
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
  try {
    request.mockImplementation(async (input: WorkspaceRequest) => {
      if (input.action === 'load') return alpha;
      throw new Error('A canceled switch must not invoke the backend');
    });
    open('/repositories');
    fireEvent.click(await screen.findByRole('button', { name: 'Open owner/beta' }));
    expect(confirm).toHaveBeenCalledWith('Want to switch from owner/alpha / main to owner/beta / trunk?');
    expect(within(screen.getByRole('status', { name: 'Current workspace' }))
      .getByText('owner/alpha / main')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open owner/beta' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Code Editor' })).toBeNull();
    expect(request.mock.calls.some(([input]) => input.action === 'select')).toBe(false);
  } finally {
    confirm.mockRestore();
  }
});

test('changing branches in the repository view requires confirmation and opens Code Editor', async () => {
  const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
  try {
    request.mockImplementation(async (input: WorkspaceRequest) => {
      if (input.action === 'load') return alpha;
      if (input.action === 'select') return { ...alpha, selection: { repositoryId: 1, branch: 'next' } };
      if (input.action === 'tree') return tree;
      if (input.action === 'changes') return { files: [] };
      throw new Error('Unexpected request');
    });
    open('/repositories');
    fireEvent.click(await screen.findByRole('button', { name: 'Open owner/alpha' }));
    const next = await screen.findByRole('radio', { name: /next/ });
    fireEvent.click(next);
    expect(confirm).toHaveBeenCalledWith('Want to switch from owner/alpha / main to owner/alpha / next?');
    expect(request.mock.calls.some(([input]) => input.action === 'select')).toBe(false);
    expect(within(screen.getByRole('status', { name: 'Current workspace' }))
      .getByText('owner/alpha / main')).toBeTruthy();

    fireEvent.click(next);
    await screen.findByRole('heading', { name: 'Code Editor' });
    expect(request).toHaveBeenCalledWith({ action: 'select', repositoryId: 1, branch: 'next' });
    expect(request).toHaveBeenCalledWith(
      { action: 'tree', repositoryId: 1, branch: 'next', path: [] }, expect.any(AbortSignal),
    );
  } finally {
    confirm.mockRestore();
  }
});

test('a first repository selection still opens its branch list without an automatic switch', async () => {
  const confirm = vi.spyOn(window, 'confirm');
  try {
    request.mockImplementation(async (input: WorkspaceRequest) => {
      if (input.action === 'load') return { ...alpha, selection: null, branches: [] };
      if (input.action === 'select') return beta;
      if (input.action === 'tree') return tree;
      if (input.action === 'changes') return { files: [] };
      throw new Error('Unexpected request');
    });
    open('/repositories');
    fireEvent.click(await screen.findByRole('button', { name: 'Open owner/beta' }));
    expect((await screen.findByRole<HTMLInputElement>('radio', { name: /trunk/ })).checked).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: 'Code Editor' })).toBeNull();
    fireEvent.click(screen.getByRole('link', { name: 'Open with Code Editor' }));
    await screen.findByRole('heading', { name: 'Code Editor' });
  } finally {
    confirm.mockRestore();
  }
});

test('switching to another repository preserves unsaved edit buffers in this session', async () => {
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
  try {
    request.mockImplementation(async (input: WorkspaceRequest) => {
      if (input.action === 'load') return alpha;
      if (input.action === 'select') return beta;
      if (input.action === 'tree') return tree;
      if (input.action === 'changes') return { files: [] };
      if (input.action === 'open_draft') return { current, draft: null };
      throw new Error('Unexpected request');
    });
    open('/code-editor');
    fireEvent.click(await screen.findByRole('button', { name: 'index.html' }));
    const editor = await screen.findByRole<HTMLTextAreaElement>('textbox', { name: 'Monaco source' });
    fireEvent.click(screen.getByRole('button', { name: 'Enable editing' }));
    fireEvent.change(editor, { target: { value: '<h1>Unsaved in alpha</h1>' } });
    await screen.findByText('Unsaved changes');

    fireEvent.click(screen.getByRole('link', { name: 'Repositories sidebar' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Open owner/beta' }));
    await screen.findByRole('heading', { name: 'Code Editor' });
    expect(await screen.findByText('Unsaved files in this session: 1. Reopen a file to continue editing or save it.')).toBeTruthy();
  } finally {
    confirm.mockRestore();
  }
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

test('restores the opened file, editing mode and unsaved text after visiting Settings', async () => {
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'load') return alpha;
    if (input.action === 'tree') return tree;
    if (input.action === 'open_draft') return { current, draft: null };
    if (input.action === 'changes') return { files: [] };
    throw new Error('Unexpected request');
  });
  open('/code-editor');
  fireEvent.click(await screen.findByRole('button', { name: 'index.html' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Enable editing' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Monaco source' }),
    { target: { value: '<h1>Resume me</h1>' } });
  fireEvent.click(screen.getByRole('link', { name: 'Settings sidebar' }));
  expect(await screen.findByRole('heading', { name: 'Mock Settings' })).toBeTruthy();
  fireEvent.click(screen.getByRole('link', { name: 'Code Editor sidebar' }));
  expect((await screen.findByRole<HTMLTextAreaElement>('textbox', { name: 'Monaco source' })).value)
    .toBe('<h1>Resume me</h1>');
  expect(screen.getByRole('button', { name: 'Read-only mode' })).toBeTruthy();
});

test('recovers unsaved code and last file from browser session storage after remount', async () => {
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'load') return alpha;
    if (input.action === 'tree') return tree;
    if (input.action === 'open_draft') return { current, draft: null };
    if (input.action === 'changes') return { files: [] };
    throw new Error('Unexpected request');
  });
  open('/code-editor');
  fireEvent.click(await screen.findByRole('button', { name: 'index.html' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Enable editing' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Monaco source' }),
    { target: { value: '<h1>Recover me</h1>' } });
  const key = JSON.stringify([1, 'main', 'index.html']);
  await waitFor(() => {
    expect(readEditorRecovery('owner').buffers[key]?.source).toBe('<h1>Recover me</h1>');
  });
  cleanup();
  open('/code-editor');
  expect((await screen.findByRole<HTMLTextAreaElement>('textbox', { name: 'Monaco source' })).value)
    .toBe('<h1>Recover me</h1>');
  expect(screen.getByRole('button', { name: 'Read-only mode' })).toBeTruthy();
});

test('every old history entry has a direct GitHub diff even if the CMS cannot load details', async () => {
  const oldSha = 'd'.repeat(40);
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'load') return alpha;
    if (input.action === 'tree') return tree;
    if (input.action === 'changes') return { files: [] };
    if (input.action === 'history') return {
      head: oldSha, refs: [{ name: 'main', sha: oldSha }],
      commits: [{ sha: oldSha, parents: ['c'.repeat(40)], message: 'Older commit',
        author: 'Contributor', date: '2026-11-19T12:00:00Z' }], next: null,
    };
    if (input.action === 'commit_detail') throw new Error('commit_out_of_scope');
    throw new Error('Unexpected request');
  });
  open('/code-editor');
  fireEvent.click(await screen.findByRole('tab', { name: 'History' }));
  const link = await screen.findByRole<HTMLAnchorElement>('link', { name: 'GitHub diff ↗' });
  expect(link.href).toBe(`https://github.com/owner/alpha/commit/${oldSha}`);
  expect(link.target).toBe('_blank');
  fireEvent.click(screen.getByRole('button', { name: /Older commit/ }));
  const fallback = await screen.findByRole<HTMLAnchorElement>('link', { name: 'View this commit on GitHub' });
  expect(fallback.href).toBe(link.href);
});
