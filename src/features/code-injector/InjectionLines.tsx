import { useMemo, useState } from 'react';
import { sourceLines } from './code-matching';

export function InjectionLines({ source, offset, choose, disabled }: {
  source: string; offset: number | null; choose(offset: number): void; disabled: boolean;
}) {
  const [page, setPage] = useState(0);
  const lines = useMemo(() => sourceLines(source), [source]);
  const pageSize = 100;
  const first = page * pageSize;
  return <section aria-label="Source lines">
    <p>Choose a line number to insert before that line.</p>
    <div className="workspace-actions">
      <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous lines</button>
      <span>Lines {first + 1}–{Math.min(first + pageSize, lines.length)} of {lines.length}</span>
      <button type="button" disabled={first + pageSize >= lines.length} onClick={() => setPage(page + 1)}>Next lines</button>
      <button type="button" aria-pressed={offset === source.length} disabled={disabled}
        onClick={() => choose(source.length)}>Append at end</button>
    </div>
    <div className="injector-lines" tabIndex={0}>
      {lines.slice(first, first + pageSize).map((line, i) => <div className="injector-line" key={line.offset}>
        <button type="button" aria-label={'Insert before line ' + (first + i + 1)} aria-pressed={offset === line.offset}
          disabled={disabled} onClick={() => choose(line.offset)}>{first + i + 1}</button>
        <code>{line.text || ' '}</code>
      </div>)}
    </div>
  </section>;
}
