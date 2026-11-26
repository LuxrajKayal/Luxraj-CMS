import { useEffect, useId, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { maxFileBytes, type FileInspection, type FilePayload, type ProfilePictureLocation, type StoredFile } from '../../../supabase/functions/_shared/workspace-contracts';
import { decodeBytes, encodeBytes, filePath, sha256 } from '../../../supabase/functions/_shared/file-bytes';
import { ModuleTopbar } from '../../shared/ui/ModuleChrome';
import { useEditBuffers } from '../workspace/EditBuffers';
import { memberRequest, workspaceError, workspaceRequest } from '../workspace/api';
import { useWorkspace } from '../workspace/WorkspaceLayout';
import { FileDraftComparison, CompareFiles } from './FileComparison';
import { FileWorkspacePicker, FolderPicker, useFileDirectory, type FileScope } from './FileDestination';
import { verifyPublicPicture } from './profile-proof';
import {memberFile} from '../people/memberFiles';
import type {MemberOutput} from '../../../supabase/functions/_shared/member-contracts';

type SubmissionImport={submissionId:string;fileId:string;taskId:string;output:MemberOutput};
type Item = { id: number; file: File; name: string; submission?:SubmissionImport; preview?: { inspected: FileInspection; proposed: FilePayload }; error?: string };

function Manager({ scope, profile, onBusy, submissionId, fileId, onImported }: { scope: FileScope; profile?: ProfilePictureLocation; onBusy(value: boolean): void;submissionId?:string;fileId?:string;onImported():void }) {
  const [folder, setFolder] = useState(() => profile?.folder.split('/') ?? []);
  const [items, setItems] = useState<Item[]>([]);
  const [drafts, setDrafts] = useState<StoredFile[]>([]);
  const [current, setCurrent] = useState<StoredFile | null>(null);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [verified, setVerified] = useState('');
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const sequence = useRef(0);
  const request = useRef<AbortController | null>(null);
  const existingNames = useId();
  const { directory, error: directoryError } = useFileDirectory(scope, folder, version);
  const { buffers } = useEditBuffers();
  const { repositoryId, branch } = scope;
  const active = items.find(item => item.id === previewId);

  useEffect(() => {
    const controller = new AbortController();
    workspaceRequest({ action: 'file_drafts', repositoryId, branch }, controller.signal)
      .then(data => { if (!controller.signal.aborted) setDrafts(data.drafts); })
      .catch(error => { if (!controller.signal.aborted) setError(workspaceError(error)); });
    return () => controller.abort();
  }, [repositoryId, branch, version]);
  useEffect(() => () => { request.current?.abort(); onBusy(false); }, [onBusy]);

  useEffect(()=>{
    if(profile||!submissionId||!fileId)return;
    const controller=new AbortController();
    memberRequest({action:'people_submission_file',submissionId,fileId},controller.signal).then(async r=>{
      const blob=await memberFile(r.file);
      if(!controller.signal.aborted)setItems(items=>items.some(x=>x.submission?.submissionId===submissionId&&x.submission.fileId===fileId)?items:[...items,{id:++sequence.current,file:blob,name:blob.name,submission:{submissionId,fileId,taskId:r.taskId,output:r.file}}]);
    }).catch(f=>{if(!controller.signal.aborted)setError(workspaceError(f));});
    return()=>controller.abort();
  },[profile,submissionId,fileId]);
  function patch(id: number, changes: Partial<Item>) {
    setItems(list => list.map(item => item.id === id ? { ...item, ...changes } : item));
  }

  async function run(label: string, operation: (signal: AbortSignal) => Promise<void>) {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(label);
    onBusy(true);
    setError('');
    setStatus('');
    try { await operation(controller.signal); }
    catch (error) { if (!controller.signal.aborted) setError(workspaceError(error)); }
    finally {
      request.current = null;
      if (!controller.signal.aborted) { setBusy(''); onBusy(false); }
    }
  }

  function inspect(item: Item) {
    if (!directory) return;
    const path = [...folder, item.name];
    patch(item.id, { preview: undefined, error: undefined });
    setCurrent(null);
    setPreviewId(item.id);
    void run('Inspecting ' + item.name + '…', async signal => {
      if (!filePath(path)) { patch(item.id, { error: 'Enter a valid destination filename.' }); return; }
      if (item.file.size > maxFileBytes) { patch(item.id, { error: 'This file exceeds the 8 MiB upload limit.' }); return; }
      const sameName = items.some(other => other.id !== item.id &&
        other.name.normalize('NFC').toLowerCase() === item.name.normalize('NFC').toLowerCase());
      if (sameName) { patch(item.id, { error: 'Choose a different name for each upload.' }); return; }
      const bytes = item.submission ? decodeBytes(item.submission.output.contents!) : new Uint8Array(await item.file.arrayBuffer());
      const proposed = { size: bytes.length, mime: item.file.type, sha256: await sha256(bytes), contents: encodeBytes(bytes) };
      const inspected = await workspaceRequest({ action: 'file_inspect', ...scope, path, commit: directory.commit }, signal);
      if (!signal.aborted) patch(item.id, { preview: { inspected, proposed } });
    });
  }

  function save(selected: Item[]) {
    void run('Saving inspected drafts…', async signal => {
      let saved = 0;
      for (const item of selected) {
        if (!item.preview || signal.aborted) continue;
        const path = [...folder, item.name];
        const { inspected, proposed } = item.preview;
        try {
          if (buffers[JSON.stringify([repositoryId, branch, path.join('/')])]) {
            patch(item.id, { error: 'This path has unsaved Code Editor edits. Resolve them before staging the file.' });
            continue;
          }
          const result = await workspaceRequest({
            action: profile ? 'profile_picture_stage' : 'file_save', ...scope, path, commit: inspected.commit,
            originalBlob: inspected.original?.blob ?? null, size: proposed.size, mime: proposed.mime,
            sha256: proposed.sha256!, contents: proposed.contents!,
            ...(item.submission?{origin:'member_submission' as const,submissionId:item.submission.submissionId,submissionFileId:item.submission.fileId}:{}),
          }, signal);
          if (signal.aborted) return;
          setDrafts(previous => [...previous, result.draft]);
          setItems(previous => previous.filter(candidate => candidate.id !== item.id));
          if(item.submission)onImported();
          saved += 1;
        } catch (error) {
          if (!signal.aborted) patch(item.id, { error: workspaceError(error) });
        }
      }
      if (!signal.aborted) setStatus(saved + ' of ' + selected.length + ' file drafts saved. Review saved files in Source Control.');
    });
  }

  function verify(item: StoredFile) {
    setVerified('');
    void run('Verifying the public picture…', async signal => {
      const proof = await workspaceRequest({ action: 'verify_profile_picture', ...scope, path: item.path.split('/'), revision: item.revision }, signal);
      if (!await verifyPublicPicture(proof.url, proof.sha256, signal)) {
        setError('The public URL did not serve the committed WebP bytes. Check publishing and the website’s cross-origin access.');
        return;
      }
      if (!signal.aborted) setVerified(proof.url);
    });
  }

  const visibleDrafts = drafts.filter(item => !profile ||
    (item.path.split('/').slice(0, -1).join('/') === profile.folder && item.mime === 'image/webp'));
  const inspected = items.filter(item => !!item.preview);
  return <div className="module-body module-scroll file-manager">
    {profile && <p>Staging WebP pictures for <code>{profile.folder}</code> · <Link to="/settings/profile-picture-location">Edit location</Link></p>}
    {!profile && <FolderPicker folder={folder} directory={directory} disabled={!!busy} choose={path => {
      setFolder(path); setPreviewId(null); setItems(list => list.map(item => ({ ...item, preview: undefined, error: undefined })));
    }} />}
    {directoryError && <p role="alert">{directoryError}</p>}
    <div className="workspace-actions">
      <label>Upload files <input type="file" multiple disabled={!!busy || !directory} onChange={event => {
        const picked = Array.from(event.target.files ?? []).map(file => ({ id: ++sequence.current, file, name: file.name }));
        setItems(previous => [...previous, ...picked]);
        event.target.value = '';
      }} /></label>
      <button type="button" disabled={!!busy} onClick={() => {
        setItems(list => list.map(item => ({ ...item, preview: undefined })));
        setVersion(value => value + 1);
      }}>Refresh destination and drafts</button>
      <Link to="/source-control">Review in Source Control</Link>
      <Link to="/settings/drafts">Manage saved drafts</Link>
    </div>
    <datalist id={existingNames}>
      {directory?.entries.filter(item => item.kind === 'file').map(item => <option key={item.name} value={item.name} />)}
    </datalist>
    {items.length > 0 && <section aria-label="Upload queue">
      <h2>Uploads</h2>
      <ul className="file-queue">{items.map(item => <li key={item.id}>
        <span>{item.file.name} · {item.file.size.toLocaleString()} bytes</span>
        {item.submission&&<span>Submitted draft · {item.submission.taskId}</span>}
        <label>Destination filename <input value={item.name} list={existingNames} disabled={!!busy}
          onChange={event => patch(item.id, { name: event.target.value, preview: undefined, error: undefined })} /></label>
        <div className="workspace-actions">
          <button type="button" disabled={!!busy || !directory} onClick={() => inspect(item)}>Inspect {item.name}</button>
          {item.preview && <button type="button" disabled={!!busy} onClick={() => save([item])}>Save Draft</button>}
          <button type="button" disabled={!!busy} onClick={() => {setItems(list => list.filter(entry => entry.id !== item.id));if(item.submission)onImported();}}>Remove upload</button>
        </div>
        {item.preview && <span>{item.preview.inspected.original ? 'Replacement' : 'New file'} inspected</span>}
        {item.error && <p role="alert">{item.error}</p>}
      </li>)}</ul>
      {inspected.length > 1 && <button type="button" disabled={!!busy} onClick={() => save(inspected)}>Save all inspected drafts</button>}
    </section>}
    {active?.preview && <CompareFiles path={[...folder, active.name].join('/')} original={active.preview.inspected.original} proposed={active.preview.proposed} />}
    {busy && <p role="status">{busy}</p>}
    {status && <p role="status">{status}</p>}
    {error && <p role="alert">{error}</p>}
    <section aria-label="Saved file drafts">
      <h2>Saved file drafts</h2>
      {!visibleDrafts.length && <p>No saved file drafts for this selection.</p>}
      <ul className="file-queue">{visibleDrafts.map(item => <li key={item.revision}>
        <strong>{item.path}</strong>
        <span>{item.originalBlob ? 'Replacement' : 'New file'} · {item.committedSha ? 'Committed ' + item.committedSha.slice(0, 12) : 'Pending review'}</span>
        <div className="workspace-actions">
          <button type="button" onClick={() => { setPreviewId(null); setCurrent(item); setVerified(''); }}>Open {item.path}</button>
          {profile && item.committedSha && <button type="button" disabled={!!busy} onClick={() => verify(item)}>Verify public URL</button>}
        </div>
      </li>)}</ul>
      {verified && <p role="status">Verified public picture <a href={verified} target="_blank" rel="noreferrer">{verified}</a></p>}
      {current && <FileDraftComparison {...scope} path={current.path} revision={current.revision} />}
    </section>
  </div>;
}

export default function FileManagerPage() {
  const { workspace: { selection }, saving } = useWorkspace();
  const [parameters,setParameters] = useSearchParams();
  const submissionId=parameters.get('submission')??undefined,fileId=parameters.get('file')??undefined;
  function clearImported(){const next=new URLSearchParams(parameters);next.delete('submission');next.delete('file');next.delete('prepare');setParameters(next,{replace:true});}
  const profileMode = parameters.get('profile') === '1';
  const [location, setLocation] = useState<ProfilePictureLocation | null | undefined>(undefined);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!profileMode) return;
    const controller = new AbortController();
    workspaceRequest({ action: 'profile_picture_location' }, controller.signal)
      .then(result => { if (!controller.signal.aborted) setLocation(result.location); })
      .catch(error => { if (!controller.signal.aborted) setError(workspaceError(error)); });
    return () => controller.abort();
  }, [profileMode]);
  const allowed = !profileMode || (location && location.repositoryId === selection?.repositoryId && location.branch === selection.branch);
  const canOpen = !saving && allowed && !!selection?.branch;
  return <div className="module-stack">
    <ModuleTopbar title="File Manager"><FileWorkspacePicker disabled={busy} /></ModuleTopbar>
    {error && <p role="alert">{error}</p>}
    {profileMode && !allowed && <div className="module-body">
      {location ? <><p>Select the configured repository and branch to stage a profile picture.</p>
        <SelectProfileWorkspace location={location} onBusy={setBusy} /></>
        : <p><Link to="/settings/profile-picture-location">Configure the author picture location</Link></p>}
    </div>}
    {!profileMode && !selection?.branch && <p className="module-body">Select a repository and branch to manage files.</p>}
    {canOpen && <Manager key={JSON.stringify([selection.repositoryId, selection.branch, profileMode])}
      scope={{ repositoryId: selection.repositoryId, branch: selection.branch! }} profile={profileMode ? location ?? undefined : undefined}
      onBusy={setBusy} submissionId={submissionId} fileId={fileId} onImported={clearImported} />}
  </div>;
}

function SelectProfileWorkspace({ location, onBusy }: { location: ProfilePictureLocation; onBusy(value: boolean): void }) {
  const { select } = useWorkspace();
  return <button type="button" onClick={() => {
    onBusy(true);
    void select(location.repositoryId, location.branch).finally(() => onBusy(false));
  }}>Open configured picture destination</button>;
}
