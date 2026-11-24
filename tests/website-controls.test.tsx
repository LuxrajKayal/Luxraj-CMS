import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import type { WebsiteControl, Workspace, WorkspaceRequest } from '../supabase/functions/_shared/workspace-contracts';
import { MaintenancePage } from '../src/features/settings/MaintenancePage';
import WebsiteControlsPage from '../src/features/website-controls/WebsiteControlsPage';
import { RepositoryFilePicker } from '../src/features/website-controls/RepositoryFilePicker';
import { controlDocument, downloadDestination, outputBatch } from '../src/features/website-controls/bridge';

const request = vi.hoisted(() => vi.fn());
const state = vi.hoisted(() => ({ workspace: {
  repositories: [{ id: 12, name: 'owner/one' }, { id: 25, name: 'owner/two' }],
  selection: { repositoryId: 12, branch: 'main' },
} as Workspace }));
vi.mock('../src/features/workspace/api', async original => ({
  ...await original<typeof import('../src/features/workspace/api')>(), workspaceRequest: request,
}));
vi.mock('../src/features/workspace/WorkspaceLayout', () => ({ useWorkspace: () => state }));

beforeEach(() => { request.mockReset(); state.workspace.selection = { repositoryId: 12, branch: 'main' }; });
afterEach(() => cleanup());

