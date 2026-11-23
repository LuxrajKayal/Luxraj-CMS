export function encodeBytes(bytes: Uint8Array) {
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += 8192) parts.push(String.fromCharCode(...bytes.subarray(i, i + 8192)));
  return btoa(parts.join(''));
}

export function decodeBytes(contents: string) {
  return Uint8Array.from(atob(contents), item => item.charCodeAt(0));
}

export async function sha256(bytes: Uint8Array<ArrayBuffer>) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)),
    value => value.toString(16).padStart(2, '0')).join('');
}

export async function gitBlobSha(bytes: Uint8Array<ArrayBuffer>) {
  const header = new TextEncoder().encode('blob ' + bytes.length + '\0');
  const payload = new Uint8Array(header.length + bytes.length);
  payload.set(header);
  payload.set(bytes, header.length);
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-1', payload)),
    value => value.toString(16).padStart(2, '0')).join('');
}

export function filePath(path: unknown): path is string[] {
  return Array.isArray(path) && path.length <= 64 && path.every(segment =>
    typeof segment === 'string' && segment.length > 0 && segment !== '.' && segment !== '..' &&
    segment.toLowerCase() !== '.git' && !/[\x00-\x1f\x7f/\\]/.test(segment) &&
    new TextEncoder().encode(segment).length <= 255) && path.join('/').length <= 1024;
}

export function webp(bytes: Uint8Array) {
  if (bytes.length < 20) return false;
  const tag = (i: number) => String.fromCharCode(...bytes.subarray(i, i + 4));
  return tag(0) === 'RIFF' && tag(8) === 'WEBP' && ['VP8 ', 'VP8L', 'VP8X'].includes(tag(12)) &&
    new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4, true) + 8 === bytes.length;
}
