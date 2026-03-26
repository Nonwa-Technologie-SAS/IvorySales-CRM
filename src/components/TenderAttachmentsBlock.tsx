'use client';

import NeumoCard from '@/components/NeumoCard';
import { FileDown, Paperclip, Trash2, UploadCloud } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type AttachmentItem = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  createdAt: string;
  uploadedBy?: { id: string; name: string } | null;
};

type Props = {
  tenderId: string;
  currentUserId: string;
  isManagerOrAdmin: boolean;
};

const ALLOWED_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'docx',
  'xlsx',
  'csv',
  'pdf',
  'svg',
  'webp',
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo

function formatBytes(size: number) {
  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Ko`;
  return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function TenderAttachmentsBlock({
  tenderId,
  currentUserId,
  isManagerOrAdmin,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tenders/${encodeURIComponent(tenderId)}/attachments`);
      const body = await res.json().catch(() => []);
      if (!res.ok) {
        setError(typeof body.error === 'string' ? body.error : 'Erreur de chargement');
        return;
      }
      setAttachments(Array.isArray(body) ? body : []);
    } finally {
      setLoading(false);
    }
  }, [tenderId]);

  useEffect(() => {
    void load();
  }, [load]);

  const validate = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return 'Extension non autorisée (jpg, jpeg, png, docx, xlsx, csv, pdf, svg, webp).';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Fichier trop volumineux (max 10 Mo).';
    }
    return null;
  };

  const upload = async (file: File) => {
    const validationError = validate(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      const form = new FormData();
      form.set('file', file);
      const res = await fetch(`/api/tenders/${encodeURIComponent(tenderId)}/attachments`, {
        method: 'POST',
        body: form,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof body.error === 'string' ? body.error : "Impossible d'envoyer le fichier");
        return;
      }
      setMessage('Document ajouté.');
      await load();
    } finally {
      setUploading(false);
    }
  };

  const onFileInputChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await upload(file);
    e.target.value = '';
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await upload(file);
  };

  const onDelete = async (attachmentId: string) => {
    setDeletingId(attachmentId);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/tenders/${encodeURIComponent(tenderId)}/attachments/${encodeURIComponent(attachmentId)}`,
        { method: 'DELETE' },
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof body.error === 'string' ? body.error : 'Suppression impossible');
        return;
      }
      setMessage('Document supprimé.');
      await load();
    } finally {
      setDeletingId(null);
    }
  };

  const countText = useMemo(
    () => `${attachments.length} fichier${attachments.length > 1 ? 's' : ''}`,
    [attachments.length],
  );

  return (
    <NeumoCard className="p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Paperclip className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-xs font-semibold text-primary">Documents de l’appel d’offre</h3>
        </div>
        {!loading && <span className="text-[10px] text-gray-400">{countText}</span>}
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="rounded-2xl border-2 border-dashed border-primary/20 bg-white/70 p-4 flex flex-col gap-2"
      >
        <p className="text-[11px] text-gray-600">
          Glissez un fichier ici ou utilisez le bouton.
        </p>
        <p className="text-[10px] text-gray-400">
          Types autorisés: jpg, jpeg, png, docx, xlsx, csv, pdf, svg, webp (max 10 Mo)
        </p>
        <div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={onFileInputChange}
            accept=".jpg,.jpeg,.png,.docx,.xlsx,.csv,.pdf,.svg,.webp"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-primary text-white text-[11px] disabled:opacity-60"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            {uploading ? 'Upload…' : 'Ajouter un document'}
          </button>
        </div>
      </div>

      {error && <p className="text-[11px] text-rose-600">{error}</p>}
      {message && <p className="text-[11px] text-emerald-600">{message}</p>}

      <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3">
        {loading ? (
          <p className="text-[11px] text-gray-500">Chargement…</p>
        ) : attachments.length === 0 ? (
          <p className="text-[11px] text-gray-500">Aucun document.</p>
        ) : (
          <ul className="space-y-2">
            {attachments.map((a) => {
              const canDelete = isManagerOrAdmin || a.uploadedBy?.id === currentUserId;
              return (
                <li
                  key={a.id}
                  className="rounded-xl bg-white border border-gray-100 px-3 py-2 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-primary truncate">{a.fileName}</p>
                    <p className="text-[10px] text-gray-500">
                      {a.fileType} · {formatBytes(a.fileSize)} · {new Date(a.createdAt).toLocaleString('fr-FR')}
                      {a.uploadedBy?.name ? ` · ${a.uploadedBy.name}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={a.storagePath}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gray-100 text-gray-700 text-[10px] hover:bg-gray-200"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      Télécharger
                    </a>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => void onDelete(a.id)}
                        disabled={deletingId === a.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-rose-50 text-rose-700 text-[10px] hover:bg-rose-100 disabled:opacity-60"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Supprimer
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </NeumoCard>
  );
}
