import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useState } from 'react';
import { InjectionLines } from '../src/features/code-injector/InjectionLines';
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

test('standalone Source Control reviews a binary file and only commits after final confirmation', async () => {
  const path = 'uploads/unknown.payload';
  const reviewId = 'binary-review';
  const digest = 'd'.repeat(64);
  const sha = 'e'.repeat(40);
  const draft = { path, revision: 'binary-revision', file: true, updatedAt: '' };
  let committed = false;
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'load') return alpha;
    if (input.action === 'changes') return { files: committed ? [] : [draft], maximumFiles: 20 };
    if (input.action === 'diff') return { kind: 'file', revision: draft.revision };
    if (input.action === 'file_comparison') return {
      draft, original: null, proposed: { size: 2, sha256: digest, mime: 'application/octet-stream', contents: 'AP8=' },
    };
    if (input.action === 'review_commit') return { id: reviewId, repository: 'owner/alpha', branch: 'main',
      head: tree.commit, message: input.message, files: input.files.map(file => ({ ...file,
        file: { size: 2, sha256: digest, originalBlob: null } })),
    };
    if (input.action === 'confirm_commit') {
      committed = true;
      return { sha, url: 'https://github.com/owner/alpha/commit/' + sha, fileCount: 1, retained: 1 };
    }
    throw new Error('Unexpected request');
  });
  open('/source-control');
  fireEvent.click(await screen.findByRole('button', { name: /unknown.payload.*File upload/ }));
  const comparison = await screen.findByRole('region', { name: 'File comparison' }, { timeout: 5000 });
  expect(within(comparison).getByText('New file · ' + path)).toBeTruthy();
  expect(within(comparison).getByText(digest)).toBeTruthy();
  expect(screen.queryByRole('textbox', { name: 'Monaco source' })).toBeNull();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Include ' + path + ' in commit' }));
  fireEvent.change(screen.getByLabelText('Commit message'), { target: { value: 'Publish reviewed file' } });
  fireEvent.click(screen.getByRole('button', { name: 'Review & Commit' }));
  const dialog = await screen.findByRole('dialog', { name: 'Confirm GitHub commit' });
  expect(within(dialog).getByText(digest)).toBeTruthy();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  expect(request.mock.calls.some(([input]) => input.action === 'confirm_commit')).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Review & Commit' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Confirm commit' }));
  await screen.findByRole('link', { name: sha.slice(0, 12) });
  expect(request.mock.calls.filter(([input]) => input.action === 'confirm_commit'))
    .toEqual([[{ action: 'confirm_commit', repositoryId: 1, branch: 'main', reviewId }]]);
});

