import { useState } from 'react';
import type { MaintenanceMode } from '../../../supabase/functions/_shared/workspace-contracts';
import { workspaceError, workspaceRequest } from '../workspace/api';

const options = [
  { mode: 'controls', name: 'Clear Website Control Preferences', description: 'Remove saved control registrations and paths across all repositories and branches.' },
  { mode: 'drafts', name: 'Clear All Drafts', description: 'Permanently delete all saved drafts and their temporary files, including retained copies of committed drafts.' },
  { mode: 'all', name: 'Clear All Settings and Drafts', description: 'Delete saved drafts and reset Website Controls, workspace selection, storage allocations, the commit limit and the profile picture destination.' },
] as const;

export function MaintenancePage() {
  const [selected, setSelected] = useState<MaintenanceMode | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const confirmation = options.find(option => option.mode === selected);

  async function run(mode: MaintenanceMode) {
    let deleted = 0;
    let after: string | undefined;
    setBusy(true);
    setError('');
    setNotice('Maintenance in progress…');
    try {
      for (;;) {
        const result = await workspaceRequest({ action: 'website_maintenance', mode, after });
        deleted += result.deleted;
        if (result.next) {
          setNotice(deleted + ' drafts cleared. Continuing…');
          after = result.next;
          continue;
        }
        if (result.remaining) {
          setError(result.remaining + ' drafts remain. Wait for any uploads to finish and retry. Settings were retained.');
        } else if (mode === 'all' && result.reset) {
          try {
            sessionStorage.removeItem('luxraj-sidebar');
            sessionStorage.removeItem('luxraj-repository-view');
          } catch { /* Presentation preferences may be unavailable. */ }
          window.dispatchEvent(new Event('luxraj:presentation-reset'));
        }
        setNotice(mode === 'controls' ? 'Website Control preferences cleared.' :
          deleted + ' drafts cleared.' + (result.reset ? ' CMS settings reset.' : ''));
        break;
      }
    } catch (failure) {
      setNotice(deleted ? deleted + ' drafts cleared before the interruption.' : '');
      setError(workspaceError(failure));
    } finally {
      setBusy(false);
      setSelected(null);
    }
  }

  return <section aria-labelledby="maintenance-heading">
    <h2 id="maintenance-heading">Maintenance</h2>
    <p>These operations apply across repositories and branches. Committed GitHub files and CMS accounts are retained.</p>
    {options.map(option => <section key={option.mode}>
      <h3>{option.name}</h3>
      <p>{option.description}</p>
      <button type="button" disabled={busy || !!confirmation} onClick={() => {
        setError('');
        setNotice('');
        setSelected(option.mode);
      }}>{option.name}</button>
    </section>)}
    {confirmation && <div role="alertdialog" aria-labelledby="maintenance-confirmation" aria-describedby="maintenance-effect">
      <h3 id="maintenance-confirmation">Confirm {confirmation.name}</h3>
      <p id="maintenance-effect">{confirmation.description} This action is permanent.</p>
      <div className="workspace-actions">
        <button type="button" autoFocus disabled={busy} onClick={() => setSelected(null)}>Cancel</button>
        <button type="button" disabled={busy} onClick={() => void run(confirmation.mode)}>Confirm cleanup</button>
      </div>
    </div>}
    {notice && <p role="status">{notice}</p>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
