import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import type { WebsiteControl, Workspace, WorkspaceRequest } from '../supabase/functions/_shared/workspace-contracts';
import { MaintenancePage } from '../src/features/settings/MaintenancePage';
import WebsiteControlsPage from '../src/features/website-controls/WebsiteControlsPage';
import { controlDocument, outputBatch } from '../src/features/website-controls/bridge';

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
  await screen.findByRole('option', { name: 'tool.html' });
  expect(screen.queryByRole('option', { name: 'one.txt' })).toBeNull();
  fireEvent.change(screen.getByLabelText('File'), { target: { value: 'tool.html' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add associated files' }));
  await screen.findByRole('option', { name: 'one.txt' });
  fireEvent.change(screen.getByLabelText('File'), { target: { value: 'one.txt' } });
  fireEvent.change(screen.getByLabelText('File'), { target: { value: 'two.raw' } });
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
