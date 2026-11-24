import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { AppWindow, FolderOpen, FilePlus, Maximize2, Minimize2, PanelRight, X, File, GitCommit } from 'lucide-react';
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
  const [panelOpen, setPanelOpen] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const localInput = useRef<HTMLInputElement>(null);
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
        if (data?.type === 'pick') { if (!nativeRequestRef.current) { setDestinationId(null); setPick(true); } }
        if (data?.type === 'native-pick' && Number.isSafeInteger(data.id) && typeof data.multiple === 'boolean') {
          const next = { id: data.id, multiple: data.multiple, accept: typeof data.accept === 'string' ? data.accept : '' };
          nativeRequestRef.current = next;
          setNativeRequest(next);
          setPick(false);
          setDestinationId(null);
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
          setPanelOpen(true);
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
  }

  function changeMode(next: ExecutionMode) {
    if (next === modeRef.current || reading || saving || !connected || switching) return;
    cancelNative();
    setPick(false);
    setDestinationId(null);
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

  async function addRepositoryFiles(paths: string[]) {
    if (reading) return;
    const signal = request.current?.signal;
    setReading(true);
    setError('');
    try {
      const selected: File[] = [];
      for (const path of paths) selected.push(await controlInput(run, scope, path, signal));
      if (!signal?.aborted) {
        repositoryInputs.current = [...new Set([...repositoryInputs.current, ...paths])];
        setFiles(current => [...current, ...selected]);
        setPick(false);
      }
    } catch (failure) {
      if (!signal?.aborted) setError(workspaceError(failure));
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

  const destinationOutput = outputs.find(item => item.id === destinationId);
  return <section className={'website-runner' + (maximized ? ' is-maximized' : '')} aria-label={'Running ' + control.name}>
    <header className="website-window-header">
      <AppWindow size={22} /><h2>{control.name}</h2><span className="website-window-spacer" />
      <button type="button" aria-label={maximized ? 'Restore application' : 'Maximize application'} onClick={() => setMaximized(value => !value)}>{maximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
      <button type="button" aria-label="Close Application" disabled={saving} onClick={() => {
        if (!unsaved || window.confirm('Close this control and discard its unsaved outputs?')) close();
      }}><X size={18} /></button>
    </header>
    <div className="website-window-toolbar">
      <fieldset className="website-mode" aria-label="Execution mode" disabled={!connected || switching || reading || saving}>
        <label className={mode === 'internal' ? 'is-active' : ''}><input type="radio" name="website-mode" checked={mode === 'internal'} onChange={() => changeMode('internal')} /> Internal</label>
        <label className={mode === 'local' ? 'is-active' : ''}><input type="radio" name="website-mode" checked={mode === 'local'} onChange={() => changeMode('local')} /> Local</label>
      </fieldset>
      {mode === 'internal' && <>
        <button type="button" disabled={reading || switching} onClick={() => setPick(true)}><FolderOpen size={17} /> Repository files</button>
        <input ref={localInput} type="file" hidden multiple onChange={event => {
          const selected = Array.from(event.target.files ?? []);
          if (selected.length) setFiles(current => [...current, ...selected]);
          event.target.value = '';
        }} />
        <button type="button" disabled={switching} onClick={() => localInput.current?.click()}><FilePlus size={17} /> Local files</button>
        <span className="website-window-spacer" />
        <button type="button" aria-expanded={panelOpen} onClick={() => setPanelOpen(value => !value)}><PanelRight size={17} /> Outputs ({outputs.length})</button>
      </>}
    </div>
    {error && <p className="website-window-error" role="alert">{error}</p>}
    <div className="website-window-body">
      <iframe ref={frame} title={control.name} referrerPolicy="no-referrer" sandbox="allow-scripts allow-forms allow-downloads" />
      {mode === 'internal' && panelOpen && <aside className="website-outputs" aria-label="Generated outputs">
        <header><h3>Generated outputs</h3><button type="button" aria-label="Hide outputs" onClick={() => setPanelOpen(false)}><X size={16} /></button></header>
        {!outputs.length && <p className="website-hint">Generated files will appear here. Choose their destination before saving drafts.</p>}
        <div className="website-output-list">
          {outputs.map(item => <div className="website-output" key={item.id}>
            <div className="website-output-name"><File size={19} /><strong>{item.name}</strong></div>
            <small>{item.blob.size.toLocaleString()} bytes · {item.status === 'saved' ? 'Draft saved' : 'Not staged'}</small>
            <label>Destination for {item.name}
              <input value={item.destination} disabled={saving || item.status === 'saved'} onChange={event => {
                const destination = event.target.value;
                setOutputs(current => current.map(value => value.id === item.id ? { ...value, destination, status: undefined } : value));
              }} />
            </label>
            <div className="website-output-actions">
              <button type="button" disabled={saving || item.status === 'saved'} onClick={() => setDestinationId(item.id)}><FolderOpen size={15} /> Browse</button>
              {item.status === 'saved' ? <span role="status">Draft saved</span> : <button type="button" disabled={saving}
                aria-label={'Discard output ' + item.name} onClick={() => setOutputs(current => current.filter(value => value.id !== item.id))}>Discard</button>}
            </div>
            {item.status && item.status !== 'saved' && <p role="alert">{item.status}</p>}
          </div>)}
        </div>
        <div className="website-output-footer">
          <button type="button" className="website-primary" disabled={saving || !unsaved} onClick={() => void saveDrafts()}>{saving ? 'Saving drafts…' : 'Save Drafts'}</button>
          {outputs.some(item => item.status === 'saved') && <Link to="/source-control"><GitCommit size={16} /> Review in Source Control</Link>}
        </div>
      </aside>}
    </div>
    <footer className="website-window-status" role="status">
      <span><i className={connected ? 'is-ready' : ''} />{switching ? 'Switching execution mode…' : reading ? 'Reading repository files…' : saving ? 'Saving drafts…' : connected ? 'Application running' : 'Starting application…'}</span>
      <span>{mode === 'internal' ? 'Internal · ' + files.length + ' supplied files · ' + outputs.length + ' outputs' : 'Local · browser file operations'}</span>
    </footer>
    {mode === 'internal' && pick && !nativeRequest && <RepositoryFilePicker scope={scope} label="Additional repository inputs" multiple disabled={reading} errorMessage={error} onPick={addRepositoryFiles} onCancel={() => setPick(false)} />}
    {mode === 'internal' && nativeRequest && <RepositoryFilePicker key={nativeRequest.id} scope={scope} label="Choose repository file for application"
      multiple={nativeRequest.multiple} hint={nativeRequest.accept ? 'Application requests: ' + nativeRequest.accept : undefined}
      disabled={reading} errorMessage={error} onPick={deliverNative} onCancel={cancelNative} />}
    {mode === 'internal' && destinationOutput && <RepositoryFilePicker scope={scope} label="Choose output destination"
      destination={destinationOutput.destination} onCancel={() => setDestinationId(null)} onPick={paths => {
        setOutputs(current => current.map(item => item.id === destinationId ? { ...item, destination: paths[0], status: undefined } : item));
        setDestinationId(null);
      }} />}
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
