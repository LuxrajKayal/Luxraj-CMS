import { useEffect, useState, type FormEvent } from 'react';
import { workspaceError, workspaceRequest } from '../workspace/api';

export function CommitLimitPage() {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    workspaceRequest({ action: 'commit_limit' }, controller.signal)
      .then(result => { if (!controller.signal.aborted) setValue(String(result.maximumFiles)); })
      .catch(error => { if (!controller.signal.aborted) setError(workspaceError(error)); })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setStatus('');
    try {
      const result = await workspaceRequest({ action: 'save_commit_limit', maximumFiles: Number(value) });
      setValue(String(result.maximumFiles));
      setStatus('Commit limit saved.');
    } catch (error) { setError(workspaceError(error)); }
    finally { setBusy(false); }
  }

  return <section>
    <h2>Maximum Files Per Commit</h2>
    <p>This setting limits each reviewed commit. You can prepare more drafts and commit them in batches.</p>
    <form className="workspace-actions" onSubmit={event => void save(event)}>
      <label>Files per commit <input type="number" min={1} max={100} step={1} required value={value}
        disabled={busy} onChange={event => setValue(event.target.value)} /></label>
      <button type="submit" disabled={busy || !value}>Save commit limit</button>
    </form>
    {error && <p role="alert">{error}</p>}
    {status && <p role="status">{status}</p>}
  </section>;
}
