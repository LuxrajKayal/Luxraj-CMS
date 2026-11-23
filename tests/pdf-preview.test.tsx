import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import PdfPreview from '../src/features/file-manager/PdfPreview';

const pdf = vi.hoisted(() => ({
  open: vi.fn(),
  renderPage: vi.fn(),
  getPage: vi.fn(),
  destroy: vi.fn(),
}));
vi.mock('pdfjs-dist', () => ({ getDocument: pdf.open, GlobalWorkerOptions: { workerSrc: '' } }));
vi.mock('pdfjs-dist/build/pdf.worker.min.mjs?url', () => ({ default: '/assets/pdf.worker.min.mjs' }));
afterEach(cleanup);

test('configures the PDF worker and renders selected pages to a bounded canvas', async () => {
  pdf.renderPage.mockReturnValue({ promise: Promise.resolve(), cancel: vi.fn() });
  pdf.destroy.mockResolvedValue(undefined);
  pdf.getPage.mockResolvedValue({
    getViewport: ({ scale }: { scale: number }) => ({ width: 2000 * scale, height: 1000 * scale }),
    render: pdf.renderPage,
  });
  pdf.open.mockReturnValue({ promise: Promise.resolve({ numPages: 2, getPage: pdf.getPage }), destroy: pdf.destroy });
  const bytes = new TextEncoder().encode('%PDF-1.7');
  const view = render(<PdfPreview bytes={bytes} />);
  expect(GlobalWorkerOptions.workerSrc).toBe('/assets/pdf.worker.min.mjs');
  await screen.findByText('Page 1 of 2');
  await waitFor(() => expect(pdf.renderPage).toHaveBeenCalledWith(expect.objectContaining({
    canvas: screen.getByLabelText('PDF page 1'), viewport: { width: 1200, height: 600 },
  })));
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  await waitFor(() => expect(pdf.getPage).toHaveBeenLastCalledWith(2));
  expect(pdf.open).toHaveBeenCalledWith(expect.objectContaining({ enableXfa: false, useWasm: false }));
  view.unmount();
  expect(pdf.destroy).toHaveBeenCalledOnce();
});