test('injects a saved group into different source types with independent line and match decisions', async () => {
  const template = { id: 'card', name: 'Card CSS', kind: 'css', source: '.card { color: red }' };
  const html = '<html><head>\n<style>.card { color: blue }</style>\n</head></html>';
  const css = '.card { color: blue }\n.keep { padding: 3px }\n';
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'load') return alpha;
    if (input.action === 'injector_catalog') return { templates: [template],
      groups: [{ id: 'group', name: 'Theme', templateIds: ['card'] }] };
    if (input.action === 'discover_sources') return { commit: tree.commit, files: ['nested/page.htm', 'other.html', 'styles.css'] };
    if (input.action === 'scan_injector_html') return { matches: ['nested/page.htm'], unreadable: [] };
    if (input.action === 'open_draft') return {
      current: { ...current, source: input.path.at(-1) === 'styles.css' ? css : html }, draft: null,
    };
    if (input.action === 'save_draft') {
      if (input.path[0] === 'styles.css') throw new Error('draft_conflict');
      return { draft: { revision: 'saved' } };
    }
    throw new Error('Unexpected request');
  });
  open('/code-injector/inject');
  fireEvent.click(await screen.findByRole('button', { name: 'Use Theme' }, { timeout: 5000 }));
  fireEvent.click(screen.getByRole('radio', { name: 'Universal Mode' }));
  fireEvent.click(screen.getByRole('button', { name: 'Detect' }));
  fireEvent.click(await screen.findByRole('checkbox', { name: 'Select file nested/page.htm' }));
  await screen.findByRole('button', { name: 'Insert before line 1' });
  expect(screen.getAllByRole('img', { name: 'All items match' })).toHaveLength(2);
  expect(screen.getByRole('checkbox', { name: 'Select file other.html' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Insert before line 3' }));
  fireEvent.click(screen.getByRole('radio', { name: 'Duplicate' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select file styles.css' }));
  await screen.findByText('.keep { padding: 3px }');
  fireEvent.click(screen.getByRole('radio', { name: 'Replace' }));
  fireEvent.click(screen.getByRole('button', { name: 'Preview insertion' }));
  await screen.findByText(/styles.css: Choose an insertion line/);
  expect(screen.queryByRole('button', { name: 'Save Draft' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Insert before line 2' }));
  fireEvent.click(screen.getByRole('button', { name: 'Preview insertion' }));
  const proposal = await screen.findByLabelText('Proposed source');
  expect(proposal.textContent).toContain('.card { color: blue }');
  expect(proposal.textContent).toContain('.card { color: red }');
  fireEvent.change(screen.getByLabelText('Active source file'), { target: { value: 'styles.css' } });
  await waitFor(() => expect(screen.getByLabelText('Proposed source').textContent).toContain('.keep { padding: 3px }'));
  expect(screen.getByLabelText('Proposed source').textContent).not.toContain('color: blue');
  fireEvent.click(screen.getByRole('button', { name: 'Save Draft' }));
  await screen.findByRole('link', { name: 'Saved · review in Code Editor' });
  await screen.findByText(/draft changed in another session/i);
  expect(request.mock.calls.filter(([input]) => input.action === 'save_draft').map(([input]) => input.path))
    .toEqual([['nested', 'page.htm'], ['styles.css']]);
  expect(request.mock.calls.some(([input]) => ['confirm_commit', 'review_commit'].includes(input.action))).toBe(false);
});

test('creates reusable named templates and groups in the catalog without editing source', async () => {
  const template = { id: 'new', name: 'Site title', kind: 'html', source: '<title>Example</title>' };
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'load') return alpha;
    if (input.action === 'injector_catalog') return { templates: [], groups: [] };
    if (input.action === 'injector_template_add') return template;
    if (input.action === 'injector_group_add') return { id: 'g', name: 'Metadata', templateIds: ['new'] };
    throw new Error('Unexpected request');
  });
  open('/code-injector/inject');
  fireEvent.click(await screen.findByRole('button', { name: 'Add code template' }));
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Site title' } });
  fireEvent.change(screen.getByLabelText('Code'), { target: { value: template.source } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  fireEvent.click(await screen.findByRole('checkbox', { name: 'Select template Site title' }));
  fireEvent.click(screen.getByRole('button', { name: 'Create New Group' }));
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Metadata' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await screen.findByRole('button', { name: 'Use Metadata' });
  expect(request).toHaveBeenCalledWith({ action: 'injector_group_add', name: 'Metadata', templateIds: ['new'] });
  expect(request.mock.calls.some(([input]) => input.action === 'save_draft')).toBe(false);
});

test('Selection Mode returns only CMS-matched HTML while Universal Mode includes unrelated source candidates', async () => {
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'load') return alpha;
    if (input.action === 'injector_catalog') return { templates: [], groups: [] };
    if (input.action === 'discover_sources') return { commit: tree.commit, files: ['matching.html', 'unmatched.html', 'app.css', 'script.js'] };
    if (input.action === 'scan_injector_html') return { matches: ['matching.html'], unreadable: [] };
    throw new Error('Unexpected request');
  });
  open('/code-injector/inject');
  fireEvent.click(await screen.findByRole('button', { name: 'Detect' }));
  await screen.findByRole('checkbox', { name: 'Select file matching.html' });
  expect(screen.queryByRole('checkbox', { name: 'Select file unmatched.html' })).toBeNull();
  expect(screen.queryByRole('checkbox', { name: 'Select file app.css' })).toBeNull();
  expect(request.mock.calls.some(([input]) => input.action === 'scan_injector_html')).toBe(true);
  fireEvent.click(screen.getByRole('radio', { name: 'Universal Mode' }));
  expect(screen.queryByLabelText('Website Type')).toBeNull();
  expect(screen.queryByRole('checkbox', { name: 'Select file matching.html' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Detect' }));
  await screen.findByRole('checkbox', { name: 'Select file unmatched.html' });
  expect(screen.getByRole('checkbox', { name: 'Select file app.css' })).toBeTruthy();
  expect(screen.getByRole('checkbox', { name: 'Select file script.js' })).toBeTruthy();
  expect(request.mock.calls.filter(([input]) => input.action === 'scan_injector_html')).toHaveLength(1);
});

test('clicked source rows expose inline insertion preview and the explicit preview action', () => {
  function Lines() {
    const [offset, setOffset] = useState<number | null>(null);
    return <InjectionLines source={'first\nsecond'} offset={offset} choose={setOffset}
      disabled={false} previewCode={'<meta name="description" content="Test">'}
      canPreview={true} onPreview={() => {}} />;
  }
  render(<Lines />);
  fireEvent.click(screen.getByRole('button', { name: 'Insert before line 2' }));
  expect(screen.getByText(/Selected insertion location: before line 2/)).toBeTruthy();
  expect(screen.getByLabelText('Inline code insertion preview').textContent).toContain('description');
  expect(screen.getByRole('button', { name: 'Preview insertion here' })).toBeTruthy();
  expect(screen.getByText('second')).toBeTruthy();
});

test('editing a saved template keeps its stable ID and its saved group membership', async () => {
  const original = { id: 'a'.repeat(8) + '-bbbb-cccc-dddd-' + 'e'.repeat(12), name: 'SEO Sample',
    kind: 'html' as const, source: '<meta name="description" content="Original">' };
  const updated = { ...original, source: '<meta name="description" content="Updated">' };
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'load') return alpha;
    if (input.action === 'injector_catalog') return { templates: [original], groups: [
      { id: 'group', name: 'SEO Group', templateIds: [original.id] },
    ] };
    if (input.action === 'injector_template_update') return updated;
    throw new Error('Unexpected request');
  });
  open('/code-injector/inject');
  fireEvent.click(await screen.findByRole('button', { name: 'Edit template SEO Sample' }));
  fireEvent.change(screen.getByLabelText('Code'), { target: { value: updated.source } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await screen.findByRole('button', { name: 'Use SEO Group' });
  expect(request).toHaveBeenCalledWith({ action: 'injector_template_update', id: original.id,
    name: original.name, kind: original.kind, source: updated.source });
  fireEvent.click(screen.getByRole('button', { name: 'Edit template SEO Sample' }));
  expect((screen.getByLabelText('Code') as HTMLTextAreaElement).value).toBe(updated.source);
});

test('Source Control enforces the saved commit limit independently of the draft list', async () => {
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'load') return alpha;
    if (input.action === 'tree') return tree;
    if (input.action === 'changes') return { maximumFiles: 1, files: [
      { path: 'index.html', revision: 'first', updatedAt: '' },
      { path: 'site.css', revision: 'second', updatedAt: '' },
    ] };
    throw new Error('Unexpected request');
  });
  open('/code-editor');
  fireEvent.click(await screen.findByRole('button', { name: 'Source Control activity' }));
  fireEvent.click(await screen.findByRole('checkbox', { name: 'Include index.html in commit' }));
  const second = screen.getByRole('checkbox', { name: 'Include site.css in commit' });
  fireEvent.click(second);
  fireEvent.change(screen.getByLabelText('Commit message'), { target: { value: 'Test' } });
  const review = screen.getByRole<HTMLButtonElement>('button', { name: 'Review & Commit' });
  expect(review.disabled).toBe(true);
  expect(screen.getByText('Select up to 1 files per commit.')).toBeTruthy();
  fireEvent.click(second);
  expect(review.disabled).toBe(false);
});

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
  fireEvent.click(screen.getByRole('button', { name: 'Source Control activity' }));
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
  fireEvent.click(await screen.findByRole('button', { name: 'History activity' }));
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
          <Route path="/code-injector/*" element={<CodeInjectorPage />} />
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
  expect(screen.queryByRole('complementary', { name: 'Source Control' })).toBeNull();
  fireEvent.click(panel);
  expect(screen.getByRole('complementary', { name: 'Source Control' })).toBeTruthy();
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
  fireEvent.click(await screen.findByRole('button', { name: 'History activity' }));
  const link = await screen.findByRole<HTMLAnchorElement>('link', { name: 'GitHub diff ↗' });
  expect(link.href).toBe(`https://github.com/owner/alpha/commit/${oldSha}`);
  expect(link.target).toBe('_blank');
  fireEvent.click(screen.getByRole('button', { name: /Older commit/ }));
  const fallback = await screen.findByRole<HTMLAnchorElement>('link', { name: 'View this commit on GitHub' });
  expect(fallback.href).toBe(link.href);
});

