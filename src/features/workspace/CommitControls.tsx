import { useEffect, useRef, useState } from 'react';
import type { CommitReceipt, CommitReview, ReviewFile } from '../../../supabase/functions/_shared/workspace-contracts';
import { workspaceError, workspaceRequest } from './api';

export function CommitControls({ repositoryId, branch, files, onCommitted, maximumFiles }: {
  repositoryId: number; branch: string; files: ReviewFile[]; maximumFiles: number; onCommitted(receipt: CommitReceipt): void;
}) {
  const [message, setMessage] = useState('');
  const [review, setReview] = useState<CommitReview | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [recovery, setRecovery] = useState('');
  const [recoverySha, setRecoverySha] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!review || !dialog.current) return;
    if (typeof dialog.current.showModal === 'function') dialog.current.showModal();
    else dialog.current.open = true;
  }, [review]);

  async function prepare() {
    setError('');
    setBusy(true);
    try {
      setReview(await workspaceRequest({ action: 'review_commit', repositoryId, branch, files, message }));
    } catch (error) {
      setError(workspaceError(error));
    } finally { setBusy(false); }
  }

  async function confirm() {
    if (!review) return;
    setBusy(true);
    setError('');
    try {
      const receipt = await workspaceRequest({ action: 'confirm_commit', repositoryId, branch, reviewId: review.id });
      setMessage('');
      onCommitted(receipt);
    } catch (error) {
      setError(workspaceError(error));
      if (error instanceof Error && ['commit_unknown', 'unavailable'].includes(error.message)) setRecovery(review.id);
    } finally {
      setReview(null);
      setBusy(false);
    }
  }

  async function verifyCommit() {
    if (!recovery || !/^[0-9a-f]{40}$/i.test(recoverySha.trim())) return;
    setBusy(true);
    setError('');
    try {
      const receipt = await workspaceRequest({ action: 'reconcile_commit', repositoryId, branch,
        reviewId: recovery, sha: recoverySha.trim().toLowerCase() });
      setRecovery('');
      setRecoverySha('');
      setMessage('');
      onCommitted(receipt);
    } catch (error) { setError(workspaceError(error)); }
    finally { setBusy(false); }
  }

  return <div className="commit-controls">
    <label>Commit message
      <textarea maxLength={1000} rows={2} value={message} disabled={busy} onChange={event => setMessage(event.target.value)} />
    </label>
    <button type="button" onClick={() => void prepare()} disabled={busy || !message.trim() || !files.length || files.length > maximumFiles}>
      Review &amp; Commit
    </button>
    {files.length > maximumFiles && <p>Select up to {maximumFiles} files per commit.</p>}
    {error && <p role="alert">{error}</p>}
    {recovery && <section aria-label="Recover commit status">
      <p>Check the selected branch on GitHub. If it contains the reviewed commit, paste its full SHA to verify it and sync drafts.</p>
      <label>GitHub commit SHA <input value={recoverySha} maxLength={40} onChange={event => setRecoverySha(event.target.value)} /></label>
      <button type="button" disabled={busy || !/^[0-9a-f]{40}$/i.test(recoverySha.trim())}
        onClick={() => void verifyCommit()}>Verify existing commit</button>
    </section>}
    {review && <dialog ref={dialog} aria-labelledby="commit-confirm-title" onCancel={event => {
      event.preventDefault();
      if (!busy) setReview(null);
    }}>
      <h2 id="commit-confirm-title">Confirm GitHub commit</h2>
      <dl><dt>Repository</dt><dd>{review.repository}</dd><dt>Branch</dt><dd>{review.branch}</dd></dl>
      <p>Commit message</p><pre>{review.message}</pre>
      <ul>{review.files.map(file => <li key={file.path}>{file.path}
        {file.file && <div>{file.file.originalBlob ? 'Replacement' : 'New file'} · {file.file.size.toLocaleString()} bytes
          <br /><code>{file.file.sha256}</code></div>}
      </li>)}</ul>
      <p>This commits the selected saved revisions. Unsaved editor changes stay in the browser.</p>
      <div className="workspace-actions">
        <button type="button" autoFocus disabled={busy} onClick={() => setReview(null)}>Cancel</button>
        <button type="button" disabled={busy} onClick={() => void confirm()}>{busy ? 'Committing…' : 'Confirm commit'}</button>
      </div>
    </dialog>}
  </div>;
}
