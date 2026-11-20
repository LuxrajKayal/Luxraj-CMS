import { useEffect, useState } from 'react';
import { Link, Outlet, useOutletContext } from 'react-router';
import { workspaceError, workspaceRequest, type Workspace } from './api';
import './workspace.css';

type WorkspaceContext = {
  workspace: Workspace;
  saving: boolean;
  select(repositoryId: number, branch?: string): Promise<void>;
};

export function WorkspaceLayout() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    workspaceRequest({ action: 'load' }, controller.signal).then(result => {
      if (!controller.signal.aborted) setWorkspace(result);
    }).catch(error => {
      if (!controller.signal.aborted) setError(workspaceError(error));
    });
    return () => controller.abort();
  }, [reload]);

  function refresh() {
    setWorkspace(null);
    setError('');
    setReload(current => current + 1);
  }

  async function select(repositoryId: number, branch?: string) {
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      setWorkspace(await workspaceRequest({ action: 'select', repositoryId, branch }));
    } catch (error) {
      setError(workspaceError(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="workspace">
      <div className="workspace-actions">
        <button type="button" onClick={refresh} disabled={saving || (!workspace && !error)}>Refresh workspace</button>
        {!workspace && error && <Link to="/settings">GitHub Connection settings</Link>}
      </div>
      {error && <p role="alert">{error}</p>}
      {saving && <p role="status">Saving workspace selection…</p>}
      {!workspace && !error && <p role="status">Loading GitHub workspace…</p>}
      {workspace && <Outlet context={{ workspace, saving, select } satisfies WorkspaceContext} />}
    </section>
  );
}

export function useWorkspace() {
  return useOutletContext<WorkspaceContext>();
}

export function BranchPicker() {
  const { workspace: { selection, branches }, saving, select } = useWorkspace();
  if (!selection) return null;
  if (!branches.length) return <p>This repository has no remote branches.</p>;

  return (
    <label className="workspace-field">
      Branch
      <select value={selection.branch ?? ''} disabled={saving}
        onChange={event => void select(selection.repositoryId, event.target.value)}>
        {!selection.branch && <option value="" disabled>Choose a branch</option>}
        {branches.map(branch => <option key={branch} value={branch}>{branch}</option>)}
      </select>
    </label>
  );
}