test('IDE activity switches sidebars, searches loaded folders and keeps unsaved edits intact', async () => {
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'load') return alpha;
    if (input.action === 'tree') return { commit: tree.commit, entries: input.path.length ?
      [{ name: 'main.css', kind: 'file' }] : [...tree.entries, { name: 'assets', kind: 'folder' }] };
    if (input.action === 'changes') return { files: [] };
    if (input.action === 'open_draft') return { current, draft: null };
    throw new Error('Unexpected request');
  });
  open('/code-editor');
  fireEvent.click(await screen.findByRole('button', { name: 'assets' }));
  await screen.findByRole('button', { name: 'main.css' });
  fireEvent.click(screen.getByRole('button', { name: 'Search files' }));
  fireEvent.change(screen.getByRole('searchbox', { name: 'Find loaded files' }), { target: { value: 'main.css' } });
  fireEvent.click(screen.getByRole('button', { name: 'main.css' }));
  const editor = await screen.findByRole<HTMLTextAreaElement>('textbox', { name: 'Monaco source' });
  fireEvent.click(screen.getByRole('button', { name: 'Enable editing' }));
  fireEvent.change(editor, { target: { value: 'body { color: red; }' } });
  fireEvent.click(screen.getByRole('button', { name: 'Source Control activity' }));
  expect(screen.queryByRole('complementary', { name: 'Files' })).toBeNull();
  expect(screen.getByRole('complementary', { name: 'Source Control' })).toBeTruthy();
  expect(editor.value).toBe('body { color: red; }');
  fireEvent.click(screen.getByRole('button', { name: 'Focus' }));
  expect(screen.queryByRole('complementary', { name: 'Source Control' })).toBeNull();
  expect(editor.value).toBe('body { color: red; }');
  fireEvent.click(screen.getByRole('button', { name: 'Exit focus' }));
  fireEvent.click(screen.getByRole('button', { name: 'File explorer' }));
  fireEvent.click(screen.getByRole('button', { name: 'Close current file' }));
  fireEvent.click(screen.getByRole('button', { name: 'main.css' }));
  expect((await screen.findByRole<HTMLTextAreaElement>('textbox', { name: 'Monaco source' })).value).toBe('body { color: red; }');
});
