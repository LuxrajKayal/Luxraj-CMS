import { useEffect, useState } from 'react';
import type { ManagedDraft } from '../../../supabase/functions/_shared/workspace-contracts';
import { workspaceError, workspaceRequest } from '../workspace/api';
import { useEditBuffers } from '../workspace/EditBuffers';

const keyOf = ({ repositoryId, branch, path }: ManagedDraft) => JSON.stringify([repositoryId, branch, path]);

export function DraftManagementPage() {
  const { buffers } = useEditBuffers();
  const [files, setFiles] = useState<ManagedDraft[] | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [confirmation, setConfirmation] = useState<ManagedDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const selected = files?.filter(file => checked.includes(keyOf(file))) ?? [];

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    workspaceRequest({ action: 'draft_catalog' }, controller.signal)
      .then(result => {
        if (!controller.signal.aborted) {
          setFiles(result.files);
          setChecked([]);
          setError('');
        }
      })
      .catch(error => { if (!controller.signal.aborted) setError(workspaceError(error)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [refresh]);

  async function remove() {
    if (deleting) return;
    setDeleting(true);
    setError('');
    let deleted = 0;
    let conflicts = 0;
    let unavailable = 0;
    let unconfirmed = 0;
    for (let offset = 0; offset < confirmation.length; offset += 50) {
      const drafts = confirmation.slice(offset, offset + 50).map(({ repositoryId, branch, path, revision }) =>
        ({ repositoryId, branch, path, revision }));
      try {
        const { results } = await workspaceRequest({ action: 'delete_drafts', drafts });
        deleted += results.filter(item => item.result === 'deleted').length;
        conflicts += results.filter(item => item.result === 'conflict').length;
        unavailable += results.filter(item => item.result === 'unavailable').length;
        unconfirmed += Math.max(0, drafts.length - results.length);
      } catch {
        unconfirmed += drafts.length;
      }
    }
    setNotice(`Deleted ${deleted} of ${confirmation.length} drafts.` +
      (conflicts ? ` ${conflicts} changed or were already removed.` : '') +
      (unavailable ? ` ${unavailable} were unavailable for deletion.` : '') +
      (unconfirmed ? ` Could not confirm the result for ${unconfirmed}.` : ''));
    setDeleting(false);
    setConfirmation([]);
    setRefresh(value => value + 1);
  }

  const busy = loading || deleting || confirmation.length > 0 || !!error;
  return (
    <section aria-labelledby="draft-management">
      <h2 id="draft-management">Draft Management</h2>
      <p>Saved drafts are retained until manually deleted. The list covers repositories and branches currently accessible to the GitHub App.</p>
      {files && <p>{files.length} saved drafts · {files.reduce((total, item) => total + item.contentBytes, 0).toLocaleString()} bytes of source text</p>}
      <div className="workspace-actions">
        <button type="button" disabled={loading || deleting || !!confirmation.length} onClick={() => setRefresh(value => value + 1)}>Refresh drafts</button>
        <button type="button" disabled={busy || !selected.length} onClick={() => { setNotice(''); setConfirmation(selected); }}>
          Delete selected ({selected.length})
        </button>
      </div>
      {loading && <p role="status">Loading saved drafts…</p>}
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {!!confirmation.length && (
        <section className="module-body" role="alertdialog" aria-labelledby="delete-draft-title">
          <h3 id="delete-draft-title">Permanently delete {confirmation.length === 1 ? 'this draft' : 'these drafts'}?</h3>
          <p>This removes the saved Supabase drafts. The GitHub source files stay intact.</p>
          {confirmation.some(file => !!buffers[keyOf(file)]) &&
            <p role="alert">Some selected files have unsaved browser edits. Those edits stay in this session, but their saved drafts will be removed.</p>}
          <ul>{confirmation.map(file => <li key={keyOf(file)}>{file.repository} · {file.branch} · {file.path}</li>)}</ul>
          <div className="workspace-actions">
            <button type="button" autoFocus disabled={deleting} onClick={() => setConfirmation([])}>Cancel</button>
            <button type="button" disabled={deleting} onClick={() => void remove()}>
              {deleting ? 'Deleting…' : 'Permanently delete'}
            </button>
          </div>
        </section>
      )}
      {files?.length === 0 && !loading && <p>No saved drafts in the current GitHub scope.</p>}
      {!!files?.length && (
        <div className="settings-table-scroll">
          <table className="settings-table">
            <thead><tr>
              <th><input aria-label="Select all drafts" type="checkbox" disabled={busy} checked={selected.length === files.length}
                onChange={event => setChecked(event.target.checked ? files.map(keyOf) : [])} /></th>
              <th>Repository</th><th>Branch</th><th>File</th><th>Updated</th><th>State</th><th>Estimated content</th><th>Action</th>
            </tr></thead>
            <tbody>{files.map(file => {
              const key = keyOf(file);
              return (
                <tr key={key}>
                  <td><input aria-label={`Select ${file.repository} ${file.branch} ${file.path}`}
                    type="checkbox" checked={checked.includes(key)} disabled={busy} onChange={event => {
                      setChecked(event.target.checked ? [...checked, key] : checked.filter(item => item !== key));
                    }} /></td>
                  <td>{file.repository}</td><td>{file.branch}</td><td><code>{file.path}</code></td>
                  <td><time dateTime={file.updatedAt}>{new Date(file.updatedAt).toLocaleString()}</time></td>
                  <td>{file.pending ? 'Pending change' : 'Retained · unchanged'}</td>
                  <td>{file.contentBytes.toLocaleString()} bytes</td>
                  <td><button type="button" disabled={busy} aria-label={`Delete ${file.repository} ${file.branch} ${file.path}`}
                    onClick={() => { setNotice(''); setConfirmation([file]); }}>Delete</button></td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
