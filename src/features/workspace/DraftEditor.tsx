import { lazy, Suspense, useEffect, useState } from 'react';
import type { OpenDraft } from '../../../supabase/functions/_shared/workspace-contracts';
import { workspaceError, workspaceRequest } from './api';
import { useEditBuffers, type EditBuffer } from './EditBuffers';

const MonacoSource = lazy(() => import('./MonacoViews').then(module => ({ default: module.MonacoSource })));

export function DraftEditor({ repositoryId, branch, path, commit, onSaved }: {
  repositoryId: number; branch: string; path: string[]; commit: string; onSaved?(): void;
}) {
  const { buffers, put, remove } = useEditBuffers();
  const filename = path.join('/');
  const key = JSON.stringify([repositoryId, branch, filename]);
  const buffer = buffers[key];
  const [opened, setOpened] = useState<OpenDraft | null>(null);
  const [error, setError] = useState('');
  const [readOnly, setReadOnly] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    workspaceRequest({ action: 'open_draft', repositoryId, branch, path, commit }, controller.signal)
      .then(result => { if (!controller.signal.aborted) setOpened(result); })
      .catch(error => { if (!controller.signal.aborted) setError(workspaceError(error)); });
    return () => controller.abort();
  }, [repositoryId, branch, path, commit, reload]);

  if (!opened) return error
    ? <p role="alert">{error}</p>
    : <p role="status">Loading source…</p>;
  const { current, draft } = opened;
  const baseline = draft?.proposedSource ?? current.source;

  function change(source: string) {
    if (readOnly || saving) return;
    if (source === baseline && (!buffer || buffer.revision === (draft?.revision ?? null))) {
      remove(key);
      return;
    }
    put(key, { source, commit: buffer?.commit ?? current.commit, revision: buffer ? buffer.revision : draft?.revision ?? null });
  }

  async function save(edit: EditBuffer) {
    setSaving(true);
    setError('');
    try {
      const result = await workspaceRequest({
        action: 'save_draft', repositoryId, branch, path, commit: edit.revision ? current.commit : edit.commit,
        source: edit.source, revision: edit.revision,
      });
      setOpened({ current, draft: result.draft });
      remove(key, edit);
      onSaved?.();
    } catch (error) {
      setError(workspaceError(error));
    } finally {
      setSaving(false);
    }
  }

  function reloadDraft() {
    if (buffer && !window.confirm('Discard unsaved edits to this file and reopen the saved draft?')) return;
    remove(key);
    setError('');
    setOpened(null);
    setReload(value => value + 1);
  }

  return (
    <>
      <div className="workspace-actions editor-file-toolbar">
        <strong title={filename}>{filename}</strong>
        <button type="button" disabled={saving} onClick={() => setReadOnly(value => !value)}>
          {readOnly ? 'Enable editing' : 'Read-only mode'}
        </button>
        <button type="button" disabled={saving || !buffer} onClick={() => { if (buffer) void save(buffer); }}>Save draft</button>
        <button type="button" disabled={saving} onClick={reloadDraft}>Reopen saved draft</button>
        <span role="status">{saving ? 'Saving draft…' : buffer ? 'Unsaved changes' : draft ? 'Draft saved' : 'GitHub source'}</span>
      </div>
      {draft && draft.originalBlob !== current.blob &&
        <p role="alert">The GitHub file changed since this draft began. The original version is preserved for review.</p>}
      {error && <p className="workspace-alert" role="alert">{error}</p>}
      <Suspense fallback={<p role="status">Loading editor…</p>}>
        <MonacoSource path={filename} source={buffer?.source ?? baseline} readOnly={readOnly || saving} onChange={change} />
      </Suspense>
    </>
  );
}
