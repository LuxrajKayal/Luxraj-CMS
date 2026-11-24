import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { decodeBytes, encodeBytes, filePath, sha256 } from '../../../supabase/functions/_shared/file-bytes';
import type { WebsiteLaunch } from '../../../supabase/functions/_shared/workspace-contracts';
import type { FileScope } from '../file-manager/FileDestination';
import { useEditBuffers } from '../workspace/EditBuffers';
import { workspaceError, workspaceRequest } from '../workspace/api';
import { controlDocument, outputBatch, type GeneratedOutput } from './bridge';
import { RepositoryFilePicker } from './RepositoryFilePicker';

type Output = GeneratedOutput & { id: string; status?: 'saved' | string };

export function ControlRunner({ run, scope, inputs, close }: {
  run: WebsiteLaunch; scope: FileScope; inputs: File[]; close(): void;
}) {
  const [files, setFiles] = useState(inputs);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [pick, setPick] = useState(false);
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const frame = useRef<HTMLIFrameElement>(null);
  const port = useRef<MessagePort>(undefined);
  const request = useRef<AbortController>(undefined);
  const currentFiles = useRef(files);
  currentFiles.current = files;
  const { buffers } = useEditBuffers();
  const currentBuffers = useRef(buffers);
  currentBuffers.current = buffers;
  const { control, source, commit } = run;

  useLayoutEffect(() => {
    const iframe = frame.current!;
    const nonce = crypto.randomUUID();
    const operations = new AbortController();
    request.current = operations;
    function attach(event: MessageEvent) {
      if (event.origin !== 'null' || event.source !== iframe.contentWindow ||
          event.data?.type !== 'luxraj:ready' || event.data.nonce !== nonce || port.current) return;
      const channel = new MessageChannel();
      port.current = channel.port1;
      channel.port1.onmessage = ({ data }) => {
        if (data?.type === 'pick') setPick(true);
        if (data?.type !== 'outputs') return;
        try {
          const batch = outputBatch(data.outputs, control.destinations);
          setOutputs(current => [...current, ...batch.map(item => ({ id: crypto.randomUUID(), ...item }))]);
          setError('');
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : 'The application sent invalid output.');
        }
      };
      event.source!.postMessage({ type: 'luxraj:attach', nonce }, { targetOrigin: '*', transfer: [channel.port2] });
      channel.port1.postMessage({ type: 'files', files: currentFiles.current });
      setConnected(true);
    }
    window.addEventListener('message', attach);
    iframe.srcdoc = controlDocument(source, nonce);
    return () => {
      operations.abort();
      port.current?.close();
      port.current = undefined;
      window.removeEventListener('message', attach);
    };
  }, [control.destinations, source]);

  useEffect(() => { port.current?.postMessage({ type: 'files', files }); }, [files]);

  const unsaved = outputs.some(output => output.status !== 'saved');
  useEffect(() => {
    if (!unsaved) return;
    function leave(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = '';
    }
    function navigation(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>('a[href^="#/"]');
      if (anchor && anchor.hash !== window.location.hash && (saving || !window.confirm('Leave this control and discard its unsaved outputs?'))) {
        event.preventDefault();
      }
    }
    window.addEventListener('beforeunload', leave);
    document.addEventListener('click', navigation, true);
    return () => {
      window.removeEventListener('beforeunload', leave);
      document.removeEventListener('click', navigation, true);
    };
  }, [unsaved, saving]);

  async function addRepositoryFile(path: string) {
    if (reading) return;
    const signal = request.current?.signal;
    setReading(true);
    setError('');
    try {
      const file = await controlInput(run, scope, path, signal);
      if (!signal?.aborted) setFiles(current => [...current, file]);
    } catch (failure) {
      if (!signal?.aborted) setError(path + '. ' + workspaceError(failure));
    } finally {
      if (!signal?.aborted) setReading(false);
    }
  }

  async function saveDrafts() {
    if (saving || !unsaved) return;
    const pending = outputs.filter(output => output.status !== 'saved');
    const normalized = pending.map(output => output.destination.normalize('NFC').toLowerCase());
    if (new Set(normalized).size !== pending.length ||
        pending.some(output => !output.destination || !filePath(output.destination.split('/')))) {
      setError('Enter a valid, different repository destination for each output.');
      return;
    }
    setSaving(true);
    setError('');
    const signal = request.current?.signal;
    for (const output of pending) {
      if (signal?.aborted) break;
      let status = 'saved';
      try {
        const path = output.destination.split('/');
        const bytes = new Uint8Array(await output.blob.arrayBuffer());
        const { original, commit: inspectedCommit } = await workspaceRequest({ action: 'file_inspect', ...scope, path, commit }, signal);
        const digest = await sha256(bytes);
        if (currentBuffers.current[JSON.stringify([scope.repositoryId, scope.branch, output.destination])]) {
          status = 'Save or discard the unsaved Code Editor buffer for this path before staging this output.';
        } else {
          await workspaceRequest({ action: 'file_save', ...scope, path, commit: inspectedCommit, originalBlob: original?.blob ?? null,
            contents: encodeBytes(bytes), size: bytes.length, sha256: digest, mime: output.blob.type, origin: 'website_control' }, signal);
        }
      } catch (failure) {
        status = workspaceError(failure);
      }
      if (!signal?.aborted) setOutputs(current => current.map(item => item.id === output.id ? { ...item, status } : item));
    }
    if (!signal?.aborted) setSaving(false);
  }

  return <section className="website-runner" aria-label={'Running ' + control.name}>
    <header className="workspace-actions">
      <h2>{control.name}</h2>
      <button type="button" disabled={saving} onClick={() => {
        if (!unsaved || window.confirm('Close this control and discard its unsaved outputs?')) close();
      }}>Close Application</button>
    </header>
    <div className="workspace-actions">
      <label>Add local files <input type="file" multiple onChange={event => {
        const selected = Array.from(event.target.files ?? []);
        if (selected.length) setFiles(current => [...current, ...selected]);
        event.target.value = '';
      }} /></label>
      <button type="button" aria-expanded={pick} onClick={() => setPick(!pick)}>Add repository files</button>
    </div>
    {pick && <RepositoryFilePicker scope={scope} label="Additional repository inputs" onPick={path => void addRepositoryFile(path)} disabled={reading} />}
    {reading && <p role="status">Reading repository file…</p>}
    <p>{files.length} {files.length === 1 ? 'file' : 'files'} supplied to the application.</p>
    {error && <p role="alert">{error}</p>}
    {!connected && <p role="status">Starting the application file bridge…</p>}
    <iframe ref={frame} title={control.name} referrerPolicy="no-referrer"
      sandbox="allow-scripts allow-forms allow-downloads" />
    {!!outputs.length && <section className="website-outputs">
      <h3>Generated outputs</h3>
      <p>Assign a repository-relative path to each output. A new path adds a file. An existing path stages its replacement for review.</p>
      {outputs.map(item => <div className="website-output" key={item.id}>
        <label>Destination for {item.name}
          <input value={item.destination} disabled={saving || item.status === 'saved'} onChange={event => {
            const destination = event.target.value;
            setOutputs(current => current.map(value => value.id === item.id ? { ...value, destination, status: undefined } : value));
          }} />
        </label>
        <small>{item.blob.size.toLocaleString()} bytes</small>
        {item.status === 'saved' ? <span role="status">Draft saved</span> : <button type="button" disabled={saving}
          aria-label={'Discard output ' + item.name} onClick={() => setOutputs(current => current.filter(value => value.id !== item.id))}>Discard</button>}
        {item.status && item.status !== 'saved' && <p role="alert">{item.status}</p>}
      </div>)}
      <div className="workspace-actions">
        <button type="button" disabled={saving || !unsaved} onClick={() => void saveDrafts()}>{saving ? 'Saving drafts…' : 'Save Drafts'}</button>
        {outputs.some(item => item.status === 'saved') && <Link to="/source-control">Review in Source Control</Link>}
      </div>
    </section>}
  </section>;
}

export async function controlInput(run: WebsiteLaunch, scope: FileScope, path: string, signal?: AbortSignal) {
  const { file } = await workspaceRequest({ action: 'website_input', ...scope, id: run.control.id, commit: run.commit, path }, signal);
  if (file.contents === null) throw new Error('website_file_too_large');
  const bytes = decodeBytes(file.contents);
  if (bytes.length !== file.size || await sha256(bytes) !== file.sha256) throw new Error('file_integrity');
  // Keep repository-relative names so equally named files from different folders retain their identity.
  return new File([bytes], path, { type: file.mime });
}
