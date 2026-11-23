const maxExpanded = 12 * 1024 * 1024;

// Check the central directory, then bound actual decompressed bytes before handing the archive to Mammoth.
export async function inspectDocx(bytes: Uint8Array<ArrayBuffer>) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const u16 = (at: number) => view.getUint16(at, true);
  const u32 = (at: number) => view.getUint32(at, true);
  let end = bytes.length - 22;
  while (end >= Math.max(0, bytes.length - 65557) &&
      (u32(end) !== 0x06054b50 || end + 22 + u16(end + 20) !== bytes.length)) end--;
  if (end < Math.max(0, bytes.length - 65557) || u16(end + 4) || u16(end + 6)) throw new Error('Invalid DOCX archive');
  const count = u16(end + 10);
  let central = u32(end + 16);
  if (!count || count > 1024 || count !== u16(end + 8) || central + u32(end + 12) !== end) throw new Error('Invalid DOCX directory');
  const names = new Set<string>();
  let expanded = 0;
  const spans: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    if (central + 46 > end || u32(central) !== 0x02014b50) throw new Error('Invalid DOCX entry');
    const flags = u16(central + 8), method = u16(central + 10);
    const packed = u32(central + 20), size = u32(central + 24);
    const nameLength = u16(central + 28), local = u32(central + 42);
    const nameBytes = bytes.subarray(central + 46, central + 46 + nameLength);
    const name = new TextDecoder('utf-8', { fatal: true }).decode(nameBytes);
    const start = local + 30 + u16(local + 26) + u16(local + 28);
    if (names.has(name) || /(^\/|\\|(?:^|\/)\.\.(?:\/|$))/.test(name) || flags & 1 ||
        ![0, 8].includes(method) || u32(local) !== 0x04034b50 || method !== u16(local + 8) ||
        u16(local + 6) !== flags || nameLength !== u16(local + 26) ||
        !nameBytes.every((byte, index) => byte === bytes[local + 30 + index]) ||
        start + packed > u32(end + 16) || expanded + size > maxExpanded) throw new Error('Unsafe DOCX entry');
    spans.push([local, start + packed]);
    names.add(name);
    if (method === 0) {
      if (size !== packed) throw new Error('Invalid stored DOCX entry');
    } else {
      const content = new Blob([bytes.subarray(start, start + packed)]);
      const reader = content.stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
      let length = 0;
      try {
        for (;;) {
          const next = await reader.read();
          if (next.done) break;
          length += next.value.length;
          if (length > size) throw new Error('DOCX expansion limit exceeded');
        }
      } finally { await reader.cancel(); }
      if (length !== size) throw new Error('Invalid DOCX expansion size');
    }
    expanded += size;
    central += 46 + nameLength + u16(central + 30) + u16(central + 32);
  }
  spans.sort(([a], [b]) => a - b);
  if (central !== end || spans.some(([start], i) => i > 0 && start < spans[i - 1][1]) ||
      !names.has('[Content_Types].xml') || !names.has('word/document.xml')) throw new Error('Missing DOCX document');
}
