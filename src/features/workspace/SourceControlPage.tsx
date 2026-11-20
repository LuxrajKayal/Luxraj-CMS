import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { CommitReceipt, Draft, DraftSummary } from '../../../supabase/functions/_shared/workspace-contracts';
import { ModulePanel, ModuleTopbar } from '../../shared/ui/ModuleChrome';
import { workspaceError, workspaceRequest } from './api';
import { BranchPicker, useWorkspace } from './WorkspaceLayout';
import { useEditBuffers } from './EditBuffers';
import { CommitControls } from './CommitControls';

const MonacoDiff = lazy(() => import('./MonacoViews').then(module => ({ default: module.MonacoDiff })));
type Scope = { repositoryId: number; branch: string };

export function ChangedFiles({ repositoryId, branch, version, active, onOpen, refresh, onCommitted }: Scope & {
  version: number; active: string | null; onOpen(path: string): void; refresh(): void;
  onCommitted?(receipt: CommitReceipt): void;
}) {
  const [files, setFiles] = useState<DraftSummary[] | null>(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    setFiles(null);
    setError('');
    setSelected([]);
    workspaceRequest({ action: 'changes', repositoryId, branch }, controller.signal)
      .then(result => { if (!controller.signal.aborted) setFiles(result.files); })
      .catch(error => { if (!controller.signal.aborted) setError(workspaceError(error)); });
    return () => controller.abort();
  }, [repositoryId, branch, version]);

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
          {item.path}
        </button>
      </li>)}
    </ul>
    {onCommitted && <CommitControls {...{ repositoryId, branch, onCommitted }}
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
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    workspaceRequest({ action: 'diff', repositoryId, branch, path: file.split('/') }, controller.signal)
      .then(result => { if (!controller.signal.aborted) setDraft(result); })
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
      {!draft && !error && <p role="status">Loading diff…</p>}
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
  return <>
    <div className="workspace-actions module-body">
      <button type="button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>Changed files</button>
      <Link to="/code-editor">Open Code Editor</Link>
    </div>
    <div className="editor-panes">
      {expanded && <ModulePanel title="Changes">
        <ChangedFiles {...{ repositoryId, branch, version }} active={file} onOpen={setFile}
          refresh={() => { setFile(null); setVersion(value => value + 1); }} />
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
