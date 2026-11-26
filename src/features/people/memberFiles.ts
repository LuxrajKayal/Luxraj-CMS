import { decodeBytes, encodeBytes, sha256 } from '../../../supabase/functions/_shared/file-bytes';
import type { MemberOutput } from '../../../supabase/functions/_shared/member-contracts';

export async function memberOutput(id: string, name: string, blob: Blob): Promise<MemberOutput> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return { id, name, mime: blob.type, size: bytes.length, sha256: await sha256(bytes), contents: encodeBytes(bytes) };
}

export async function memberFile(file: MemberOutput) {
  if (file.contents === null) throw new Error('file_integrity');
  const bytes = decodeBytes(file.contents);
  if (bytes.length !== file.size || await sha256(bytes) !== file.sha256) throw new Error('file_integrity');
  return new File([bytes], file.name, { type: file.mime });
}