test('registers controls with optional inputs and restores the proper repository and branch on reopen', async () => {
  const stored = new Map<string, WebsiteControl[]>();
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'file_manager_tree') return { entries: ['tool.html', 'one.txt', 'two.raw'].map(name => ({ name, kind: 'file' })) };
    if (input.action !== 'website_list' && input.action !== 'website_register') throw new Error('Unexpected request');
    const key = [input.repositoryId, input.branch].join('/');
    const controls = stored.get(key) ?? [];
    if (input.action === 'website_list') return { controls };
    const control = { ...input.registration, id: 'c' + controls.length };
    stored.set(key, [...controls, control]);
    return { control };
  });
  const page = <MemoryRouter><WebsiteControlsPage /></MemoryRouter>;
  const view = render(page);
  await screen.findByText('No controls are registered for this branch.');
  fireEvent.click(screen.getByRole('button', { name: 'Add Control' }));
  fireEvent.change(screen.getByLabelText('Control name'), { target: { value: 'Standalone' } });
  fireEvent.change(screen.getByLabelText('HTML application'), { target: { value: 'tool.html' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save Control' }));
  await screen.findByRole('heading', { name: 'Standalone' });
  fireEvent.click(screen.getByRole('button', { name: 'Add Control' }));
  fireEvent.change(screen.getByLabelText('Control name'), { target: { value: 'Multiple files' } });
  fireEvent.click(screen.getByRole('button', { name: 'Browse HTML applications' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Select file tool.html' }));
  expect(screen.queryByRole('button', { name: 'Select file one.txt' })).toBeNull();
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Open' }));
  fireEvent.click(screen.getByRole('button', { name: 'Add associated files' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Select file one.txt' }));
  fireEvent.click(screen.getByRole('button', { name: 'Select file two.raw' }));
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Open' }));
  fireEvent.change(screen.getByLabelText(/Output destination paths/), { target: { value: 'new\nfolder/replace.raw' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save Control' }));
  await screen.findByRole('heading', { name: 'Multiple files' });
  expect(stored.get('12/main')).toMatchObject([
    { name: 'Standalone', application: 'tool.html', inputs: [], destinations: [] },
    { name: 'Multiple files', application: 'tool.html', inputs: ['one.txt', 'two.raw'], destinations: ['new', 'folder/replace.raw'] },
  ]);
  view.unmount();
  for (const selection of [{ repositoryId: 12, branch: 'dev' }, { repositoryId: 25, branch: 'main' }]) {
    state.workspace.selection = selection;
    const other = render(<MemoryRouter><WebsiteControlsPage /></MemoryRouter>);
    await screen.findByText('No controls are registered for this branch.');
    expect(screen.queryByRole('heading', { name: 'Standalone' })).toBeNull();
    other.unmount();
  }
  state.workspace.selection = { repositoryId: 12, branch: 'main' };
  render(<MemoryRouter><WebsiteControlsPage /></MemoryRouter>);
  await screen.findByRole('heading', { name: 'Standalone' });
  await screen.findByRole('heading', { name: 'Multiple files' });
});

test('file bridge preserves typed-array slices, text and configured paths without an extension policy', async () => {
  const bytes = Uint8Array.of(9, 0, 128, 255, 8);
  const batch = outputBatch([
    { name: 'new', type: 'text/plain', data: '雪\r\n', path: 'suggested' },
    { name: 'packet.xyz', data: bytes.subarray(1, 4), path: 'folder/packet.xyz' },
    new File([bytes], 'source.dat'),
  ], ['preset']);
  expect(batch.map(item => item.destination)).toEqual(['preset', 'folder/packet.xyz', 'source.dat']);
  expect(await batch[0].blob.text()).toBe('雪\r\n');
  expect(new Uint8Array(await batch[1].blob.arrayBuffer())).toEqual(Uint8Array.of(0, 128, 255));
  expect(new Uint8Array(await batch[2].blob.arrayBuffer())).toEqual(bytes);
  expect(() => outputBatch([{ name: '../bad', data: bytes }], [])).toThrow('valid filename');
  expect(() => outputBatch([{ name: 'huge', data: new ArrayBuffer(8 * 1024 * 1024 + 1) }], [])).toThrow('8 MiB');
  const html = controlDocument('<!-- comment --><!DOCTYPE html><script>start()</script>', 'session');
  expect(html.startsWith('<!-- comment --><!DOCTYPE html>')).toBe(true);
  expect(html.indexOf('LuxrajCMS')).toBeLessThan(html.indexOf('start()'));
});

test('maintenance confirms each operation, follows cleanup batches and reports remaining drafts', async () => {
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action !== 'website_maintenance') throw new Error('Unexpected request');
    if (input.mode === 'controls') return { deleted: 0, next: null, remaining: null, reset: true };
    if (input.mode === 'drafts' && !input.after) return { deleted: 15, next: 'cursor', remaining: null, reset: false };
    if (input.mode === 'drafts') return { deleted: 1, next: null, remaining: 2, reset: false };
    return { deleted: 2, next: null, remaining: 0, reset: true };
  });
  render(<MaintenancePage />);
  function choose(name: string) { fireEvent.click(screen.getByRole('button', { name })); }
  choose('Clear Website Control Preferences');
  expect(request).not.toHaveBeenCalled();
  fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));
  expect(request).not.toHaveBeenCalled();
  choose('Clear Website Control Preferences');
  choose('Confirm cleanup');
  await screen.findByText('Website Control preferences cleared.');
  choose('Clear All Drafts');
  choose('Confirm cleanup');
  await screen.findByText('16 drafts cleared.');
  expect((await screen.findByRole('alert')).textContent).toContain('2 drafts remain');
  choose('Clear All Settings and Drafts');
  choose('Confirm cleanup');
  await screen.findByText('2 drafts cleared. CMS settings reset.');
});

test('captured downloads prefer configured destinations or a unique matching repository input', () => {
  expect(downloadDestination('settings.json', [], ['site/settings/settings.json'])).toBe('site/settings/settings.json');
  expect(downloadDestination('settings.json', ['other/settings.json'], ['site/settings/settings.json'])).toBe('other/settings.json');
  expect(downloadDestination('settings.json', [], ['one/settings.json', 'two/settings.json'])).toBe('settings.json');
  expect(downloadDestination('out.bin', [], ['site/settings/settings.json'])).toBe('out.bin');
  expect(downloadDestination('out.bin', ['renamed.dat'], [])).toBe('renamed.dat');
  const internal = controlDocument('<!doctype html><script>start()</script>', 'nonce');
  const local = controlDocument('<!doctype html><script>start()</script>', 'nonce', 'local');
  expect(internal).toContain('"nonce","internal"');
  expect(local).toContain('"nonce","local"');
  expect(internal.indexOf('native-pick')).toBeLessThan(internal.indexOf('start()'));
  expect(internal).toContain('native-files');
  expect(internal).toContain('DataTransfer');
});

test('repository explorer navigates folders, searches, switches views and confirms multi-file selections', async () => {
  const choose = vi.fn(), cancel = vi.fn();
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action !== 'file_manager_tree') throw new Error('Unexpected request');
    return { entries: input.path.length ? [{ name: 'settings.json', kind: 'file' }, { name: 'other.bin', kind: 'file' }] :
      [{ name: 'site', kind: 'folder' }, { name: 'root.md', kind: 'file' }] };
  });
  render(<RepositoryFilePicker scope={{ repositoryId: 12, branch: 'main' }} label="Select files" multiple onPick={choose} onCancel={cancel} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Select file root.md' }));
  fireEvent.click(screen.getByRole('button', { name: 'Open folder site' }));
  await screen.findByRole('button', { name: 'Select file settings.json' });
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'settings' } });
  expect(screen.queryByRole('button', { name: 'Select file other.bin' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Icon view' }));
  fireEvent.click(screen.getByRole('button', { name: 'Select file settings.json' }));
  fireEvent.click(screen.getByRole('button', { name: 'Open' }));
  expect(choose).toHaveBeenCalledWith(['root.md', 'site/settings.json']);
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(cancel).toHaveBeenCalledOnce();
});

test('repository destination explorer allows a new filename in a selected folder', async () => {
  const choose = vi.fn();
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action !== 'file_manager_tree') throw new Error('Unexpected request');
    return { entries: input.path.length ? [{ name: 'old.json', kind: 'file' }] : [{ name: 'site', kind: 'folder' }] };
  });
  render(<RepositoryFilePicker scope={{ repositoryId: 12, branch: 'main' }} label="Destination" destination="new.json" onPick={choose} onCancel={() => {}} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Open folder site' }));
  await screen.findByRole('button', { name: 'Select file old.json' });
  fireEvent.change(screen.getByLabelText('File name'), { target: { value: 'new.json' } });
  fireEvent.click(screen.getByRole('button', { name: 'Use destination' }));
  expect(choose).toHaveBeenCalledWith(['site/new.json']);
});

test('destination explorer starts in the existing target folder', async () => {
  const choose = vi.fn();
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action !== 'file_manager_tree') throw new Error('Unexpected request');
    return { entries: input.path.length ? [{ name: 'settings.json', kind: 'file' }] : [{ name: 'site', kind: 'folder' }] };
  });
  render(<RepositoryFilePicker scope={{ repositoryId: 12, branch: 'main' }} label="Destination" destination="site/settings.json" onPick={choose} onCancel={() => {}} />);
  await screen.findByRole('button', { name: 'Select file settings.json' });
  fireEvent.click(screen.getByRole('button', { name: 'Use destination' }));
  expect(choose).toHaveBeenCalledWith(['site/settings.json']);
});
