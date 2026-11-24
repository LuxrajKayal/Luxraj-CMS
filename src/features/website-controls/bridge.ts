import { filePath } from '../../../supabase/functions/_shared/file-bytes';
import { maxFileBytes } from '../../../supabase/functions/_shared/workspace-contracts';

export type ExecutionMode = 'internal' | 'local';
export type NativeFileRequest = { id: number; multiple: boolean; accept: string };

export type GeneratedOutput = { name: string; blob: Blob; destination: string };

// Runs inside the opaque-origin document. Keep this function independent of the CMS bundle.
function bootstrap(nonce: string, mode: ExecutionMode) {
  let nextRequest = 0;
  const pending = new Map<number, HTMLInputElement>();
  const blobUrls = new Map<string, Blob>();
  const nativeObjectURL = URL.createObjectURL;
  const nativeRevokeURL = URL.revokeObjectURL;
  const nativeClick = HTMLElement.prototype.click;
  const nativeShowPicker = HTMLInputElement.prototype.showPicker;
  const nativeFetch = window.fetch.bind(window);
  let port: MessagePort;
  let files: File[] = [];
  const listeners = new Set<(current: File[]) => void>();
  let connected!: () => void;
  const ready = new Promise<void>(resolve => { connected = resolve; });
  // Remember the Blob synchronously: many applications revoke their URL immediately after clicking.
  URL.createObjectURL = function (value: Blob | MediaSource) {
    const url = nativeObjectURL.call(URL, value);
    if (value instanceof Blob) blobUrls.set(url, value);
    return url;
  };
  URL.revokeObjectURL = function (url: string) {
    blobUrls.delete(url);
    nativeRevokeURL.call(URL, url);
  };

  function send(message: unknown) {
    void ready.then(() => { if (mode === 'internal') port.postMessage(message); });
  }
  function pick(input: HTMLInputElement) {
    if (mode !== 'internal' || input.type !== 'file' || input.matches(':disabled') ||
        input.hasAttribute('webkitdirectory')) return false;
    // A single active native picker, with cancellation if another input requests a file.
    pending.clear();
    const id = ++nextRequest;
    pending.set(id, input);
    send({ type: 'native-pick', id, multiple: input.multiple, accept: input.accept });
    return true;
  }
  function capture(anchor: HTMLAnchorElement) {
    if (mode !== 'internal' || !anchor.hasAttribute('download')) return false;
    const url = anchor.href;
    if (!url.startsWith('blob:') && !url.startsWith('data:')) return false;
    const name = anchor.download || 'download';
    const remembered = blobUrls.get(url);
    // Start reading immediately, before the application's revokeObjectURL call.
    const read = remembered ? Promise.resolve(remembered) :
      nativeFetch(url).then(response => {
        if (!response.ok) throw new Error('Cannot read the generated download.');
        return response.blob();
      });
    void read.then(blob => send({ type: 'download', output: { name, data: blob } }))
      .catch(() => send({ type: 'bridge-error', message: 'Could not capture the generated download. Try again or use Local Mode.' }));
    return true;
  }

  // Capture normal user activation and connected programmatic clicks, including label activation.
  window.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target instanceof HTMLInputElement && pick(target)) event.preventDefault();
    else {
      const anchor = target.closest('a[download]');
      if (anchor instanceof HTMLAnchorElement && capture(anchor)) event.preventDefault();
    }
  }, true);
  // Detached elements never bubble to window. Many exporters click an unattached anchor.
  HTMLElement.prototype.click = function () {
    if (!this.isConnected && ((this instanceof HTMLInputElement && pick(this)) ||
        (this instanceof HTMLAnchorElement && capture(this)))) return;
    nativeClick.call(this);
  };
  if (nativeShowPicker) HTMLInputElement.prototype.showPicker = function () {
    if (!pick(this)) nativeShowPicker.call(this);
  };

  Object.defineProperty(window, 'LuxrajCMS', { value: Object.freeze({
    ready,
    async getFiles() { await ready; return mode === 'internal' ? [...files] : []; },
    onFiles(listener: (current: File[]) => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async requestRepositoryFiles() {
      await ready;
      if (mode === 'internal') port.postMessage({ type: 'pick' });
    },
    async emitOutputs(outputs: unknown[]) {
      await ready;
      if (mode !== 'internal') throw new Error('Switch to Internal Mode to send files to the CMS.');
      port.postMessage({ type: 'outputs', outputs });
    },
  }) });
  function attach(event: MessageEvent) {
    if (event.source !== parent || event.data?.type !== 'luxraj:attach' || event.data.nonce !== nonce || event.ports.length !== 1) return;
    window.removeEventListener('message', attach);
    port = event.ports[0];
    port.onmessage = event => {
      const message = event.data;
      if (message?.type === 'mode' && (message.mode === 'local' || message.mode === 'internal')) {
        mode = message.mode;
        pending.clear();
        if (mode === 'local') files = [];
        for (const listener of listeners) listener([...files]);
        port.postMessage({ type: 'mode-ready', mode });
        return;
      }
      if (message?.type === 'native-files') {
        const input = pending.get(message.id);
        if (!input) return;
        pending.delete(message.id);
        if (mode !== 'internal' || !Array.isArray(message.files)) return;
        try {
          const transfer = new DataTransfer();
          for (const file of message.files) transfer.items.add(file);
          input.files = transfer.files;
          input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        } catch {
          send({ type: 'bridge-error', message: 'This browser could not supply the selected files. Use Local Mode or the explicit file bridge.' });
        }
        return;
      }
      if (message?.type === 'native-cancel') { pending.delete(message.id); return; }
      if (message?.type !== 'files' || !Array.isArray(message.files)) return;
      files = mode === 'internal' ? message.files : [];
      connected();
      for (const listener of listeners) listener([...files]);
    };
  }
  window.addEventListener('message', attach);
  parent.postMessage({ type: 'luxraj:ready', nonce }, '*');
}

