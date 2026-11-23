import { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerUrl;

export default function PdfPreview({ bytes }: { bytes: Uint8Array<ArrayBuffer> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const task = getDocument({ data: bytes.slice(), enableXfa: false, useWasm: false,
      disableFontFace: true, maxImageSize: 6000000, canvasMaxAreaInBytes: 24000000 });
    let active = true;
    task.promise.then(value => { if (active) setDocument(value); }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; void task.destroy().catch(() => {}); };
  }, [bytes]);
  useEffect(() => {
    if (!document || !canvas.current || failed) return;
    const output = canvas.current;
    let active = true;
    let cancel: (() => void) | undefined;
    document.getPage(page).then(value => {
      if (!active) return;
      const original = value.getViewport({ scale: 1 });
      const viewport = value.getViewport({ scale: Math.min(1.5, 1200 / Math.max(original.width, original.height)) });
      output.width = Math.ceil(viewport.width);
      output.height = Math.ceil(viewport.height);
      const task = value.render({ canvas: output, viewport });
      cancel = () => task.cancel();
      return task.promise;
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; cancel?.(); };
  }, [document, page, failed]);

  if (failed) return <p>Preview unavailable for this format.</p>;
  return <div className="file-preview">
    {!document && <p role="status">Loading PDF…</p>}
    {document && <div className="workspace-actions">
      <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous page</button>
      <span>Page {page} of {document.numPages}</span>
      <button type="button" disabled={page >= document.numPages} onClick={() => setPage(page + 1)}>Next page</button>
    </div>}
    <canvas ref={canvas} aria-label={'PDF page ' + page} hidden={!document} />
  </div>;
}
