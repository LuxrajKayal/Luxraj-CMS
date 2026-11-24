import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { CommitReceipt, Draft, DraftSummary } from '../../../supabase/functions/_shared/workspace-contracts';
import { ModulePanel, ModuleTopbar } from '../../shared/ui/ModuleChrome';
import { workspaceError, workspaceRequest } from './api';
import { BranchPicker, useWorkspace } from './WorkspaceLayout';
import { useEditBuffers } from './EditBuffers';
import { CommitControls } from './CommitControls';

const MonacoDiff = lazy(() => import('./MonacoViews').then(module => ({ default: module.MonacoDiff })));
const FileDraftComparison = lazy(() => import('../file-manager/FileComparison').then(module => ({ default: module.FileDraftComparison })));
type Scope = { repositoryId: number; branch: string };

export function ChangedFiles({ repositoryId, branch, version, active, onOpen, refresh, onCommitted, onFiles }: Scope & {
  version: number; active: string | null; onOpen(path: string): void; refresh(): void;
  onCommitted?(receipt: CommitReceipt): void;
  onFiles?(files: DraftSummary[]): void;
}) {
  const [files, setFiles] = useState<DraftSummary[] | null>(null);
  const [maximumFiles, setMaximumFiles] = useState(20);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    setFiles(null);
    setError('');
    setSelected([]);
    onFiles?.([]);
    workspaceRequest({ action: 'changes', repositoryId, branch }, controller.signal)
      .then(result => {
        if (controller.signal.aborted) return;
        setFiles(result.files);
        onFiles?.(result.files);
        setMaximumFiles(result.maximumFiles ?? 20);
      })
      .catch(error => { if (!controller.signal.aborted) setError(workspaceError(error)); });
    return () => controller.abort();
  }, [repositoryId, branch, version, onFiles]);

  return <>
    <div className="workspace-actions">
      <strong>Changes{files ? ` (${files.length})` : ''}</strong>
      <button type="button" onClick={refresh}>Refresh changes</button>
    </div>
    <UnsavedCount />
    {error && <p role="alert">{error}</p>}
    {!files && !error && <p role="status">Loading proposed changes…</p>}
    {files?.length === 0 && <p>No saved changes for this branch.</p>}
    <ul className="source-tree">
      {files?.map(item => <li key={item.path} className={onCommitted ? 'commit-file-row' : undefined}>
        {onCommitted && item.revision && <input type="checkbox" aria-label={`Include ${item.path} in commit`}
          checked={selected.includes(item.path)} onChange={event => {
            setSelected(event.target.checked ? [...selected, item.path] : selected.filter(path => path !== item.path));
          }} />}
        <button type="button" aria-pressed={active === item.path} onClick={() => onOpen(item.path)} title={item.path}>
          {item.path}{item.file && <small> · File upload</small>}
        </button>
      </li>)}
    </ul>
    {onCommitted && <CommitControls {...{ repositoryId, branch, onCommitted, maximumFiles }}
      files={(files ?? []).flatMap(item => selected.includes(item.path) && item.revision
        ? [{ path: item.path, revision: item.revision }] : [])} />}
  </>;
}

function UnsavedCount() {
  const { buffers } = useEditBuffers();
  const count = Object.keys(buffers).length;
  return count ? <p>{count} unsaved {count === 1 ? 'file' : 'files'} in this session. Save in <Link to="/code-editor">Code Editor</Link> to review.</p> : null;
}

