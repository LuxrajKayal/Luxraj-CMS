import { useState } from 'react';
import { filePath } from '../../../supabase/functions/_shared/file-bytes';
import { useFileDirectory, type FileScope } from '../file-manager/FileDestination';

export function RepositoryFilePicker({ scope, label, htmlOnly, onPick, disabled }: {
  scope: FileScope; label: string; htmlOnly?: boolean; onPick(path: string): void; disabled?: boolean;
}) {
  const [folder, setFolder] = useState<string[]>([]);
  const [version, setVersion] = useState(0);
  const { directory, error } = useFileDirectory(scope, folder, version, true);
  return <fieldset disabled={disabled} className="website-file-picker">
    <legend>{label}</legend>
    <div className="workspace-actions">
      <code>{folder.join('/') || '/'}</code>
      <button type="button" disabled={!folder.length} onClick={() => setFolder(folder.slice(0, -1))}>Up one folder</button>
      <label>Subfolder <select value="" disabled={!directory} onChange={event => {
        const path = [...folder, event.target.value];
        if (filePath(path)) setFolder(path);
      }}>
        <option value="">Choose a folder</option>
        {directory?.entries.filter(entry => entry.kind === 'folder').map(entry => <option key={entry.name}>{entry.name}</option>)}
      </select></label>
      <label>File <select value="" disabled={!directory} onChange={event => {
        if (event.target.value) onPick([...folder, event.target.value].join('/'));
      }}>
        <option value="">Choose a file</option>
        {directory?.entries.filter(entry => entry.kind === 'file' && (!htmlOnly || /\.html$/i.test(entry.name)))
          .map(entry => <option key={entry.name}>{entry.name}</option>)}
      </select></label>
    </div>
    {error && <div role="alert">{error} <button type="button" onClick={() => setVersion(value => value + 1)}>Reload folder</button></div>}
    {!directory && !error && <p role="status">Loading files…</p>}
  </fieldset>;
}
