import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { decodeBytes, encodeBytes, filePath, sha256 } from '../../../supabase/functions/_shared/file-bytes';
import type { WebsiteLaunch } from '../../../supabase/functions/_shared/workspace-contracts';
import type { FileScope } from '../file-manager/FileDestination';
import { useEditBuffers } from '../workspace/EditBuffers';
import { workspaceError, workspaceRequest } from '../workspace/api';
import { controlDocument, downloadDestination, outputBatch, type ExecutionMode, type NativeFileRequest, type GeneratedOutput } from './bridge';
import { RepositoryFilePicker } from './RepositoryFilePicker';

type Output = GeneratedOutput & { id: string; status?: 'saved' | string };

export function ControlRunner({ run, scope, inputs, close }: {
  run: WebsiteLaunch; scope: FileScope; inputs: File[]; close(): void;
}) {
  const [files, setFiles] = useState(inputs);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [pick, setPick] = useState(false);
  const [mode, setMode] = useState<ExecutionMode>('internal');
  const modeRef = useRef<ExecutionMode>('internal');
  const [switching, setSwitching] = useState(false);
  const [nativeRequest, setNativeRequest] = useState<NativeFileRequest | null>(null);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const nativeRequestRef = useRef<NativeFileRequest | null>(null);
  const repositoryInputs = useRef([...run.control.inputs]);
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
        if (data?.type === 'mode-ready' && data.mode === modeRef.current) { setSwitching(false); return; }
        if (modeRef.current !== 'internal') return;
        if (data?.type === 'pick') setPick(true);
        if (data?.type === 'native-pick' && Number.isSafeInteger(data.id) && typeof data.multiple === 'boolean') {
          const next = { id: data.id, multiple: data.multiple, accept: typeof data.accept === 'string' ? data.accept : '' };
          nativeRequestRef.current = next;
          setNativeRequest(next);
          setSelectedPaths([]);
          setPick(false);
          setError('');
          return;
        }
        if (data?.type === 'bridge-error') { setError(String(data.message)); return; }
        if (data?.type !== 'outputs' && data?.type !== 'download') return;
        try {
          const batch = data.type === 'download'
            ? outputBatch([data.output], []).map(item => ({
                ...item, destination: downloadDestination(item.name, control.destinations, repositoryInputs.current),
              }))
            : outputBatch(data.outputs, control.destinations);
          setOutputs(current => [...current, ...batch.map(item => ({ id: crypto.randomUUID(), ...item }))]);
          setError('');
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : 'The application sent invalid output.');
        }
      };
      event.source!.postMessage({ type: 'luxraj:attach', nonce }, { targetOrigin: '*', transfer: [channel.port2] });
      channel.port1.postMessage({ type: 'files', files: modeRef.current === 'internal' ? currentFiles.current : [] });
      setConnected(true);
    }
    window.addEventListener('message', attach);
    iframe.srcdoc = controlDocument(source, nonce, modeRef.current);
    return () => {
      operations.abort();
      port.current?.close();
      port.current = undefined;
      window.removeEventListener('message', attach);
    };
  }, [control.destinations, source]);

  useEffect(() => { port.current?.postMessage({ type: 'files', files: mode === 'internal' ? files : [] }); }, [files, mode]);

  function cancelNative() {
    if (nativeRequestRef.current) port.current?.postMessage({ type: 'native-cancel', id: nativeRequestRef.current.id });
    nativeRequestRef.current = null;
    setNativeRequest(null);
    setSelectedPaths([]);
  }

  function changeMode(next: ExecutionMode) {
    if (next === modeRef.current || reading || saving || !connected || switching) return;
    cancelNative();
    setPick(false);
    setError('');
    modeRef.current = next;
    setSwitching(true);
    setMode(next);
    port.current?.postMessage({ type: 'mode', mode: next });
  }

  async function deliverNative(paths: string[]) {
    const active = nativeRequestRef.current;
    if (!active || !paths.length || reading || modeRef.current !== 'internal') return;
    const signal = request.current?.signal;
    setReading(true);
    setError('');
    try {
      const selected: File[] = [];
      for (const path of paths) {
        const file = await controlInput(run, scope, path, signal);
        selected.push(new File([file], path.split('/').at(-1)!, { type: file.type, lastModified: file.lastModified }));
      }
      if (signal?.aborted || nativeRequestRef.current !== active || modeRef.current !== 'internal') return;
      repositoryInputs.current = [...new Set([...repositoryInputs.current, ...paths])];
      port.current?.postMessage({ type: 'native-files', id: active.id, files: selected });
      nativeRequestRef.current = null;
      setNativeRequest(null);
      setSelectedPaths([]);
    } catch (failure) {
      if (!signal?.aborted) setError(workspaceError(failure));
    } finally {
      if (!signal?.aborted) setReading(false);
    }
  }

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
      if (!signal?.aborted) {
        repositoryInputs.current = [...new Set([...repositoryInputs.current, path])];
        setFiles(current => [...current, file]);
      }
    } catch (failure) {
      if (!signal?.aborted) setError(path + '. ' + workspaceError(failure));
    } finally {
      if (!signal?.aborted) setReading(false);
    }
  }

  async function saveDrafts() {
    if (saving || !unsaved || modeRef.current !== 'internal') return;
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
    <fieldset className="workspace-actions website-mode" disabled={!connected || switching || reading || saving}>
      <legend>Execution mode</legend>
      <label><input type="radio" name="website-mode" checked={mode === 'internal'} onChange={() => changeMode('internal')} /> Internal Mode</label>
      <label><input type="radio" name="website-mode" checked={mode === 'local'} onChange={() => changeMode('local')} /> Local Mode</label>
    </fieldset>
    <p>{mode === 'internal' ? 'Application file selection opens the repository picker; supported downloads become CMS outputs.' : 'Application file selection and downloads use your browser. Existing CMS outputs remain available when you return to Internal Mode.'}</p>
    {mode === 'internal' && <div className="workspace-actions">
      <label>Add local files <input type="file" multiple onChange={event => {
        const selected = Array.from(event.target.files ?? []);
        if (selected.length) setFiles(current => [...current, ...selected]);
        event.target.value = '';
      }} /></label>
      <button type="button" aria-expanded={pick} onClick={() => setPick(!pick)}>Add repository files</button>
    </div>}
    {mode === 'internal' && pick && !nativeRequest && <RepositoryFilePicker scope={scope} label="Additional repository inputs" onPick={path => void addRepositoryFile(path)} disabled={reading} />}
    {mode === 'internal' && nativeRequest && <section aria-label="Application repository file selection">
      {nativeRequest.accept && <p>Application requests: {nativeRequest.accept} (file type hint)</p>}
      <RepositoryFilePicker key={nativeRequest.id} scope={scope} label="Choose repository file for application" disabled={reading}
        onPick={path => {
          if (nativeRequest.multiple) setSelectedPaths(current => current.includes(path) ? current : [...current, path]);
          else void deliverNative([path]);
        }} />
      {nativeRequest.multiple && <>
        <ul>{selectedPaths.map(path => <li key={path}>{path} <button type="button" disabled={reading} onClick={() => setSelectedPaths(current => current.filter(value => value !== path))}>Remove</button></li>)}</ul>
        <button type="button" disabled={reading || !selectedPaths.length} onClick={() => void deliverNative(selectedPaths)}>Use selected files</button>
      </>}
      <button type="button" onClick={cancelNative} disabled={reading}>Cancel file selection</button>
    </section>}
    {reading && <p role="status">Reading repository file…</p>}
    {mode === 'internal' && <p>{files.length} {files.length === 1 ? 'file' : 'files'} supplied through the explicit file bridge.</p>}
    {error && <p role="alert">{error}</p>}
    {!connected && <p role="status">Starting the application file bridge…</p>}
    {switching && <p role="status">Switching execution mode…</p>}
    <iframe ref={frame} title={control.name} referrerPolicy="no-referrer"
      sandbox="allow-scripts allow-forms allow-downloads" />
    {mode === 'internal' && !!outputs.length && <section className="website-outputs">
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
