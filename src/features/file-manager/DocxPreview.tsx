import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { inspectDocx } from './docx-guard';

export function sanitizeDocument(source: string) {
  return DOMPurify.sanitize(source, {
    ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 's', 'br', 'ol', 'ul', 'li',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'sup', 'sub', 'span', 'div', 'pre', 'code'],
    ALLOWED_ATTR: [], ALLOW_DATA_ATTR: false, ALLOW_ARIA_ATTR: false,
  });
}

export default function DocxPreview({ bytes }: { bytes: Uint8Array<ArrayBuffer> }) {
  const [html, setHtml] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    async function open() {
      await inspectDocx(bytes);
      const mammoth = await import('mammoth');
      const result = await mammoth.convertToHtml({ arrayBuffer: bytes.slice().buffer }, {
        externalFileAccess: false,
        convertImage: mammoth.images.imgElement(async () => ({ src: '' })),
      });
      if (active) setHtml(sanitizeDocument(result.value));
    }
    void open().catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [bytes]);
  if (failed) return <p>Preview unavailable for this format.</p>;
  if (html === null) return <p role="status">Loading DOCX…</p>;
  return <div className="file-docx" dangerouslySetInnerHTML={{ __html: html }} />;
}
