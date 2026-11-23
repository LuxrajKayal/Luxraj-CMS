import { useEffect, useState } from 'react';
import { filePath } from '../../../supabase/functions/_shared/file-bytes';
import { BranchPicker, useWorkspace } from '../workspace/WorkspaceLayout';
import { workspaceError, workspaceRequest, type Directory } from '../workspace/api';

export type FileScope = { repositoryId: number; branch: string };

export function FileWorkspacePicker({ disabled = false }: { disabled?: boolean }) {
  const { workspace, saving, select } = useWorkspace();
  return <fieldset className="file-scope" disabled={saving || disabled}>
    <label>Repository <select value={workspace.selection?.repositoryId ?? ''} onChange={event => {
      const repositoryId = Number(event.target.value);
      const repository = workspace.repositories.find(item => item.id === repositoryId);
      if (!repository || (workspace.selection && !window.confirm('Switch the active workspace to ' + repository.name + '?'))) return;
      void select(repositoryId);
    }}>
      <option value="" disabled>Select a repository</option>
      {workspace.repositories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
    </select></label>
    <BranchPicker />
  </fieldset>;
}

export function useFileDirectory(scope: FileScope, folder: string[], version = 0) {
  const [directory, setDirectory] = useState<Directory | null>(null);
  const [error, setError] = useState('');
  const { repositoryId, branch } = scope;
  useEffect(() => {
    const controller = new AbortController();
    setDirectory(null);
    setError('');
    workspaceRequest({ action: 'file_manager_tree', repositoryId, branch, path: folder }, controller.signal)
      .then(data => { if (!controller.signal.aborted) setDirectory(data); })
      .catch(error => { if (!controller.signal.aborted) setError(workspaceError(error)); });
    return () => controller.abort();
  }, [repositoryId, branch, folder, version]);
  return { directory, error };
}

export function FolderPicker({ folder, directory, choose, disabled }: {
  folder: string[]; directory: Directory | null; choose(path: string[]): void; disabled?: boolean;
}) {
  return <section aria-label="Destination folder" className="file-folder">
    <strong>Destination folder</strong>
    <div className="workspace-actions">
      <code>{folder.join('/') || '/'}</code>
      <button type="button" disabled={disabled || !folder.length} onClick={() => choose(folder.slice(0, -1))}>Up one folder</button>
      <label>Open subfolder <select value="" disabled={disabled || !directory} onChange={event => {
        const next = [...folder, event.target.value];
        if (filePath(next)) choose(next);
      }}>
        <option value="" disabled>Choose a folder</option>
        {directory?.entries.filter(item => item.kind === 'folder').map(item => <option key={item.name}>{item.name}</option>)}
      </select></label>
    </div>
  </section>;
}