export function DraftDiff({ repositoryId, branch, file, onBack }: Scope & { file: string; onBack?(): void }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [fileRevision, setFileRevision] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    workspaceRequest({ action: 'diff', repositoryId, branch, path: file.split('/') }, controller.signal)
      .then(result => {
        if (controller.signal.aborted) return;
        if ('kind' in result) setFileRevision(result.revision);
        else setDraft(result);
      })
      .catch(error => { if (!controller.signal.aborted) setError(workspaceError(error)); });
    return () => controller.abort();
  }, [repositoryId, branch, file]);

  return (
    <div className="editor-document">
      <div className="workspace-actions editor-file-toolbar">
        <strong>Diff · {file}</strong>
        {onBack && <button type="button" onClick={onBack}>Return to editor</button>}
        {draft && <span>Original <code>{draft.originalCommit.slice(0, 12)}</code> · Proposed</span>}
      </div>
      {error && <p role="alert">{error}</p>}
      {!draft && !fileRevision && !error && <p role="status">Loading diff…</p>}
      {fileRevision && <Suspense fallback={<p role="status">Loading file review…</p>}>
        <FileDraftComparison repositoryId={repositoryId} branch={branch} path={file} revision={fileRevision} />
      </Suspense>}
      {draft && <>
        {draft.originalSource.replace(/\r\n?/g, '\n').replace(/^\uFEFF/, '') ===
          draft.proposedSource.replace(/\r\n?/g, '\n').replace(/^\uFEFF/, '') &&
          <p>This change affects line endings or the UTF-8 byte order mark.</p>}
        <Suspense fallback={<p role="status">Loading diff viewer…</p>}>
          <MonacoDiff path={draft.path} original={draft.originalSource} proposed={draft.proposedSource} />
        </Suspense>
      </>}
    </div>
  );
}

function Review({ repositoryId, branch }: Scope) {
  const [file, setFile] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [version, setVersion] = useState(0);
  const [receipt, setReceipt] = useState<CommitReceipt | null>(null);
  const [receiptError, setReceiptError] = useState('');
  const [recovering, setRecovering] = useState(false);
  function refreshChanges() {
    setFile(null);
    setVersion(value => value + 1);
  }
  async function recover() {
    if (!receipt?.reviewId) return;
    setRecovering(true);
    setReceiptError('');
    try {
      setReceipt(await workspaceRequest({ action: 'reconcile_commit', repositoryId, branch,
        reviewId: receipt.reviewId, sha: receipt.sha }));
      refreshChanges();
    } catch (error) { setReceiptError(workspaceError(error)); }
    finally { setRecovering(false); }
  }
  return <>
    <div className="workspace-actions module-body">
      <button type="button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>Changed files</button>
      <Link to="/code-editor">Open Code Editor</Link>
      <Link to="/file-manager">Open File Manager</Link>
    </div>
    {receipt && <div role="status" className="workspace-actions module-body">
      Committed <a href={receipt.url} target="_blank" rel="noreferrer">{receipt.sha.slice(0, 12)}</a>
      {receipt.retained === null && <><span>Draft status is awaiting verification.</span>
        <button type="button" disabled={recovering} onClick={() => void recover()}>Verify commit and sync drafts</button></>}
      {receipt.retained !== null && receipt.retained < receipt.fileCount && <span>Newer draft revisions are still pending.</span>}
    </div>}
    {receiptError && <p role="alert">{receiptError}</p>}
    <div className="editor-panes">
      {expanded && <ModulePanel title="Changes">
        <ChangedFiles {...{ repositoryId, branch, version }} active={file} onOpen={setFile}
          refresh={refreshChanges} onCommitted={result => { setReceipt(result); refreshChanges(); }} />
      </ModulePanel>}
      {file && <DraftDiff key={file} {...{ repositoryId, branch, file }} />}
    </div>
  </>;
}

export function SourceControlPage() {
  const { workspace: { selection, repositories }, saving, refresh } = useWorkspace();
  const repo = repositories.find(repository => repository.id === selection?.repositoryId);
  return (
    <div className="module-stack">
      <ModuleTopbar title="Source Control">
        {repo && <span>{repo.name}</span>}
        <BranchPicker />
        <button type="button" onClick={refresh} disabled={saving}>Refresh workspace</button>
      </ModuleTopbar>
      {!repo && <p className="module-body"><Link to="/repositories">Select a repository</Link> to review its changes.</p>}
      {selection?.branch && !saving && <Review key={JSON.stringify([selection.repositoryId, selection.branch])}
        repositoryId={selection.repositoryId} branch={selection.branch} />}
    </div>
  );
}
