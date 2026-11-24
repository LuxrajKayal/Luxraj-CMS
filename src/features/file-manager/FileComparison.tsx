import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { decodeBytes } from '../../../supabase/functions/_shared/file-bytes';
import type { FileComparison as Comparison, FilePayload } from '../../../supabase/functions/_shared/workspace-contracts';
import { workspaceError, workspaceRequest } from '../workspace/api';
import { previewFormat } from './preview-format';
import './file-manager.css';

const PdfPreview = lazy(() => import('./PdfPreview'));
const DocxPreview = lazy(() => import('./DocxPreview'));
const MonacoDiff = lazy(() => import('../workspace/MonacoViews').then(module => ({ default: module.MonacoDiff })));
const unavailable = 'Preview unavailable for this format.';

function diffText(file: FilePayload | null) {
  if (!file) return '';
  if (file.contents === null || file.size > 1024 * 1024) return null;
  try {
    const value = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(decodeBytes(file.contents));
    return /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value) ? null : value;
  } catch {
    return null;
  }
}

function NativePreview({ bytes, type, mime, name }: {
  bytes: Uint8Array<ArrayBuffer>; type: 'image' | 'audio' | 'video'; mime: string; name: string;
}) {
  const [url, setUrl] = useState('');
  const [failed, setFailed] = useState(false);
  const [dimensions, setDimensions] = useState('');
  useEffect(() => {
    const object = URL.createObjectURL(new Blob([bytes], { type: mime }));
    setUrl(object);
    return () => URL.revokeObjectURL(object);
  }, [bytes, mime]);
  if (!url) return null;
  if (failed) return <p>{unavailable}</p>;
  if (type === 'image') return <div className="file-preview">
    <img alt={name} src={url} onError={() => setFailed(true)} onLoad={event => {
      setDimensions(event.currentTarget.naturalWidth + ' × ' + event.currentTarget.naturalHeight + ' pixels');
    }} />
    {dimensions && <p>{dimensions}</p>}
  </div>;
  return type === 'audio'
    ? <audio aria-label={name} controls preload="metadata" src={url} onError={() => setFailed(true)} />
    : <video aria-label={name} controls preload="metadata" src={url} onError={() => setFailed(true)} />;
}

function FileSide({ path, name, value }: { path: string; name: string; value: FilePayload | null }) {
  const bytes = useMemo(() => value && value.contents !== null ? decodeBytes(value.contents) : null, [value]);
  const preview = useMemo(() => bytes ? previewFormat(bytes, path, value?.mime) : null, [bytes, path, value?.mime]);
  function download() {
    if (!bytes) return;
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/octet-stream' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = path.split('/').at(-1) ?? 'file';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  return <section className="file-side" aria-label={name}>
    <h3>{name}</h3>
    {!value ? <p>No previous GitHub file.</p> : <>
      <dl>
        <dt>File</dt><dd>{path}</dd>
        <dt>Size</dt><dd>{value.size.toLocaleString()} bytes</dd>
        <dt>SHA-256</dt><dd><code>{value.sha256 ?? 'Unavailable for this file size'}</code></dd>
        {value.blob && <><dt>Git blob</dt><dd><code>{value.blob}</code></dd></>}
        {value.mime && <><dt>Format hint</dt><dd>{value.mime}</dd></>}
      </dl>
      {bytes && <button type="button" onClick={download}>Download {name.toLowerCase()}</button>}
      {!bytes && <p>This GitHub file exceeds the 8 MiB inspection and download limit.</p>}
      {!preview && <p>{unavailable}</p>}
      {preview && bytes && <Suspense fallback={<p role="status">Loading preview…</p>}>
        {preview.type === 'text' && <pre className="file-preview">{preview.text}</pre>}
        {preview.type === 'pdf' && <PdfPreview bytes={bytes} />}
        {preview.type === 'docx' && <DocxPreview bytes={bytes} />}
        {(preview.type === 'image' || preview.type === 'audio' || preview.type === 'video') &&
          <NativePreview bytes={bytes} type={preview.type} mime={preview.mime!} name={name + ' ' + path} />}
      </Suspense>}
    </>}
  </section>;
}

export function CompareFiles({ path, original, proposed }: Omit<Comparison, 'draft'> & { path: string }) {
  return <section className="file-compare" aria-label="File comparison">
    <h2>{original ? 'Replacement' : 'New file'} · {path}</h2>
    <div className="file-compare-grid">
      <FileSide key={'original-' + (original?.blob ?? original?.sha256 ?? '')} name="Previous file" value={original} path={path} />
      <FileSide key={'proposed-' + (proposed.sha256 ?? '')} name="Proposed file" value={proposed} path={path} />
    </div>
  </section>;
}

export function FileDraftComparison({ repositoryId, branch, path, revision }: {
  repositoryId: number; branch: string; path: string; revision: string;
}) {
  const [data, setData] = useState<Comparison | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const abort = new AbortController();
    setData(null);
    setError('');
    workspaceRequest({ action: 'file_comparison', repositoryId, branch, path: path.split('/'), revision }, abort.signal)
      .then(result => { if (!abort.signal.aborted) setData(result); })
      .catch(error => { if (!abort.signal.aborted) setError(workspaceError(error)); });
    return () => abort.abort();
  }, [repositoryId, branch, path, revision]);
  if (!data) return error ? <p role="alert">{error}</p> : <p role="status">Loading file comparison…</p>;
  if (data.draft?.origin === 'website_control') {
    const original = diffText(data.original);
    const proposed = diffText(data.proposed);
    if (original !== null && proposed !== null) {
      const normalized = (source: string) => source.replace(/\r\n?/g, '\n').replace(/^\uFEFF/, '');
      return <section className="file-compare website-text-comparison" aria-label="Generated text diff">
        <h2>{data.original ? 'Replacement' : 'New file'} · {path}</h2>
        {data.original && normalized(original) === normalized(proposed) && <p>This change affects the line endings or UTF-8 byte order mark.</p>}
        <Suspense fallback={<p role="status">Loading diff viewer…</p>}>
          <MonacoDiff path={path} original={original} proposed={proposed} />
        </Suspense>
        <details><summary>File properties and downloads</summary>
          <CompareFiles path={path} original={data.original} proposed={data.proposed} />
        </details>
      </section>;
    }
  }
  return <CompareFiles path={path} original={data.original} proposed={data.proposed} />;
}
