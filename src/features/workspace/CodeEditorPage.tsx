import { useCallback, useEffect, useId, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ChevronDown, ChevronRight, Code2, FileCode2, Files, Folder as FolderIcon, FolderOpen, GitBranch, History, Maximize, Minimize2, PanelRight, RefreshCw, Search, Settings } from 'lucide-react';
import { ModulePanel, ModuleTopbar } from '../../shared/ui/ModuleChrome';
import { ChangedFiles, DraftDiff } from './SourceControlPage';
import { HistoryDiff, HistoryPanel, type HistoryFile } from './HistoryPanel';
import type { CommitReceipt, DraftSummary } from '../../../supabase/functions/_shared/workspace-contracts';
import { workspaceError, workspaceRequest, type Directory, type Selection, type TreeEntry } from './api';
import { BranchPicker, useWorkspace } from './WorkspaceLayout';
import { DraftEditor } from './DraftEditor';
import { useEditBuffers } from './EditBuffers';
import './code-editor.css';

type Context = { repositoryId: number; branch: string };
type OpenFile = (path: string[]) => void;

type TreePresentation = {
  active: string; dirty: Set<string>; drafts: Set<string>;
  onDirectory(path: string[], commit: string, entries: TreeEntry[]): void;
};
function fileLanguage(path: string) {
  return /\.html?$/i.test(path) ? 'HTML' : /\.css$/i.test(path) ? 'CSS' :
    /\.(js|mjs|cjs)$/i.test(path) ? 'JavaScript' : 'Plain text';
}
function FileRow({ path, openFile, active, dirty, drafts, detail }: {
  path: string[]; openFile: OpenFile; detail?: boolean;
} & Pick<TreePresentation, 'active' | 'dirty' | 'drafts'>) {
  const full = path.join('/');
  const state = dirty.has(full) ? 'Unsaved changes' : drafts.has(full) ? 'Saved draft' : '';
  return <button type="button" className="ide-file-row" aria-label={path.at(-1)}
    aria-current={active === full ? 'true' : undefined} title={full + (state ? ' · ' + state : '')} onClick={() => openFile(path)}>
    <FileCode2 size={16} className={'ide-file-icon ide-language-' + fileLanguage(full).toLowerCase().replace(' ', '-')} aria-hidden="true" />
    <span className="ide-file-name">{path.at(-1)}{detail && path.length > 1 && <small>{path.slice(0, -1).join('/')}</small>}</span>
    {state && <span className={dirty.has(full) ? 'ide-dirty-mark' : 'ide-draft-mark'} aria-hidden="true">{dirty.has(full) ? '●' : 'M'}</span>}
  </button>;
}
function DirectoryList({ context, path, commit, entries, openFile, ...presentation }: {
  context: Context; path: string[]; commit: string; entries: TreeEntry[]; openFile: OpenFile;
} & TreePresentation) {
  if (!entries.length) return <p className="ide-muted">No folders or supported source files here.</p>;
  return <ul className="source-tree ide-tree">
    {entries.slice().sort((a,b) => a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === 'folder' ? -1 : 1).map(entry => <li key={entry.name}>
      {entry.kind === 'folder'
        ? <Folder context={context} path={[...path, entry.name]} commit={commit} openFile={openFile} {...presentation} />
        : <FileRow path={[...path, entry.name]} openFile={openFile} {...presentation} />}
    </li>)}
  </ul>;
}
function Folder({ context, path, commit, openFile, ...presentation }: {
  context: Context; path: string[]; commit: string; openFile: OpenFile;
} & TreePresentation) {
  const [expanded, setExpanded] = useState(false);
  const [entries, setEntries] = useState<TreeEntry[] | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function toggle() {
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    if (entries) return;
    setError('');
    setLoading(true);
    try {
      const result = await workspaceRequest({ action: 'tree', ...context, path, commit });
      setEntries(result.entries);
      presentation.onDirectory(path, commit, result.entries);
    } catch (error) { setError(workspaceError(error)); }
    finally { setLoading(false); }
  }
  return <>
    <button type="button" className="ide-folder-row" aria-expanded={expanded} onClick={() => void toggle()} disabled={loading}>
      {expanded ? <ChevronDown size={13} aria-hidden="true" /> : <ChevronRight size={13} aria-hidden="true" />}
      {expanded ? <FolderOpen size={16} className="ide-folder-icon" aria-hidden="true" /> : <FolderIcon size={16} className="ide-folder-icon" aria-hidden="true" />}
      <span>{path.at(-1)}</span>
    </button>
    {expanded && <>
      {loading && <p role="status">Loading folder…</p>}
      {error && <p role="alert">{error}</p>}
      {entries && <DirectoryList {...{ context, path, commit, entries, openFile }} {...presentation} />}
    </>}
  </>;
}

