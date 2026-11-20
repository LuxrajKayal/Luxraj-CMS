import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { workspaceError, workspaceRequest, type Directory, type Selection, type TreeEntry } from './api';
import { BranchPicker, useWorkspace } from './WorkspaceLayout';

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
            : <button type="button" onClick={() => openFile([...path, entry.name])}>{entry.name}</button>}
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
        {path.at(-1)}
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

function Explorer({ selection }: { selection: Selection & { branch: string } }) {
  const { repositoryId, branch } = selection;
  const [tree, setTree] = useState<Directory | null>(null);
  const [treeError, setTreeError] = useState('');
  const [file, setFile] = useState<string[] | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [fileError, setFileError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const commit = tree?.commit;

  useEffect(() => {
    const controller = new AbortController();
    workspaceRequest({ action: 'tree', repositoryId, branch, path: [] }, controller.signal)
      .then(result => { if (!controller.signal.aborted) setTree(result); })
      .catch(error => { if (!controller.signal.aborted) setTreeError(workspaceError(error)); });
    return () => controller.abort();
  }, [repositoryId, branch, refresh]);

  useEffect(() => {
    if (!file || !commit) return;
    const controller = new AbortController();
    workspaceRequest({ action: 'file', repositoryId, branch, path: file, commit }, controller.signal)
      .then(result => { if (!controller.signal.aborted) setSource(result.source); })
      .catch(error => { if (!controller.signal.aborted) setFileError(workspaceError(error)); });
    return () => controller.abort();
  }, [repositoryId, branch, file, commit]);

  function openFile(path: string[]) {
    setSource(null);
    setFileError('');
    setFile([...path]);
  }

  function refreshTree() {
    setFile(null);
    setSource(null);
    setFileError('');
    setTree(null);
    setTreeError('');
    setRefresh(current => current + 1);
  }

  return (
    <>
      <button type="button" onClick={refreshTree} disabled={!tree && !treeError}>Refresh file tree</button>
      <div className="source-explorer">
        <section aria-label="File explorer">
          <h2>Files</h2>
          {treeError && <p role="alert">{treeError}</p>}
          {!tree && !treeError && <p role="status">Loading file tree…</p>}
          {tree && <DirectoryList context={{ repositoryId, branch }} path={[]} commit={tree.commit}
            entries={tree.entries} openFile={openFile} />}
        </section>
        <section aria-label="Read-only source">
          <h2>{file ? file.join('/') : 'Source preview'}</h2>
          {!file && <p>Choose an HTML, CSS, or JavaScript file to view its source.</p>}
          {fileError && <p role="alert">{fileError}</p>}
          {file && source === null && !fileError && <p role="status">Loading source…</p>}
          {source !== null && <pre tabIndex={0}><code>{source}</code></pre>}
        </section>
      </div>
    </>
  );
}

export function CodeEditorPage() {
  const { workspace: { selection, repositories }, saving } = useWorkspace();
  const active = repositories.find(repository => repository.id === selection?.repositoryId);
  return (
    <>
      <h1>Code Editor</h1>
      {!active && <p><Link to="/repositories">Select a repository</Link> to browse its files.</p>}
      {active && <p>Repository <strong>{active.name}</strong> · <Link to="/repositories">Switch repository</Link></p>}
      <BranchPicker />
      {selection?.branch && !saving && (
        <Explorer key={JSON.stringify([selection.repositoryId, selection.branch])}
          selection={{ repositoryId: selection.repositoryId, branch: selection.branch }} />
      )}
    </>
  );
}
