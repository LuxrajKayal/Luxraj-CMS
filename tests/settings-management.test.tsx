import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { DraftManagementPage } from '../src/features/settings/DraftManagementPage';
import { StorageManagementPage } from '../src/features/settings/StorageManagementPage';
import { CommitLimitPage } from '../src/features/settings/CommitLimitPage';
import type { ManagedDraft, WorkspaceRequest } from '../supabase/functions/_shared/workspace-contracts';

const request = vi.hoisted(() => vi.fn());
vi.mock('../src/features/workspace/api', async original => ({
  ...await original<typeof import('../src/features/workspace/api')>(),
  workspaceRequest: request,
}));
vi.mock('../src/features/workspace/EditBuffers', () => ({
  useEditBuffers: () => ({ buffers: { '[1,"main","first.html"]': { source: 'unsaved' } } }),
}));

beforeEach(() => { request.mockReset(); });
afterEach(cleanup);

test('loads the persisted commit limit and saves an integer up to 100', async () => {
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'commit_limit') return { maximumFiles: 20 };
    if (input.action === 'save_commit_limit') return { maximumFiles: input.maximumFiles };
    throw new Error('Unexpected request');
  });
  render(<CommitLimitPage />);
  const input = await screen.findByRole<HTMLInputElement>('spinbutton', { name: 'Files per commit' });
  expect(input.value).toBe('20');
  expect(input.min).toBe('1');
  expect(input.max).toBe('100');
  fireEvent.change(input, { target: { value: '100' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save commit limit' }));
  await screen.findByText('Commit limit saved.');
  expect(request).toHaveBeenCalledWith({ action: 'save_commit_limit', maximumFiles: 100 });
});

const first: ManagedDraft = {
  repositoryId: 1, repository: 'owner/site', branch: 'main', path: 'first.html',
  pending: true, available: true, revision: 'old', updatedAt: '2026-11-20T10:00:00Z', contentBytes: 150,
};
const second = { ...first, branch: 'next', path: 'second.css', pending: false };

test('a committed draft and a new pending draft for the same path can be managed independently', async () => {
  const committed = { ...first, pending: false, revision: 'committed-revision', committedSha: 'a'.repeat(40) };
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'draft_catalog') return { files: [first, committed] };
    if (input.action === 'delete_drafts') return { results: input.drafts.map(item => ({ ...item, result: 'deleted' })) };
    throw new Error('Unexpected request');
  });
  render(<DraftManagementPage />);
  const committedRow = await screen.findByRole('row', { name: /Committed · aaaaaaaaaaaa/ });
  expect(screen.getByRole('row', { name: /Pending change/ })).toBeTruthy();
  fireEvent.click(within(committedRow).getByRole('button', { name: /^Delete / }));
  fireEvent.click(screen.getByRole('button', { name: 'Permanently delete' }));
  expect(request).toHaveBeenCalledWith({ action: 'delete_drafts', drafts: [{
    repositoryId: first.repositoryId, branch: first.branch, path: first.path, revision: committed.revision,
  }] });
});

test('individual deletion requires confirmation and bulk deletion reports partial results', async () => {
  let files = [first, second];
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'draft_catalog') return { files };
    if (input.action === 'delete_drafts') {
      files = [second];
      return { results: input.drafts.map(item => ({
        ...item, result: item.path === first.path ? 'deleted' : 'conflict',
      })) };
    }
    throw new Error('Unexpected request');
  });
  render(<DraftManagementPage />);
  fireEvent.click(await screen.findByRole('button', { name: 'Delete owner/site main first.html' }));
  const dialog = screen.getByRole('alertdialog');
  expect(within(dialog).getByText(/unsaved browser edits/)).toBeTruthy();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  expect(request.mock.calls.some(([input]) => input.action === 'delete_drafts')).toBe(false);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select all drafts' }));
  fireEvent.click(screen.getByRole('button', { name: 'Delete selected (2)' }));
  fireEvent.click(screen.getByRole('button', { name: 'Permanently delete' }));
  await screen.findByText('Deleted 1 of 2 drafts. 1 changed or were already removed.');
  await screen.findByText('1 saved drafts · 150 bytes of source text');
  expect(screen.getByText('Retained · unchanged')).toBeTruthy();
});

test('orphaned drafts are displayed with manual deletion even when GitHub is inaccessible', async () => {
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'draft_catalog') return { files: [{ ...first, repository: 'Repository #1 (unavailable)', available: false }] };
    if (input.action === 'delete_drafts') return { results: input.drafts.map(item => ({ ...item, result: 'deleted' })) };
    throw new Error('Unexpected request');
  });
  render(<DraftManagementPage />);
  expect(await screen.findByText('GitHub unavailable · manual cleanup')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Delete Repository #1 (unavailable) main first.html' }));
  expect(screen.getByText(/GitHub source files stay intact/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Permanently delete' }));
  expect(request).toHaveBeenCalledWith({ action: 'delete_drafts', drafts: [{
    repositoryId: first.repositoryId, branch: first.branch, path: first.path, revision: first.revision,
  }] });
});

test('shows server limits and unavailable storage honestly, then persists both allocations', async () => {
  const usage = {
    databaseBytes: 352_000_000, databaseLimitMb: 350, databaseCeilingMb: 450,
    fileBytes: null, fileLimitMb: 700, fileCeilingMb: 900,
    draftTableBytes: 2_000_000, draftContentBytes: 1_000_000,
  };
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'storage_status') return usage;
    if (input.action === 'storage_save') return { ...usage, ...input };
    throw new Error('Unexpected request');
  });
  render(<StorageManagementPage />);
  const database = await screen.findByRole('slider', { name: /PostgreSQL allocation/ });
  const storage = screen.getByRole('slider', { name: /File Storage allocation/ });
  expect(database.getAttribute('max')).toBe('450');
  expect(storage.getAttribute('max')).toBe('900');
  expect(screen.getByRole('alert').textContent).toContain('PostgreSQL has reached its allocation');
  expect(screen.getAllByText('Unavailable')).toHaveLength(2);
  fireEvent.change(database, { target: { value: '400' } });
  fireEvent.change(storage, { target: { value: '750' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save storage allocations' }));
  await screen.findByText('Storage allocations saved in Supabase.');
  expect(request).toHaveBeenCalledWith({ action: 'storage_save', databaseLimitMb: 400, fileLimitMb: 750 });
});
