import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router';
import { FileCode2, Folder as FolderIcon, GitBranch, Maximize, PanelLeft, RefreshCw } from 'lucide-react';
import { ModulePanel, ModuleTopbar } from '../../shared/ui/ModuleChrome';
import { ChangedFiles, DraftDiff } from './SourceControlPage';
import { HistoryDiff, HistoryPanel, type HistoryFile } from './HistoryPanel';
import type { CommitReceipt } from '../../../supabase/functions/_shared/workspace-contracts';
import { workspaceError, workspaceRequest, type Directory, type Selection, type TreeEntry } from './api';
import { BranchPicker, useWorkspace } from './WorkspaceLayout';
import { DraftEditor } from './DraftEditor';
import { useEditBuffers } from './EditBuffers';

type Context = { repositoryId: number; branch: string };
type OpenFile = (path: string[]) => void;

function DirectoryList({ context, path, commit, entries, openFile }: {
  context: Context; path: string[]; commit: string; entries: TreeEntry[]; openFile: OpenFile;
}) {
  if (!entries.length) return <p>No folders or supported source files here.</p>;
  return (
    <ul className="source-tree">
      {entries.map(entry => (
        <li key={entry.name}>
          {entry.kind === 'folder'
            ? <Folder context={context} path={[...path, entry.name]} commit={commit} openFile={openFile} />
            : <button type="button" onClick={() => openFile([...path, entry.name])}><FileCode2 size={15} aria-hidden="true" />{entry.name}</button>}
        </li>
      ))}
    </ul>
  );
}

