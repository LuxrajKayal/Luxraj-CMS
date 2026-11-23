/// <reference types="node" />
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import type { WorkspaceRequest } from '../supabase/functions/_shared/workspace-contracts';
import { encodeBytes, sha256 } from '../supabase/functions/_shared/file-bytes';
import FileManagerPage from '../src/features/file-manager/FileManagerPage';
import { CompareFiles } from '../src/features/file-manager/FileComparison';
import { previewFormat } from '../src/features/file-manager/preview-format';
import { sanitizeDocument } from '../src/features/file-manager/DocxPreview';
import { verifyPublicPicture } from '../src/features/file-manager/profile-proof';
import { ProfilePictureLocationPage } from '../src/features/settings/ProfilePictureLocationPage';

const request = vi.hoisted(() => vi.fn());
vi.mock('../src/features/workspace/api', async original => ({
  ...await original<typeof import('../src/features/workspace/api')>(), workspaceRequest: request,
}));
vi.mock('../src/features/workspace/WorkspaceLayout', () => ({
  useWorkspace: () => ({ workspace: {
    selection: { repositoryId: 9, branch: 'release' },
    repositories: [{ id: 9, name: 'owner/site', defaultBranch: 'release' }], branches: ['release'],
  }, saving: false, select: vi.fn() }),
  BranchPicker: () => <span>release</span>,
}));
vi.mock('../src/features/workspace/EditBuffers', () => ({ useEditBuffers: () => ({ buffers: {} }) }));

beforeEach(() => { request.mockReset(); vi.stubGlobal('crypto', webcrypto); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const head = 'a'.repeat(40);
const original = { size: 2, sha256: 'b'.repeat(64), mime: '', blob: 'a'.repeat(40), contents: 'AAE=' };

test('File Manager inspects multiple uploads, stages exact bytes and reopens a saved replacement', async () => {
  const stored: { path: string; revision: string; originalBlob: string | null; committedSha: null;
    sha256: string; mime: string; size: number }[] = [];
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'file_manager_tree') return { commit: head, entries: [{ name: 'old.dat', kind: 'file' }] };
    if (input.action === 'file_drafts') return { drafts: [...stored] };
    if (input.action === 'file_inspect') return { commit: head, original: input.path[0] === 'old.dat' ? original : null };
    if (input.action === 'file_save') {
      const draft = { path: input.path.join('/'), revision: 'r-' + input.path[0], originalBlob: input.originalBlob,
        committedSha: null, sha256: input.sha256, mime: input.mime, size: input.size };
      stored.push(draft);
      return { draft };
    }
    if (input.action === 'file_comparison') return { original, proposed: { ...original, sha256: 'c'.repeat(64) } };
    throw new Error('Unexpected request');
  });
  const view = render(<MemoryRouter><FileManagerPage /></MemoryRouter>);
  const input = await screen.findByLabelText<HTMLInputElement>('Upload files');
  await waitFor(() => expect(input.disabled).toBe(false));
  const unknown = Uint8Array.of(0, 4, 255, 128);
  const first = new File([unknown], 'old.dat', { type: 'application/octet-stream' });
  const next = new File(['%PDF-1.4'], 'new.pdf', { type: 'application/pdf' });
  Object.defineProperty(first, 'arrayBuffer', { value: async () => unknown.buffer });
  Object.defineProperty(next, 'arrayBuffer', { value: async () => new TextEncoder().encode('%PDF-1.4').buffer });
  fireEvent.change(input, { target: { files: [first, next] } });
  fireEvent.click(screen.getByRole('button', { name: 'Inspect old.dat' }));
  const comparison = await screen.findByRole('region', { name: 'File comparison' });
  expect(within(comparison).getByText('Replacement · old.dat')).toBeTruthy();
  expect(within(comparison).getAllByText('Preview unavailable for this format.')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'Inspect new.pdf' }));
  await screen.findByText('New file inspected');
  fireEvent.click(screen.getByRole('button', { name: 'Save all inspected drafts' }));
  await screen.findByText(/2 of 2 file drafts saved/);
  const calls = request.mock.calls.map(([value]) => value).filter(input => input.action === 'file_save');
  expect(calls[0]).toEqual(expect.objectContaining({
    originalBlob: original.blob, contents: encodeBytes(unknown), sha256: await sha256(unknown), branch: 'release',
  }));
  expect(calls[1]).toEqual(expect.objectContaining({ originalBlob: null, path: ['new.pdf'] }));
  expect(request.mock.calls.some(([input]) => input.action.includes('commit'))).toBe(false);
  view.unmount();
  render(<MemoryRouter><FileManagerPage /></MemoryRouter>);
  fireEvent.click(await screen.findByRole('button', { name: 'Open old.dat' }));
  expect(await screen.findByText('Replacement · old.dat')).toBeTruthy();
});

