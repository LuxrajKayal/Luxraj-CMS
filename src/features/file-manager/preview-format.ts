export type Preview = { type: 'image' | 'audio' | 'video' | 'pdf' | 'docx' | 'text'; mime?: string; text?: string };

export function previewFormat(bytes: Uint8Array, path: string, hint = ''): Preview | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));
  if (ascii(0, 5) === '%PDF-') return { type: 'pdf' };
  if (ascii(0, 2) === 'PK') return /\.docx$/i.test(path) || hint.includes('wordprocessingml')
    ? { type: 'docx' } : null;
  if (bytes[0] === 0x89 && ascii(1, 8) === 'PNG\r\n\x1a\n') return { type: 'image', mime: 'image/png' };
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { type: 'image', mime: 'image/jpeg' };
  if (/^GIF8[79]a$/.test(ascii(0, 6))) return { type: 'image', mime: 'image/gif' };
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return { type: 'image', mime: 'image/webp' };
  if (ascii(0, 2) === 'BM') return { type: 'image', mime: 'image/bmp' };
  if (ascii(4, 8) === 'ftyp') {
    if (['avif', 'avis'].includes(ascii(8, 12))) return { type: 'image', mime: 'image/avif' };
    return hint.startsWith('audio/') || /\.m4a$/i.test(path) ? { type: 'audio', mime: 'audio/mp4' } : { type: 'video', mime: 'video/mp4' };
  }
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WAVE') return { type: 'audio', mime: 'audio/wav' };
  if (ascii(0, 3) === 'ID3' || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)) return { type: 'audio', mime: 'audio/mpeg' };
  if (ascii(0, 4) === 'fLaC') return { type: 'audio', mime: 'audio/flac' };
  if (ascii(0, 4) === 'OggS') return hint.startsWith('video/') || /\.ogv$/i.test(path)
    ? { type: 'video', mime: 'video/ogg' } : { type: 'audio', mime: 'audio/ogg' };
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return hint.startsWith('audio/') ? { type: 'audio', mime: 'audio/webm' } : { type: 'video', mime: 'video/webm' };
  }
  if (/\.(?:html?|xhtml|svgz?|doc|odt|xls[xm]?|ppt[xm]?|zip|7z|rar|woff2?|ttf|otf|exe|dll)$/i.test(path) ||
      /^(?:text\/html|image\/svg\+xml)$/i.test(hint) || bytes.length > 262144) return null;
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    if (/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(text) || /<\s*(?:!doctype\s+html|html\b|svg\b|script\b|iframe\b|object\b)/i.test(text)) return null;
    return { type: 'text', text };
  } catch { return null; }
}