function Folder({ context, path, commit, openFile }: {
  context: Context; path: string[]; commit: string; openFile: OpenFile;
}) {
  const [expanded, setExpanded] = useState(false);
  const [entries, setEntries] = useState<TreeEntry[] | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (entries) return;
    setError('');
    setLoading(true);
    try {
      setEntries((await workspaceRequest({ action: 'tree', ...context, path, commit })).entries);
    } catch (error) {
      setError(workspaceError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" aria-expanded={expanded} onClick={() => void toggle()} disabled={loading}>
        <FolderIcon size={15} aria-hidden="true" />{path.at(-1)}
      </button>
      {expanded && (
        <>
          {loading && <p role="status">Loading folder…</p>}
          {error && <p role="alert">{error}</p>}
          {entries && <DirectoryList {...{ context, path, commit, entries, openFile }} />}
        </>
      )}
    </>
  );
}

function Explorer({ selection, repository }: { selection: Selection & { branch: string }; repository: string }) {
  const tabGroupId = useId();
  const { repositoryId, branch } = selection;
  const [tree, setTree] = useState<Directory | null>(null);
  const [treeError, setTreeError] = useState('');
  const [file, setFile] = useState<string[] | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [diff, setDiff] = useState<string | null>(null);
  const [historyDiff, setHistoryDiff] = useState<HistoryFile | null>(null);
  const [tab, setTab] = useState<'changes' | 'history'>('changes');
  const [receipt, setReceipt] = useState<CommitReceipt | null>(null);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [changesVersion, setChangesVersion] = useState(0);
  const [showFiles, setShowFiles] = useState(true);
  const [showChanges, setShowChanges] = useState(() => !(window.matchMedia?.('(max-width: 65rem)').matches ?? false));
  const [focus, setFocus] = useState(false);
  const { refresh: refreshWorkspace, saving } = useWorkspace();
  const commit = tree?.commit;

  useEffect(() => {
    const controller = new AbortController();
    workspaceRequest({ action: 'tree', repositoryId, branch, path: [] }, controller.signal)
      .then(result => { if (!controller.signal.aborted) setTree(result); })
      .catch(error => { if (!controller.signal.aborted) setTreeError(workspaceError(error)); });
    return () => controller.abort();
  }, [repositoryId, branch, refresh]);

  function openFile(path: string[]) {
    setFile([...path]);
    setDiff(null);
    setHistoryDiff(null);
    if (window.matchMedia?.('(max-width: 48rem)').matches) setShowFiles(false);
  }

  function refreshTree() {
    setFile(null);
    setTree(null);
    setTreeError('');
    setRefresh(current => current + 1);
  }

  function committed(result: CommitReceipt) {
    setReceipt(result);
    setDiff(null);
    setHistoryDiff(null);
    setChangesVersion(value => value + 1);
    setHistoryVersion(value => value + 1);
    setTree(null);
    setTreeError('');
    setRefresh(value => value + 1);
  }

  return (
    <div className="module-stack">
      <ModuleTopbar title="Code Editor">
        <button type="button" aria-label="File explorer" title="File explorer" aria-expanded={showFiles && !focus}
          onClick={() => { setFocus(false); setShowFiles(focus || !showFiles); }}><PanelLeft size={17} aria-hidden="true" /></button>
        <button type="button" aria-label="Source Control panel" title="Source Control panel" aria-expanded={showChanges && !focus}
          onClick={() => { setFocus(false); setShowChanges(focus || !showChanges); }}><GitBranch size={17} aria-hidden="true" /></button>
        <Link to="/repositories" title="Switch repository">{repository}</Link>
        <BranchPicker />
        <button type="button" aria-pressed={focus} onClick={() => setFocus(value => !value)} title="Editor focus">
          <Maximize size={16} aria-hidden="true" /><span>{focus ? 'Exit focus' : 'Focus'}</span>
        </button>
        <button type="button" onClick={refreshWorkspace} disabled={saving} aria-label="Refresh workspace" title="Refresh workspace">
          <RefreshCw size={16} aria-hidden="true" />
        </button>
      </ModuleTopbar>
      <div className="editor-panes">
        <ModulePanel title="Files" hidden={!showFiles || focus}>
          <button type="button" onClick={refreshTree} disabled={!tree && !treeError}>Refresh file tree</button>
          {treeError && <p role="alert">{treeError}</p>}
          {!tree && !treeError && <p role="status">Loading file tree…</p>}
          {tree && <DirectoryList context={{ repositoryId, branch }} path={[]} commit={tree.commit}
            entries={tree.entries} openFile={openFile} />}
        </ModulePanel>
        <section className="editor-center" aria-label="Editor workspace">
          <div className="editor-document" hidden={!!diff || !!historyDiff}>
            {!file && <p className="workspace-placeholder">Choose an HTML, CSS, or JavaScript file to view its source.</p>}
            {file && commit && <DraftEditor key={JSON.stringify([file, commit])}
              {...{ repositoryId, branch, path: file, commit }} onSaved={() => setChangesVersion(value => value + 1)} />}
          </div>
          {diff && <DraftDiff key={diff} file={diff} {...{ repositoryId, branch }} onBack={() => setDiff(null)} />}
          {historyDiff && <HistoryDiff key={JSON.stringify(historyDiff)} file={historyDiff}
            {...{ repositoryId, branch }} onBack={() => setHistoryDiff(null)} />}
        </section>
        <ModulePanel title="Source Control" hidden={!showChanges || focus}>
          <div className="workspace-actions" role="tablist" aria-label="Source Control view" onKeyDown={event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const next = event.key === 'Home' ? 'changes' : event.key === 'End' ? 'history'
              : tab === 'changes' ? 'history' : 'changes';
            setTab(next);
            document.getElementById(`${tabGroupId}-${next}`)?.focus();
          }}>
            {(['changes', 'history'] as const).map(view =>
              <button type="button" role="tab" key={view} id={`${tabGroupId}-${view}`} tabIndex={tab === view ? 0 : -1}
                aria-selected={tab === view} aria-controls={`${tabGroupId}-panel`} onClick={() => setTab(view)}>
                {view === 'changes' ? 'Changes' : 'History'}
              </button>)}
          </div>
          {receipt && <p role="status">Committed <a href={receipt.url} target="_blank" rel="noreferrer">{receipt.sha.slice(0, 12)}</a>.
            {receipt.retained === null && ' Draft status could not be recorded. The saved drafts are still available.'}
            {receipt.retained !== null && receipt.retained < receipt.fileCount &&
              ' Some saved revisions changed during the commit and were left pending.'}</p>}
          <div role="tabpanel" id={`${tabGroupId}-panel`} aria-labelledby={`${tabGroupId}-${tab}`}>
            {tab === 'changes'
            ? <ChangedFiles {...{ repositoryId, branch }} version={changesVersion} active={diff} onCommitted={committed}
                onOpen={path => {
                  setHistoryDiff(null);
                  setDiff(path);
                  if (window.matchMedia?.('(max-width: 48rem)').matches) setShowChanges(false);
                }} refresh={() => { setDiff(null); setChangesVersion(value => value + 1); }} />
            : <HistoryPanel key={historyVersion} {...{ repositoryId, branch }} version={historyVersion}
                openFile={selected => {
                  setDiff(null);
                  setHistoryDiff(selected);
                  if (window.matchMedia?.('(max-width: 48rem)').matches) setShowChanges(false);
                }} />}
          </div>
        </ModulePanel>
      </div>
    </div>
  );
}

export function CodeEditorPage() {
  const { workspace: { selection, repositories }, saving } = useWorkspace();
  const active = repositories.find(repository => repository.id === selection?.repositoryId);
  const { buffers } = useEditBuffers();
  const unsaved = Object.keys(buffers).length;
  return (
    <>
      {(!selection?.branch || saving || !active) && <>
        <ModuleTopbar title="Code Editor"><BranchPicker /></ModuleTopbar>
        {!active && <p className="module-body"><Link to="/repositories">Select a repository</Link> to browse its files.</p>}
      </>}
      {unsaved > 0 && <p className="workspace-notice">Unsaved files in this session: {unsaved}. Reopen a file to continue editing or save it.</p>}
      {selection?.branch && active && !saving && (
        <Explorer key={JSON.stringify([selection.repositoryId, selection.branch])}
          repository={active.name} selection={{ repositoryId: selection.repositoryId, branch: selection.branch }} />
      )}
    </>
  );
}
