import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import type { ProfilePictureLocation } from '../../../supabase/functions/_shared/workspace-contracts';
import { FileWorkspacePicker, FolderPicker, useFileDirectory, type FileScope } from '../file-manager/FileDestination';
import { workspaceError, workspaceRequest } from '../workspace/api';
import { useWorkspace } from '../workspace/WorkspaceLayout';
import '../file-manager/file-manager.css';

function LocationForm({ scope, location, onSaved }: {
  scope: FileScope; location: ProfilePictureLocation | null; onSaved(value: ProfilePictureLocation): void;
}) {
  const [folder, setFolder] = useState(() => location?.repositoryId === scope.repositoryId && location.branch === scope.branch
    ? location.folder.split('/') : []);
  const [prefix, setPrefix] = useState(location?.publicPrefix ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { directory, error: directoryError } = useFileDirectory(scope, folder);
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!directory || !folder.length || !prefix.trim()) return;
    setSaving(true);
    setError('');
    try {
      const result = await workspaceRequest({ action: 'save_profile_picture_location', ...scope, folder: folder.join('/'), publicPrefix: prefix.trim() });
      onSaved(result.location);
    } catch (error) { setError(workspaceError(error)); }
    finally { setSaving(false); }
  }
  return <form className="file-location-form" onSubmit={event => void save(event)}>
    <FolderPicker folder={folder} directory={directory} choose={setFolder} disabled={saving} />
    <label>Public asset URL prefix <input value={prefix} onChange={event => setPrefix(event.target.value)} disabled={saving}
      type="url" maxLength={2048} required placeholder="https://example.com/path/" /></label>
    <button type="submit" disabled={saving || !directory || !folder.length}>Save picture location</button>
    {(error || directoryError) && <p role="alert">{error || directoryError}</p>}
  </form>;
}

export function ProfilePictureLocationPage() {
  const { workspace: { repositories, selection }, saving, select } = useWorkspace();
  const [location, setLocation] = useState<ProfilePictureLocation | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    workspaceRequest({ action: 'profile_picture_location' }, controller.signal)
      .then(result => { if (!controller.signal.aborted) { setLocation(result.location); setLoaded(true); } })
      .catch(error => { if (!controller.signal.aborted) setError(workspaceError(error)); });
    return () => controller.abort();
  }, []);
  const repository = location && repositories.find(repo => repo.id === location.repositoryId);
  const selectedLocation = location && selection?.repositoryId === location.repositoryId && selection.branch === location.branch;
  return <section>
    <h2>Author Profile Picture Location</h2>
    <p>This destination is shared by approved Author and Super Admin pictures. Choose an existing assets folder and its corresponding public HTTPS URL.</p>
    <FileWorkspacePicker />
    {error && <p role="alert">{error}</p>}
    {location && <div>
      <p>Saved location <strong>{repository?.name ?? 'Repository unavailable'} · {location.branch} · {location.folder}</strong></p>
      <p><code>{location.publicPrefix}</code></p>
      {!selectedLocation && repository && <button type="button" disabled={saving}
        onClick={() => void select(location.repositoryId, location.branch)}>Open saved workspace</button>}
      <p><Link to="/file-manager?profile=1">Stage an approved WebP or verify a committed picture</Link></p>
    </div>}
    {loaded && !saving && selection?.branch && <LocationForm
      key={JSON.stringify([selection.repositoryId, selection.branch, location])}
      scope={{ repositoryId: selection.repositoryId, branch: selection.branch }} location={location}
      onSaved={value => { setLocation(value); setStatus('Picture location saved.'); }} />}
    {status && <p role="status">{status}</p>}
  </section>;
}
