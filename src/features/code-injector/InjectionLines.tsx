import { useMemo, useState } from 'react';
import { sourceLines } from './code-matching';

export function InjectionLines({ source, offset, choose, disabled, previewCode, canPreview, onPreview }: {
  source: string; offset: number | null; choose(offset: number): void; disabled: boolean;
  previewCode: string; canPreview: boolean; onPreview(): void;
}) {
  const [page, setPage] = useState(0);
  const lines = useMemo(() => sourceLines(source), [source]);
  const pageSize = 100;
  const first = page * pageSize;
  const selected = offset === null ? null : lines.findIndex(line => line.offset === offset) + 1;
  const selectedAtEnd = offset === source.length;
  const slot = (lineNumber: number) => <div className="injector-insert-slot" role="status">
    <strong>Insertion position selected: {selectedAtEnd ? 'end of file' : 'before line ' + lineNumber}</strong>
    {previewCode ? <>
      <span>Proposed code is shown here before the remaining source lines. No source has been changed.</span>
      <pre aria-label="Inline code insertion preview">{previewCode}</pre>
    </> : <span>Choose a code template or saved group to preview its insertion.</span>}
    <button type="button" disabled={disabled || !canPreview} onClick={onPreview}>Preview insertion here</button>
  </div>;
  return <section aria-label="Source lines">
    <p>Click a source line to select where code will be inserted. The preview appears at that position and pushes later lines down.</p>
    <div className="workspace-actions">
      <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous lines</button>
      <span>Lines {first + 1}–{Math.min(first + pageSize, lines.length)} of {lines.length}</span>
      <button type="button" disabled={first + pageSize >= lines.length} onClick={() => setPage(page + 1)}>Next lines</button>
      <button type="button" aria-pressed={selectedAtEnd} disabled={disabled}
        onClick={() => { choose(source.length); setPage(Math.floor((lines.length - 1) / pageSize)); }}>Append at end</button>
    </div>
    <div className="injector-lines" tabIndex={0}>
      {lines.slice(first, first + pageSize).map((line, i) => <div className="injector-line" key={line.offset}>
        {offset === line.offset && slot(first + i + 1)}
        <button type="button" className="injector-source-row"
          aria-label={'Insert before line ' + (first + i + 1)} aria-pressed={offset === line.offset}
          disabled={disabled} onClick={() => choose(line.offset)}>
          <span className="injector-line-number">{first + i + 1}</span><code>{line.text || ' '}</code>
        </button>
      </div>)}
      {selectedAtEnd && !lines.some(line => line.offset === source.length) && slot(lines.length + 1)}
    </div>
    {selected !== null && selected > 0 && <p className="injector-line-confirmation">
      Selected insertion location: {selectedAtEnd ? 'end of file' : 'before line ' + selected}.
    </p>}
  </section>;
}
