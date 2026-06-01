'use client';

import {
  EMAIL_SIGNATURE_DESIGNER_BRIEF,
  EMAIL_SIGNATURE_IMAGE,
} from '@/config/email-signature';
import { ImageIcon, PenLine, Upload } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type SignatureSpec = {
  width: number;
  height: number;
  maxFileSizeBytes: number;
  designerBrief: string;
};

function validateImageFileDimensions(
  file: File,
): Promise<{ ok: true } | { ok: false; message: string }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = EMAIL_SIGNATURE_IMAGE;
      if (img.naturalWidth !== width || img.naturalHeight !== height) {
        resolve({
          ok: false,
          message: `Dimensions incorrectes : ${img.naturalWidth}×${img.naturalHeight} px. Format requis : ${width}×${height} px.`,
        });
        return;
      }
      resolve({ ok: true });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        ok: false,
        message: 'Impossible de lire l’image.',
      });
    };
    img.src = url;
  });
}

export function EmailSignatureSettings() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [spec, setSpec] = useState<SignatureSpec | null>(null);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const loadSignature = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile/email-signature', {
        cache: 'no-store',
      });
      if (!res.ok) {
        setStatus({
          type: 'error',
          message: 'Impossible de charger la signature.',
        });
        return;
      }
      const data = (await res.json()) as {
        imageUrl?: string | null;
        spec?: SignatureSpec;
      };
      setImageUrl(data.imageUrl ?? null);
      if (data.spec) setSpec(data.spec);
    } catch {
      setStatus({
        type: 'error',
        message: 'Impossible de charger la signature.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSignature();
  }, [loadSignature]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setStatus({ type: null, message: '' });

    if (
      !EMAIL_SIGNATURE_IMAGE.allowedMimeTypes.includes(
        file.type as (typeof EMAIL_SIGNATURE_IMAGE.allowedMimeTypes)[number],
      )
    ) {
      setStatus({
        type: 'error',
        message: 'Format non autorisé. Utilisez PNG ou JPEG.',
      });
      return;
    }

    if (file.size > EMAIL_SIGNATURE_IMAGE.maxFileSizeBytes) {
      setStatus({
        type: 'error',
        message: `Fichier trop volumineux (max ${Math.round(EMAIL_SIGNATURE_IMAGE.maxFileSizeBytes / 1024)} Ko).`,
      });
      return;
    }

    const dimCheck = await validateImageFileDimensions(file);
    if (!dimCheck.ok) {
      setStatus({ type: 'error', message: dimCheck.message });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/profile/email-signature', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({
          type: 'error',
          message:
            typeof data?.error === 'string'
              ? data.error
              : 'Enregistrement impossible.',
        });
        return;
      }
      setImageUrl(data.imageUrl ?? null);
      setStatus({
        type: 'success',
        message: 'Signature image enregistrée.',
      });
    } catch {
      setStatus({
        type: 'error',
        message: 'Enregistrement impossible.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClear = async () => {
    const ok = window.confirm(
      'Supprimer votre signature ? Les prochains emails n’en incluront plus automatiquement.',
    );
    if (!ok) return;
    try {
      setUploading(true);
      setStatus({ type: null, message: '' });
      const res = await fetch('/api/profile/email-signature', {
        method: 'DELETE',
      });
      if (!res.ok) {
        setStatus({ type: 'error', message: 'Suppression impossible.' });
        return;
      }
      setImageUrl(null);
      setStatus({ type: 'success', message: 'Signature supprimée.' });
    } finally {
      setUploading(false);
    }
  };

  const w = spec?.width ?? EMAIL_SIGNATURE_IMAGE.width;
  const h = spec?.height ?? EMAIL_SIGNATURE_IMAGE.height;

  return (
    <div className='flex flex-col gap-4 border-t border-gray-100 pt-4'>
      <div className='flex items-center gap-2'>
        <PenLine className='w-4 h-4 text-gray-500' />
        <h3 className='text-xs font-semibold text-gray-800'>
          Signature email (image)
        </h3>
      </div>

      <div className='rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-2.5 text-[11px] text-amber-900 leading-relaxed'>
        <p className='font-medium mb-1'>Consignes pour les concepteurs</p>
        <p>{spec?.designerBrief ?? EMAIL_SIGNATURE_DESIGNER_BRIEF}</p>
      </div>

      <p className='text-[11px] text-gray-500 leading-relaxed'>
        Importez le visuel fourni par le service communication. La signature est
        ajoutée automatiquement en bas de vos emails aux prospects.
      </p>

      {loading ? (
        <p className='text-xs text-gray-400'>Chargement…</p>
      ) : (
        <div className='flex flex-col gap-3'>
          <div
            className='rounded-xl border border-dashed border-gray-200 bg-gray-50/80 flex items-center justify-center overflow-hidden mx-auto'
            style={{
              width: '100%',
              maxWidth: w,
              aspectRatio: `${w} / ${h}`,
            }}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt='Aperçu signature'
                width={w}
                height={h}
                className='block w-full h-full object-contain'
              />
            ) : (
              <div className='flex flex-col items-center gap-2 text-gray-400 p-4 text-center'>
                <ImageIcon className='w-8 h-8 opacity-50' />
                <span className='text-[11px]'>
                  Aucune signature — {w}×{h} px
                </span>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type='file'
            accept={EMAIL_SIGNATURE_IMAGE.allowedMimeTypes.join(',')}
            className='hidden'
            onChange={handleFileChange}
          />

          <div className='flex flex-wrap gap-2'>
            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-[11px] font-medium shadow-neu disabled:opacity-50'
            >
              <Upload className='w-3.5 h-3.5' />
              {uploading
                ? 'Envoi…'
                : imageUrl
                  ? 'Remplacer l’image'
                  : 'Importer la signature'}
            </button>
            {imageUrl && (
              <button
                type='button'
                onClick={handleClear}
                disabled={uploading}
                className='inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-[11px] font-medium hover:bg-gray-200 disabled:opacity-50'
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
      )}

      {status.type && (
        <p
          className={`text-[11px] ${
            status.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {status.message}
        </p>
      )}
    </div>
  );
}
