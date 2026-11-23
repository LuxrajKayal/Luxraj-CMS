import { sha256, webp } from '../../../supabase/functions/_shared/file-bytes';

export async function verifyPublicPicture(url: string, expected: string, signal: AbortSignal, request = fetch) {
  const target = new URL(url);
  if (target.protocol !== 'https:' || target.username || target.password) return false;
  const response = await request(target, {
    credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer', cache: 'no-store',
    signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
  }).catch(() => null);
  if (!response?.ok || !response.body || !/^image\/webp(?:\s*;|$)/i.test(response.headers.get('content-type') ?? '')) return false;
  const result = new Uint8Array(150000);
  const reader = response.body.getReader();
  let size = 0;
  try {
    for (;;) {
      const next = await reader.read();
      if (next.done) break;
      if (size + next.value.length > result.length) return false;
      result.set(next.value, size);
      size += next.value.length;
    }
  } catch { return false; }
  finally { await reader.cancel().catch(() => {}); }
  const bytes = result.subarray(0, size);
  if (size < 15000 || !webp(bytes) || await sha256(bytes) !== expected) return false;
  if (typeof createImageBitmap === 'function') {
    try {
      const picture = await createImageBitmap(new Blob([bytes], { type: 'image/webp' }));
      picture.close();
    } catch { return false; }
  }
  return !signal.aborted;
}
