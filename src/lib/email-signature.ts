import { EMAIL_SIGNATURE_IMAGE } from '@/config/email-signature';
import { emailHtmlToPlainSummary } from '@/lib/email-html-shared';

export const EMAIL_SIGNATURE_ATTR = 'data-crm-email-signature';
export const MAX_EMAIL_SIGNATURE_LENGTH = 12_000;

export function wrapEmailSignatureHtml(innerHtml: string): string {
  const trimmed = innerHtml.trim();
  if (!trimmed) return '';
  return `<div ${EMAIL_SIGNATURE_ATTR}="true">${trimmed}</div>`;
}

export function hasEmailSignatureMarker(html: string): boolean {
  return html.includes(EMAIL_SIGNATURE_ATTR);
}

export function stripEmailSignatureFromHtml(html: string): string {
  if (!hasEmailSignatureMarker(html)) return html;
  const re = new RegExp(
    `<div[^>]*${EMAIL_SIGNATURE_ATTR.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*=\\s*["']true["'][^>]*>[\\s\\S]*?</div>`,
    'gi',
  );
  return html.replace(re, '').trim();
}

export function isEmailComposeBodyEmpty(html: string): boolean {
  const withoutSig = stripEmailSignatureFromHtml(html);
  const plain = emailHtmlToPlainSummary(withoutSig, 50_000);
  return plain.length === 0;
}

/** URL publique absolue pour les emails sortants (clients mail). */
export function toAbsolutePublicUrl(pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '');
  if (!base) return trimmed;
  return `${base}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

/** HTML d’une signature image aux dimensions imposées. */
export function buildImageSignatureHtml(
  imagePath: string,
  options?: { absolute?: boolean },
): string {
  const src = options?.absolute
    ? toAbsolutePublicUrl(imagePath)
    : imagePath;
  const { width, height, alt } = EMAIL_SIGNATURE_IMAGE;
  return `<p style="margin:16px 0 0;"><img src="${src}" width="${width}" height="${height}" alt="${alt}" style="display:block;width:${width}px;height:${height}px;max-width:100%;border:0;" /></p>`;
}

/**
 * Construit le HTML de signature à partir de la valeur stockée en base :
 * - chemin public `/uploads/signatures/...` (image)
 * - ancien HTML riche (rétrocompatibilité)
 */
export function buildSignatureHtmlFromStored(
  stored: string | null | undefined,
  options?: { absolute?: boolean },
): string {
  if (!stored?.trim()) return '';
  const value = stored.trim();
  if (value.startsWith('<')) {
    return wrapEmailSignatureHtml(value);
  }
  if (value.startsWith('/')) {
    return wrapEmailSignatureHtml(
      buildImageSignatureHtml(value, options),
    );
  }
  return '';
}

export function buildComposeHtmlWithSignature(
  stored: string | null | undefined,
): string {
  const inner = buildSignatureHtmlFromStored(stored, { absolute: false });
  if (!inner) return '';
  return `<p></p><p></p>${inner}`;
}

export function appendEmailSignatureIfMissing(
  bodyHtml: string,
  stored: string | null | undefined,
): string {
  const signatureHtml = buildSignatureHtmlFromStored(stored, { absolute: false });
  if (!signatureHtml || hasEmailSignatureMarker(bodyHtml)) {
    return bodyHtml;
  }
  const base = bodyHtml.trim();
  if (!base) return signatureHtml;
  return `${base}<p></p>${signatureHtml}`;
}

/** Chemin public `/uploads/signatures/...` depuis la BDD ou le HTML du message. */
export function resolveSignaturePublicPath(
  stored: string | null | undefined,
  html: string,
): string | null {
  const fromDb = stored?.trim();
  if (fromDb?.startsWith('/uploads/signatures/')) return fromDb;
  const match = html.match(/src=["'](\/uploads\/signatures\/[^"']+)["']/i);
  return match?.[1] ?? null;
}

/** Remplace les URL relatives par une URL absolue (secours si CID impossible). */
export function absolutizeSignatureImagesInHtml(html: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '');
  if (!base) return html;
  return html.replace(
    /(<img[^>]*\ssrc=["'])(\/uploads\/signatures\/[^"']+)(["'])/gi,
    (_, before, sigPath, after) => `${before}${base}${sigPath}${after}`,
  );
}

/** Vérifie les dimensions d’un PNG (IHDR). */
export function readPngDimensions(
  buffer: Buffer,
): { width: number; height: number } | null {
  if (buffer.length < 24) return null;
  const signature = buffer.toString('ascii', 1, 4);
  if (buffer[0] !== 0x89 || signature !== 'PNG') return null;
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

/** Vérifie les dimensions d’un JPEG (premier SOF trouvé). */
export function readJpegDimensions(
  buffer: Buffer,
): { width: number; height: number } | null {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    if (marker === 0xc0 || marker === 0xc2) {
      if (offset + 9 > buffer.length) return null;
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    if (offset + 3 >= buffer.length) break;
    const segmentLength = buffer.readUInt16BE(offset + 2);
    if (segmentLength < 2) break;
    offset += 2 + segmentLength;
  }
  return null;
}

export function validateSignatureImageDimensions(
  buffer: Buffer,
  mimeType: string,
): { ok: true } | { ok: false; message: string } {
  const { width, height } = EMAIL_SIGNATURE_IMAGE;
  let dims: { width: number; height: number } | null = null;

  if (mimeType === 'image/png') {
    dims = readPngDimensions(buffer);
  } else if (mimeType === 'image/jpeg') {
    dims = readJpegDimensions(buffer);
  }

  if (!dims) {
    return {
      ok: false,
      message:
        'Impossible de lire les dimensions de l’image. Utilisez un PNG ou JPEG valide.',
    };
  }

  if (dims.width !== width || dims.height !== height) {
    return {
      ok: false,
      message: `Dimensions incorrectes : ${dims.width}×${dims.height} px. Format requis : ${width}×${height} px.`,
    };
  }

  return { ok: true };
}