function Explorer({ selection, repository }: { selection: Selection & { branch: string }; repository: string }) {
  const tabGroupId = useId();
  const { repositoryId, branch } = selection;
  const location = useLocation();
  const navigate = useNavigate();
  const target = location.state?.editorTarget;
  const targetPath = target?.repositoryId === repositoryId && target.branch === branch && typeof target.path === 'string' &&
    target.path.length > 0 && target.path.length <= 1024 ? target.path : null;
  const targetReview = targetPath && target.review === true ? targetPath : null;
  const { views, putView, buffers, positions, editing } = useEditBuffers();
  const workspaceKey = JSON.stringify([repositoryId, branch]);
  const savedView = views[workspaceKey];
  const [tree, setTree] = useState<Directory | null>(null);
  const [treeError, setTreeError] = useState('');
  const [file, setFile] = useState<string[] | null>(() => targetPath?.split('/') ?? savedView?.file ?? null);
  const [refresh, setRefresh] = useState(0);
  const [diff, setDiff] = useState<string | null>(() => targetPath ? targetReview : savedView?.diff ?? null);
  const [historyDiff, setHistoryDiff] = useState<HistoryFile | null>(() => targetPath ? null : savedView?.historyDiff ?? null);
  const [tab, setTab] = useState<'changes' | 'history'>(() => targetReview ? 'changes' : savedView?.tab ?? 'changes');
  const [receipt, setReceipt] = useState<CommitReceipt | null>(null);
  const [syncingReceipt, setSyncingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState('');
  const [historyVersion, setHistoryVersion] = useState(0);
  const [changesVersion, setChangesVersion] = useState(0);
  const [showFiles, setShowFiles] = useState(() => savedView?.showFiles ?? true);
  const [showChanges, setShowChanges] = useState(() =>
    targetReview ? !(window.matchMedia?.('(max-width: 48rem)').matches ?? false)
      : savedView?.showChanges ?? false);
  const [focus, setFocus] = useState(() => targetReview ? false : savedView?.focus ?? false);
  const { refresh: refreshWorkspace, saving } = useWorkspace();
  const commit = tree?.commit;
  const [changesSide, setChangesSide] = useState<'left' | 'right'>(() => targetReview ? 'right' : savedView?.changesSide ?? (savedView?.showChanges ? 'right' : 'left'));
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loaded, setLoaded] = useState<Record<string, { commit: string; entries: TreeEntry[] }>>({});
  const [draftPaths, setDraftPaths] = useState<string[]>([]);
  const onDirectory = useCallback((path: string[], head: string, entries: TreeEntry[]) => {
    setLoaded(current => ({ ...current, [path.join('/')]: { commit: head, entries } }));
  }, []);
  const onDrafts = useCallback((files: DraftSummary[]) => setDraftPaths(files.map(item => item.path)), []);
  const dirty = new Set(Object.keys(buffers).flatMap(key => {
    try {
      const [repo, ref, path] = JSON.parse(key);
      return repo === repositoryId && ref === branch && typeof path === 'string' ? [path] : [];
    } catch { return []; }
  }));
  const presentation: TreePresentation = { active: file?.join('/') ?? '', dirty, drafts: new Set(draftPaths), onDirectory };
  const searchable = new Map<string, string[]>();
  if (tree) {
    const folders = { ...loaded, '': { commit: tree.commit, entries: tree.entries } };
    for (const [folder, listing] of Object.entries(folders)) {
      if (listing.commit !== tree.commit) continue;
      for (const entry of listing.entries) if (entry.kind === 'file') {
        const path = [...(folder ? folder.split('/') : []), entry.name];
        searchable.set(path.join('/'), path);
      }
    }
  }
  const results = [...searchable.values()].filter(path => path.join('/').toLowerCase().includes(search.trim().toLowerCase()));
  const fileKey = file ? JSON.stringify([repositoryId, branch, file.join('/')]) : '';
  const cursor = positions[fileKey]?.selection;
  const activeDocument = !!file && !diff && !historyDiff;
  function openActivity(view: 'files' | 'search' | 'changes' | 'history') {
    setFocus(false);
    if (view === 'files' || view === 'search') {
      const same = showFiles && !focus && searchOpen === (view === 'search');
      setSearchOpen(view === 'search');
      setShowFiles(!same);
      if (changesSide === 'left') setShowChanges(false);
    } else {
      const same = showChanges && !focus && changesSide === 'left' && tab === view;
      setTab(view);
      setChangesSide('left');
      setShowFiles(false);
      setShowChanges(!same);
    }
  }

  useEffect(() => {
    if (target) void navigate(location.pathname, { replace: true, state: null });
  }, [target, location.pathname, navigate]);

  // This state lives above the route, so leaving for Settings does not reset the editor.
  useEffect(() => {
    putView(workspaceKey, { file, diff, historyDiff, tab, showFiles, showChanges, focus, changesSide });
  }, [workspaceKey, file, diff, historyDiff, tab, showFiles, showChanges, focus, changesSide, putView]);

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
    setLoaded({});
    setFile(null);
    setTree(null);
    setTreeError('');
    setRefresh(current => current + 1);
  }

  function committed(result: CommitReceipt) {
    setReceiptError('');
    setReceipt(result);
    setDiff(null);
    setHistoryDiff(null);
    setChangesVersion(value => value + 1);
    setHistoryVersion(value => value + 1);
    setLoaded({});
    setTree(null);
    setTreeError('');
    setRefresh(value => value + 1);
  }

  async function retryDraftStatus() {
    if (!receipt?.reviewId || syncingReceipt) return;
    setSyncingReceipt(true);
    setReceiptError('');
    try {
      const updated = await workspaceRequest({
        action: 'reconcile_commit', repositoryId, branch, reviewId: receipt.reviewId, sha: receipt.sha,
      });
      setReceipt(updated);
      setChangesVersion(value => value + 1);
    } catch (error) {
      setReceiptError(workspaceError(error));
    } finally {
      setSyncingReceipt(false);
    }
  }

  return (
    <div className="module-stack ide-workbench">
      <ModuleTopbar title="Code Editor">
        <Link className="ide-repository" to="/repositories" title="Switch repository"><Code2 size={17} aria-hidden="true" />{repository}</Link>
        <BranchPicker />
        <span className="ide-spacer" />
        <button type="button" aria-label="Source Control panel" title="Toggle secondary Source Control panel" aria-expanded={showChanges && !focus && changesSide === 'right'}
          onClick={() => { setFocus(false); setChangesSide('right'); setShowChanges(focus || changesSide !== 'right' || !showChanges); }}><PanelRight size={18} aria-hidden="true" /></button>
        <button type="button" aria-pressed={focus} onClick={() => setFocus(value => !value)} title="Editor focus">
          {focus ? <Minimize2 size={17} aria-hidden="true" /> : <Maximize size={17} aria-hidden="true" />}<span>{focus ? 'Exit focus' : 'Focus'}</span>
        </button>
        <button type="button" onClick={refreshWorkspace} disabled={saving} aria-label="Refresh workspace" title="Refresh workspace"><RefreshCw size={17} aria-hidden="true" /></button>
      </ModuleTopbar>
      <div className={'editor-panes ide-panes' + (focus ? ' ide-focus' : '') + (changesSide === 'left' ? ' ide-changes-left' : ' ide-changes-right')}>
        <nav className="ide-activity" aria-label="Editor activity">
          <button type="button" aria-label="File explorer" title="Explorer" aria-pressed={showFiles && !focus && !searchOpen} onClick={() => openActivity('files')}><Files size={23} aria-hidden="true" /></button>
          <button type="button" aria-label="Search files" title="Search loaded files" aria-pressed={showFiles && !focus && searchOpen} onClick={() => openActivity('search')}><Search size={23} aria-hidden="true" /></button>
          <button type="button" aria-label="Source Control activity" title="Source Control" aria-pressed={showChanges && !focus && changesSide === 'left' && tab === 'changes'} onClick={() => openActivity('changes')}>
            <GitBranch size={23} aria-hidden="true" />{draftPaths.length > 0 && <span className="ide-activity-count" aria-hidden="true">{draftPaths.length}</span>}
          </button>
          <button type="button" aria-label="History activity" title="Commit history" aria-pressed={showChanges && !focus && changesSide === 'left' && tab === 'history'} onClick={() => openActivity('history')}><History size={23} aria-hidden="true" /></button>
          <span className="ide-spacer" />
          <Link to="/settings" title="CMS settings" aria-label="CMS settings"><Settings size={22} aria-hidden="true" /></Link>
        </nav>
        <div className="ide-file-panel" hidden={!showFiles || focus}>
          <ModulePanel title="Files">
            <div className="ide-sidebar-tools">
              <strong>{searchOpen ? 'SEARCH' : repository.split('/').at(-1)?.toUpperCase()}</strong>
              <button type="button" aria-label="Refresh file tree" title="Refresh file tree" onClick={refreshTree} disabled={!tree && !treeError}><RefreshCw size={15} aria-hidden="true" /></button>
            </div>
            {treeError && <p role="alert">{treeError}</p>}
            {!tree && !treeError && <p role="status">Loading file tree…</p>}
            <div hidden={searchOpen}>
              {tree && <DirectoryList key={tree.commit} context={{ repositoryId, branch }} path={[]} commit={tree.commit}
                entries={tree.entries} openFile={openFile} {...presentation} />}
            </div>
            {searchOpen && <div className="ide-search">
              <input type="search" aria-label="Find loaded files" placeholder="Find file by name or path" value={search} onChange={event => setSearch(event.target.value)} autoFocus />
              <p className="ide-muted">Searches the root and folders already opened in this session.</p>
              <ul className="source-tree ide-tree">{results.map(path => <li key={path.join('/')}><FileRow path={path} openFile={openFile} detail {...presentation} /></li>)}</ul>
              {results.length === 0 && <p className="ide-muted">No matching loaded files.</p>}
            </div>}
          </ModulePanel>
        </div>
        <section className="editor-center" aria-label="Editor workspace">
          <div className="editor-document" hidden={!!diff || !!historyDiff}>
            {!file && <div className="ide-empty"><Code2 size={64} strokeWidth={1} aria-hidden="true" /><h2>Start editing</h2><p>Choose an HTML, CSS, or JavaScript file to view its source.</p><button type="button" onClick={() => { setFocus(false); setShowFiles(true); setSearchOpen(false); if (changesSide === 'left') setShowChanges(false); }}>Open file explorer</button></div>}
            {file && commit && <DraftEditor key={JSON.stringify([file, commit])}
              {...{ repositoryId, branch, path: file, commit }} onClose={() => setFile(null)} onSaved={() => setChangesVersion(value => value + 1)} />}
          </div>
          {diff && <DraftDiff key={diff} file={diff} {...{ repositoryId, branch }} onBack={() => setDiff(null)} />}
          {historyDiff && <HistoryDiff key={JSON.stringify(historyDiff)} file={historyDiff}
            {...{ repositoryId, branch, repository }} onBack={() => setHistoryDiff(null)} />}
        </section>
        <div className="ide-changes-panel" hidden={!showChanges || focus}>
        <ModulePanel title="Source Control">
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
          {receipt && <div className="workspace-actions">
            <p role="status">Committed <a href={receipt.url} target="_blank" rel="noreferrer">{receipt.sha.slice(0, 12)}</a>.
              {receipt.retained === null && ' Draft status could not be recorded. The saved drafts are still available.'}
              {receipt.retained !== null && receipt.retained < receipt.fileCount &&
                ' Some saved revisions changed during the commit and were left pending.'}</p>
            {receipt.retained === null && receipt.reviewId && <button type="button" disabled={syncingReceipt}
              onClick={() => void retryDraftStatus()}>
              {syncingReceipt ? 'Syncing…' : 'Retry draft status sync'}
            </button>}
            {receiptError && <p role="alert">{receiptError}</p>}
          </div>}
          <div role="tabpanel" id={`${tabGroupId}-panel`} aria-labelledby={`${tabGroupId}-${tab}`}>
            {tab === 'changes'
            ? <ChangedFiles {...{ repositoryId, branch }} version={changesVersion} active={diff} onCommitted={committed} onFiles={onDrafts}
                onOpen={path => {
                  setHistoryDiff(null);
                  setDiff(path);
                  if (window.matchMedia?.('(max-width: 48rem)').matches) setShowChanges(false);
                }} refresh={() => { setDiff(null); setChangesVersion(value => value + 1); }} />
            : <HistoryPanel key={historyVersion} {...{ repositoryId, branch, repository }} version={historyVersion}
                openFile={selected => {
                  setDiff(null);
                  setHistoryDiff(selected);
                  if (window.matchMedia?.('(max-width: 48rem)').matches) setShowChanges(false);
                }} />}
          </div>
        </ModulePanel>
        </div>
      </div>
      <footer className="ide-statusbar" aria-label="Editor status">
        <span><GitBranch size={14} aria-hidden="true" />{branch}</span>
        <span>{dirty.size ? dirty.size + ' unsaved' : 'Workspace ready'}</span>
        <span className="ide-spacer" />
        {activeDocument && <><span>Ln {cursor?.endLineNumber ?? 1}, Col {cursor?.endColumn ?? 1}</span><span>UTF-8</span><span>{fileLanguage(file!.join('/'))}</span><span>{editing[fileKey] ? 'Editing enabled' : 'Read-only'}</span></>}
        {(diff || historyDiff) && <span>{diff ? 'Draft comparison' : 'Historical comparison'}</span>}
      </footer>
    </div>
  );
}

export function CodeEditorPage() {
  const { workspace: { selection, repositories }, saving } = useWorkspace();
  const active = repositories.find(repository => repository.id === selection?.repositoryId);
  const { buffers, recoveryError } = useEditBuffers();
  const unsaved = Object.keys(buffers).length;
  return (
    <>
      {(!selection?.branch || saving || !active) && <>
        <ModuleTopbar title="Code Editor"><BranchPicker /></ModuleTopbar>
        {!active && <p className="module-body"><Link to="/repositories">Select a repository</Link> to browse its files.</p>}
      </>}
      {recoveryError && <p className="workspace-alert" role="alert">
        Temporary browser recovery storage is unavailable or full. Save your work as a Supabase draft before leaving this tab.
      </p>}
      {unsaved > 0 && <p className="workspace-notice">Unsaved files in this session: {unsaved}. Reopen a file to continue editing or save it.</p>}
      {selection?.branch && active && !saving && (
        <Explorer key={JSON.stringify([selection.repositoryId, selection.branch])}
          repository={active.name} selection={{ repositoryId: selection.repositoryId, branch: selection.branch }} />
      )}
    </>
  );
}
