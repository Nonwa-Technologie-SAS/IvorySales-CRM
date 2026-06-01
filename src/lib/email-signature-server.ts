import { readFile } from 'fs/promises';
import path from 'path';
import {
  absolutizeSignatureImagesInHtml,
  resolveSignaturePublicPath,
} from '@/lib/email-signature';

export const EMAIL_SIGNATURE_CID = 'crm-signature@kpitracker';

export type SignatureInlineAttachment = {
  filename: string;
  content: Buffer;
  cid: string;
  contentType: string;
};

export function publicPathToDiskPath(publicPath: string): string {
  const relative = publicPath.replace(/^\//, '').replace(/^public\//, '');
  return path.join(process.cwd(), 'public', relative);
}

/**
 * Intègre la signature comme image inline (CID) pour affichage fiable dans les clients mail.
 */
export async function embedSignatureImageAsCid(
  html: string,
  stored: string | null | undefined,
): Promise<{ html: string; attachment?: SignatureInlineAttachment }> {
  const publicPath = resolveSignaturePublicPath(stored, html);
  if (!publicPath) {
    return { html: absolutizeSignatureImagesInHtml(html) };
  }

  const diskPath = publicPathToDiskPath(publicPath);
  try {
    const content = await readFile(diskPath);
    const ext = path.extname(publicPath).toLowerCase();
    const contentType =
      ext === '.png'
        ? 'image/png'
        : ext === '.jpg' || ext === '.jpeg'
          ? 'image/jpeg'
          : 'application/octet-stream';

    const cidRef = `cid:${EMAIL_SIGNATURE_CID}`;
    const htmlWithCid = html.replace(
      /(<img[^>]*\ssrc=["'])(?:https?:\/\/[^"']+)?(\/uploads\/signatures\/[^"']+)(["'])/gi,
      `$1${cidRef}$3`,
    );

    return {
      html: htmlWithCid,
      attachment: {
        filename: path.basename(publicPath) || 'signature.png',
        content,
        cid: EMAIL_SIGNATURE_CID,
        contentType,
      },
    };
  } catch (err) {
    console.warn('embedSignatureImageAsCid: fichier introuvable', diskPath, err);
    return { html: absolutizeSignatureImagesInHtml(html) };
  }
}
