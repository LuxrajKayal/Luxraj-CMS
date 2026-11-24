import { filePath } from '../../../supabase/functions/_shared/file-bytes';
import { maxFileBytes } from '../../../supabase/functions/_shared/workspace-contracts';

export type GeneratedOutput = { name: string; blob: Blob; destination: string };

// Runs inside the opaque-origin document. Keep this function independent of the CMS bundle.
function bootstrap(nonce: string) {
  let port: MessagePort;
  let files: File[] = [];
  const listeners = new Set<(current: File[]) => void>();
  let connected!: () => void;
  const ready = new Promise<void>(resolve => { connected = resolve; });
  Object.defineProperty(window, 'LuxrajCMS', { value: Object.freeze({
    ready,
    async getFiles() { await ready; return [...files]; },
    onFiles(listener: (current: File[]) => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async requestRepositoryFiles() {
      await ready;
      port.postMessage({ type: 'pick' });
    },
    async emitOutputs(outputs: unknown[]) {
      await ready;
      port.postMessage({ type: 'outputs', outputs });
    },
  }) });
  function attach(event: MessageEvent) {
    if (event.source !== parent || event.data?.type !== 'luxraj:attach' || event.data.nonce !== nonce || event.ports.length !== 1) return;
    window.removeEventListener('message', attach);
    port = event.ports[0];
    port.onmessage = event => {
      if (event.data?.type !== 'files' || !Array.isArray(event.data.files)) return;
      files = event.data.files;
      connected();
      for (const listener of listeners) listener([...files]);
    };
  }
  window.addEventListener('message', attach);
  parent.postMessage({ type: 'luxraj:ready', nonce }, '*');
}

export function controlDocument(source: string, nonce: string) {
  // Insert before application scripts, while keeping the application's doctype and browser mode.
  const preamble = /^(?:\s|<!--[\s\S]*?-->)*(?:<!doctype(?:\s[^>]*|)>)/i.exec(source)?.[0].length ?? 0;
  const script = '<script>(' + bootstrap.toString() + ')(' + JSON.stringify(nonce) + ')</script>';
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
