import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { Draft, DraftSummary } from '../../../supabase/functions/_shared/workspace-contracts';
import { workspaceError, workspaceRequest } from './api';
import { BranchPicker, useWorkspace } from './WorkspaceLayout';
import { useEditBuffers } from './EditBuffers';

const MonacoDiff = lazy(() => import('./MonacoViews').then(module => ({ default: module.MonacoDiff })));

function ChangeSet({ repositoryId, branch }: { repositoryId: number; branch: string }) {
  const [files, setFiles] = useState<DraftSummary[] | null>(null);
  const [file, setFile] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    workspaceRequest({ action: 'changes', repositoryId, branch }, controller.signal)
      .then(result => { if (!controller.signal.aborted) setFiles(result.files); })
      .catch(error => { if (!controller.signal.aborted) setError(workspaceError(error)); });
    return () => controller.abort();
  }, [repositoryId, branch, refresh]);

  useEffect(() => {
    if (!file) return;
    const controller = new AbortController();
    workspaceRequest({ action: 'diff', repositoryId, branch, path: file.split('/') }, controller.signal)
      .then(result => { if (!controller.signal.aborted) setDraft(result); })
      .catch(error => { if (!controller.signal.aborted) setError(workspaceError(error)); });
    return () => controller.abort();
  }, [repositoryId, branch, file]);

  function reload() {
    setFile('');
    setDraft(null);
    setFiles(null);
    setError('');
    setRefresh(current => current + 1);
  }

  return (
    <>
      <button type="button" onClick={reload}>Refresh proposed changes</button>
      {error && <p role="alert">{error}</p>}
      {!files && !error && <p role="status">Loading proposed changes…</p>}
      {files?.length === 0 && <p>No saved changes for this branch.</p>}
      {!!files?.length && (
        <ul className="source-tree">
          {files.map(item => <li key={item.path}>
            <button type="button" aria-pressed={file === item.path} onClick={() => {
              if (file === item.path) return;
              setDraft(null);
              setError('');
              setFile(item.path);
            }}>{item.path}</button>
          </li>)}
        </ul>
      )}
      {file && !draft && !error && <p role="status">Loading diff…</p>}
      {draft && (
        <>
          <h2>{draft.path}</h2>
          <p>Original GitHub version <code>{draft.originalCommit.slice(0, 12)}</code> · Proposed draft</p>
          {draft.originalSource.replace(/\r\n?/g, '\n').replace(/^\uFEFF/, '') ===
            draft.proposedSource.replace(/\r\n?/g, '\n').replace(/^\uFEFF/, '') &&
            <p>This change affects line endings or the UTF-8 byte order mark.</p>}
          <Suspense fallback={<p role="status">Loading diff viewer…</p>}>
            <MonacoDiff path={draft.path} original={draft.originalSource} proposed={draft.proposedSource} />
          </Suspense>
        </>
      )}
    </>
  );
}

export function SourceControlPage() {
  const { workspace: { selection, repositories }, saving } = useWorkspace();
  const { buffers } = useEditBuffers();
  const repo = repositories.find(repository => repository.id === selection?.repositoryId);
  const unsaved = Object.keys(buffers).length;
  return (
    <>
      <h1>Source Control</h1>
      {unsaved > 0 && <p>{unsaved} unsaved file(s) in this session. Save them in <Link to="/code-editor">Code Editor</Link> to review them here.</p>}
      {repo ? <p>Repository <strong>{repo.name}</strong></p> : <p><Link to="/repositories">Select a repository</Link> to review its changes.</p>}
      <BranchPicker />
      {selection?.branch && !saving && <ChangeSet key={JSON.stringify([selection.repositoryId, selection.branch])}
        repositoryId={selection.repositoryId} branch={selection.branch} />}
    </>
  );
}
