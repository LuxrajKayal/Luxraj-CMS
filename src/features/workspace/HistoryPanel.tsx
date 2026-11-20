import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import type { CommitDetail, CommittedDiff, HistoryPage } from '../../../supabase/functions/_shared/workspace-contracts';
import { workspaceError, workspaceRequest } from './api';
import { commitGraph } from './commitGraph';

type Scope = { repositoryId: number; branch: string };
export type HistoryFile = { sha: string; path: string };
const MonacoDiff = lazy(() => import('./MonacoViews').then(module => ({ default: module.MonacoDiff })));
const colors = ['#2469bb', '#a04392', '#27794b', '#a65418', '#634ac0', '#067486'];

function GraphRow({ lane, color, edges, width }: ReturnType<typeof commitGraph>[number]) {
  const x = (index: number) => 6 + index * 10;
  return <svg aria-hidden="true" width={width * 10 + 3} height={44}>
    {edges.map((edge, i) => {
      const y1 = edge.part === 'outgoing' ? 22 : 0;
      const y2 = edge.part === 'incoming' ? 22 : 44;
      return <path key={i} d={`M${x(edge.from)},${y1} C${x(edge.from)},${(y1 + y2) / 2} ${x(edge.to)},${(y1 + y2) / 2} ${x(edge.to)},${y2}`}
        fill="none" stroke={colors[edge.color % colors.length]} strokeWidth={2} />;
    })}
    <circle cx={x(lane)} cy={22} r={4} fill={colors[color % colors.length]} />
  </svg>;
}

function Details({ repositoryId, branch, sha, openFile }: Scope & { sha: string; openFile(file: HistoryFile): void }) {
  const [detail, setDetail] = useState<CommitDetail | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    workspaceRequest({ action: 'commit_detail', repositoryId, branch, sha }, controller.signal)
      .then(result => { if (!controller.signal.aborted) setDetail(result); })
      .catch(error => { if (!controller.signal.aborted) setError(workspaceError(error)); });
    return () => controller.abort();
  }, [repositoryId, branch, sha]);
  if (!detail) return error ? <p role="alert">{error}</p> : <p role="status">Loading commit…</p>;

  return <section className="history-details" aria-label="Commit details">
    <strong>Commit {detail.sha.slice(0, 12)}</strong>
    <p className="commit-message">{detail.message}</p>
    <small>{detail.author} · {new Date(detail.date).toLocaleString()}</small>
    {detail.parents.length > 1 && <p>Merge · {detail.parents.length} parents. File diffs compare with the first parent.</p>}
    {!detail.complete && <p>GitHub’s changed-file limit was reached. This list may be incomplete.</p>}
    <ul className="source-tree">
      {detail.files.map(file => <li key={file.path}>
        <button type="button" onClick={() => openFile({ sha, path: file.path })}>
          {file.status} · {file.previousPath ? `${file.previousPath} → ` : ''}{file.path}
        </button>
      </li>)}
    </ul>
    {!detail.files.length && <p>No changed files reported.</p>}
  </section>;
}

export function HistoryPanel({ repositoryId, branch, version, openFile }: Scope & {
  version: number; openFile(file: HistoryFile): void;
}) {
  const [history, setHistory] = useState<HistoryPage | null>(null);
  const [query, setQuery] = useState<{ page: number; head?: string }>({ page: 1 });
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    workspaceRequest({ action: 'history', repositoryId, branch, ...query }, controller.signal)
      .then(result => {
        if (!controller.signal.aborted) setHistory(current => query.page === 1 || !current
          ? result : { ...result, commits: [...current.commits, ...result.commits] });
      })
      .catch(error => { if (!controller.signal.aborted) setError(workspaceError(error)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [repositoryId, branch, query, version]);
  const rows = useMemo(() => commitGraph(history?.commits ?? []), [history]);
  const graphWidth = Math.max(1, ...rows.map(row => row.width));

  function refresh() {
    setSelected('');
    setHistory(null);
    setQuery({ page: 1 });
  }

  return <section aria-label="Git Commit Graph">
    <div className="workspace-actions">
      <strong>Git Commit Graph</strong>
      <button type="button" onClick={refresh}>Refresh history</button>
    </div>
    {error && <p role="alert">{error}</p>}
    {loading && <p role="status">Loading history…</p>}
    <ul className="commit-graph">
      {rows.map(row => {
        const { commit } = row;
        const refs = history?.refs.filter(ref => ref.sha === commit.sha) ?? [];
        return <li key={commit.sha}>
          <button type="button" aria-pressed={selected === commit.sha} onClick={() => setSelected(commit.sha)}
            title={commit.message}>
            <GraphRow {...row} width={graphWidth} />
            <span className="graph-entry">
              <span>{commit.message.split('\n')[0] || commit.sha.slice(0, 7)}</span>
              <small>{commit.author} · {commit.date ? new Date(commit.date).toLocaleDateString() : ''} · {commit.sha.slice(0, 7)}</small>
              {!!refs.length && <span className="graph-refs">{refs.map(ref => <span key={ref.name}>{ref.name}</span>)}</span>}
            </span>
          </button>
        </li>;
      })}
    </ul>
    {history?.next && <button type="button" disabled={loading}
      onClick={() => setQuery({ head: history.head, page: history.next! })}>Load more commits</button>}
    {selected && <Details key={selected} {...{ repositoryId, branch, openFile }} sha={selected} />}
  </section>;
}

export function HistoryDiff({ repositoryId, branch, file, onBack }: Scope & { file: HistoryFile; onBack(): void }) {
  const [diff, setDiff] = useState<CommittedDiff | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    workspaceRequest({ action: 'commit_diff', repositoryId, branch, ...file }, controller.signal)
      .then(result => { if (!controller.signal.aborted) setDiff(result); })
      .catch(error => { if (!controller.signal.aborted) setError(workspaceError(error)); });
    return () => controller.abort();
  }, [repositoryId, branch, file]);
  return <div className="editor-document">
    <div className="workspace-actions editor-file-toolbar">
      <strong>Committed diff · {file.path} · {file.sha.slice(0, 12)}</strong>
      <button type="button" onClick={onBack}>Return to editor</button>
    </div>
    {error && <p role="alert">{error}</p>}
    {!diff && !error && <p role="status">Loading committed diff…</p>}
    {diff && <Suspense fallback={<p role="status">Loading diff viewer…</p>}>
      <MonacoDiff {...diff} path={file.path} />
    </Suspense>}
  </div>;
}
