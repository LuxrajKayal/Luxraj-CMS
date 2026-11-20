import { useEffect, useState } from 'react';
import type { StorageUsage } from '../../../supabase/functions/_shared/workspace-contracts';
import { formatMb, workspaceError, workspaceRequest } from '../workspace/api';

function Allocation({ name, used, selected, applied, ceiling, quota, disabled, change }: {
  name: string; used: number | null; selected: number; applied: number; ceiling: number; quota: number;
  disabled: boolean; change(value: number): void;
}) {
  const bytes = applied * 1_000_000;
  return (
    <section className="storage-card">
      <h3>{name}</h3>
      <label>{name} allocation <strong>{selected} MB</strong>
        <input type="range" min={1} max={ceiling} step={1} value={selected} disabled={disabled}
          aria-valuetext={`${selected} MB`} onChange={event => change(Number(event.target.value))} />
      </label>
      <dl>
        <dt>Current usage</dt><dd>{used === null ? 'Unavailable' : formatMb(used)}</dd>
        <dt>Saved allocation</dt><dd>{applied} MB</dd>
        <dt>Remaining budget</dt><dd>{used === null ? 'Unavailable' : formatMb(Math.max(0, bytes - used))}</dd>
        <dt>CMS ceiling</dt><dd>{ceiling} MB</dd>
        <dt>Free-plan quota</dt><dd>{quota} MB</dd>
        <dt>Reserve at ceiling</dt><dd>{quota - ceiling} MB</dd>
      </dl>
      {used !== null && used >= bytes && <p role="alert">{name} has reached its allocation.</p>}
      {used !== null && used < bytes && used >= bytes * 0.8 && <p className="storage-warning">At least 80% of this allocation is used.</p>}
    </section>
  );
}

export function StorageManagementPage() {
  const [usage, setUsage] = useState<StorageUsage | null>(null);
  const [database, setDatabase] = useState(0);
  const [file, setFile] = useState(0);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    setError('');
    workspaceRequest({ action: 'storage_status' }, controller.signal).then(result => {
      if (controller.signal.aborted) return;
      setUsage(result);
      setDatabase(result.databaseLimitMb);
      setFile(result.fileLimitMb);
    }).catch(error => {
      if (!controller.signal.aborted) setError(workspaceError(error));
    }).finally(() => {
      if (!controller.signal.aborted) setBusy(false);
    });
    return () => controller.abort();
  }, [reload]);

  async function save() {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await workspaceRequest({ action: 'storage_save', databaseLimitMb: database, fileLimitMb: file });
      setUsage(result);
      setDatabase(result.databaseLimitMb);
      setFile(result.fileLimitMb);
      setNotice('Storage allocations saved in Supabase.');
    } catch (error) {
      setError(workspaceError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="storage-management">
      <h2 id="storage-management">Storage Management</h2>
      <p>These allocations limit CMS-controlled writes. PostgreSQL usage includes the entire database, and Supabase or other apps can still grow it.</p>
      <div className="workspace-actions">
        <button type="button" disabled={busy} onClick={() => { setNotice(''); setReload(value => value + 1); }}>Refresh usage</button>
        <button type="button" disabled={busy || !usage || (usage.databaseLimitMb === database && usage.fileLimitMb === file)}
          onClick={() => void save()}>Save storage allocations</button>
      </div>
      {busy && <p role="status">Checking storage…</p>}
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {usage && (
        <>
          <div className="storage-grid">
            <Allocation name="PostgreSQL" used={usage.databaseBytes} selected={database} applied={usage.databaseLimitMb}
              ceiling={usage.databaseCeilingMb} quota={500} disabled={busy} change={setDatabase} />
            <Allocation name="File Storage" used={usage.fileBytes} selected={file} applied={usage.fileLimitMb}
              ceiling={usage.fileCeilingMb} quota={1000} disabled={busy} change={setFile} />
          </div>
          <p>Draft table, including indexes and PostgreSQL overhead: <strong>{formatMb(usage.draftTableBytes)}</strong>.
            Estimated original and proposed draft text: <strong>{formatMb(usage.draftContentBytes)}</strong>.</p>
          <p>File Storage usage is estimated from Supabase object metadata. It is separate from drafts. The CMS currently has no upload flow.</p>
          <p>Lowering an allocation keeps existing data. Delete drafts manually in Draft Management when needed.</p>
        </>
      )}
    </section>
  );
}