export function controlDocument(source: string, nonce: string, mode: ExecutionMode = 'internal') {
  // Insert before application scripts, while keeping the application's doctype and browser mode.
  const preamble = /^(?:\s|<!--[\s\S]*?-->)*(?:<!doctype(?:\s[^>]*|)>)/i.exec(source)?.[0].length ?? 0;
  const script = '<script>(' + bootstrap.toString() + ')(' + JSON.stringify(nonce) + ',' + JSON.stringify(mode) + ')</script>';
  return source.slice(0, preamble) + '<base href="about:srcdoc">' + script + source.slice(preamble);
}

export function outputBatch(value: unknown, destinations: string[]): GeneratedOutput[] {
  if (!Array.isArray(value) || !value.length) throw new Error('The application must send at least one output file.');
  return value.map((item, index) => {
    if (!item || typeof item.name !== 'string' || !filePath([item.name])) {
      throw new Error('Each generated file needs a valid filename.');
    }
    const mime = typeof item.type === 'string' && item.type.length <= 128 ? item.type : '';
    const content = item instanceof File ? item : item.data;
    let blob: Blob;
    if (content instanceof Blob) blob = mime && mime !== content.type ? new Blob([content], { type: mime }) : content;
    else if (typeof content === 'string' || content instanceof ArrayBuffer) blob = new Blob([content], { type: mime });
    else if (ArrayBuffer.isView(content) && content.buffer instanceof ArrayBuffer) {
      blob = new Blob([content.buffer.slice(content.byteOffset, content.byteOffset + content.byteLength)], { type: mime });
    } else throw new Error('Use text, a File or Blob, or an array of bytes for each output.');
    if (blob.size > maxFileBytes) throw new Error(item.name + ' exceeds the existing 8 MiB file limit.');
    const suggested = typeof item.path === 'string' && filePath(item.path.split('/')) ? item.path : item.name;
    return { name: item.name, blob, destination: destinations[index] ?? suggested };
  });
}

/** Prefer an explicitly configured matching destination, then the unique repository input of the same name. */
export function downloadDestination(name: string, configured: string[], repositoryInputs: string[]) {
  const matching = (paths: string[]) => [...new Set(paths)].filter(path => path.split('/').at(-1) === name);
  const preset = matching(configured);
  if (preset.length === 1) return preset[0];
  if (configured.length === 1) return configured[0];
  const source = matching(repositoryInputs);
  return source.length === 1 ? source[0] : name;
}