test('preview selection sniffs real raster signatures and protects active content and unknown bytes', () => {
  const png = Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10);
  expect(previewFormat(png, 'extensionless')).toEqual({ type: 'image', mime: 'image/png' });
  expect(previewFormat(new TextEncoder().encode('<svg onload="alert(1)"/>'), 'fake.png', 'image/png')).toBeNull();
  expect(previewFormat(new TextEncoder().encode('%PDF-1.7'), 'without.extension')?.type).toBe('pdf');
  expect(previewFormat(new TextEncoder().encode('Hello'), 'notes.txt')).toEqual({ type: 'text', text: 'Hello' });
  expect(sanitizeDocument('<h2 id="bad" onclick="alert(1)">Heading</h2><img src="https://bad"><a href="javascript:x">Link</a><script>danger</script>'))
    .toBe('<h2>Heading</h2>Link');
  render(<CompareFiles path="archive.zip" original={original} proposed={original} />);
  expect(screen.getAllByText('Preview unavailable for this format.')).toHaveLength(2);
  expect(screen.getByRole('button', { name: 'Download previous file' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Download proposed file' })).toBeTruthy();
});

test('settings persists the selected folder and public prefix, and public proof requires exact WebP bytes', async () => {
  request.mockImplementation(async (input: WorkspaceRequest) => {
    if (input.action === 'profile_picture_location') return { location: null };
    if (input.action === 'file_manager_tree') return { commit: head, entries: input.path.length ? [] : [{ name: 'assets', kind: 'folder' }] };
    if (input.action === 'save_profile_picture_location') return { location: {
      repositoryId: 9, branch: 'release', folder: 'assets', publicPrefix: 'https://example.test/public/',
    } };
    throw new Error('Unexpected request');
  });
  render(<MemoryRouter><ProfilePictureLocationPage /></MemoryRouter>);
  await screen.findByRole('option', { name: 'assets' });
  fireEvent.change(screen.getByLabelText('Open subfolder'), { target: { value: 'assets' } });
  fireEvent.change(screen.getByLabelText('Public asset URL prefix'), { target: { value: 'https://example.test/public/' } });
  const save = screen.getByRole<HTMLButtonElement>('button', { name: 'Save picture location' });
  await waitFor(() => expect(save.disabled).toBe(false));
  fireEvent.click(save);
  await screen.findByText('Picture location saved.');
  expect(request).toHaveBeenCalledWith({ action: 'save_profile_picture_location', repositoryId: 9,
    branch: 'release', folder: 'assets', publicPrefix: 'https://example.test/public/' });
  const image = new Uint8Array(15000);
  image.set(new TextEncoder().encode('RIFF'));
  image.set(new TextEncoder().encode('WEBPVP8 '), 8);
  new DataView(image.buffer).setUint32(4, image.length - 8, true);
  const fakeFetch = vi.fn(async () => new Response(image, { headers: { 'Content-Type': 'image/webp' } }));
  const signal = new AbortController().signal;
  expect(await verifyPublicPicture('https://example.test/public/one.webp', await sha256(image), signal, fakeFetch)).toBe(true);
  expect(await verifyPublicPicture('https://example.test/public/one.webp', '1'.repeat(64), signal, fakeFetch)).toBe(false);
  expect(fakeFetch.mock.calls.length).toBe(2);
});
