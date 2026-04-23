'use client';

import {
  EmailRichTextEditor,
  type EmailRichTextEditorHandle,
} from '@/components/email/EmailRichTextEditor';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EMAIL_COMPOSE_TEMPLATES } from '@/lib/email-compose-templates';
import { emailHtmlToPlainSummary } from '@/lib/email-html-shared';
import {
  ChevronDown,
  FileX,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  Paperclip,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';

interface CreateEmailModalProps {
  open: boolean;
  leadId: string;
  recipientName: string;
  recipientEmail: string;
  onClose: () => void;
  onSent?: (activity: {
    id: string;
    type: string;
    content: string;
    date: string;
    user?: { name: string };
  }) => void;
}

function splitEmailAddresses(raw: string): string[] {
  return raw
    .split(/[;,\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ATTACHMENTS = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
]);

function isAllowedFile(file: File) {
  return ALLOWED_TYPES.has(file.type) || file.type.startsWith('image/');
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Ko`;
  return `${(size / (1024 * 1024)).toFixed(2)} Mo`;
}

function validateAddressList(raw: string, label: string): string | null {
  if (!raw.trim()) return null;
  const parts = splitEmailAddresses(raw);
  const bad = parts.find((p) => !EMAIL_RE.test(p));
  if (bad) {
    return `${label} : adresse invalide « ${bad} »`;
  }
  return null;
}

export default function CreateEmailModal({
  open,
  leadId,
  recipientName,
  recipientEmail,
  onClose,
  onSent,
}: CreateEmailModalProps) {
  const editorRef = useRef<EmailRichTextEditorHandle>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [subject, setSubject] = useState('');
  const [ccRaw, setCcRaw] = useState('');
  const [bccRaw, setBccRaw] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [createFollowUpTask, setCreateFollowUpTask] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!open) return;
    setSubject('');
    setCcRaw('');
    setBccRaw('');
    setShowCc(false);
    setShowBcc(false);
    setError(null);
    setLoading(false);
    setSelectedFiles([]);
    const t = requestAnimationFrame(() => {
      editorRef.current?.clear();
    });
    return () => cancelAnimationFrame(t);
  }, [open, leadId]);

  if (!open) return null;

  const handleDiscard = () => {
    const html = editorRef.current?.getHtml() ?? '';
    const plain = emailHtmlToPlainSummary(html, 20_000);
    const hasDraft =
      subject.trim() !== '' ||
      plain.length > 0 ||
      ccRaw.trim() !== '' ||
      bccRaw.trim() !== '' ||
      selectedFiles.length > 0;
    if (hasDraft) {
      const ok = window.confirm(
        'Abandonner ce message ? Les modifications seront perdues.',
      );
      if (!ok) return;
    }
    editorRef.current?.clear();
    setSubject('');
    setCcRaw('');
    setBccRaw('');
    setShowCc(false);
    setShowBcc(false);
    setSelectedFiles([]);
    onClose();
  };

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () =>
        reject(new Error(`Lecture impossible: ${file.name}`));
      reader.readAsDataURL(file);
    });

  const addFiles = async (incoming: FileList | null, inlineImages = false) => {
    if (!incoming || incoming.length === 0) return;
    const candidates = Array.from(incoming);
    const existing = new Set(
      selectedFiles.map((f) => `${f.name}:${f.size}:${f.lastModified}`),
    );
    const next = [...selectedFiles];
    const rejected: string[] = [];
    const imagesToInsert: File[] = [];

    for (const file of candidates) {
      const key = `${file.name}:${file.size}:${file.lastModified}`;
      if (existing.has(key)) continue;
      if (!isAllowedFile(file)) {
        rejected.push(`${file.name} (type non autorisé)`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        rejected.push(`${file.name} (> 10 Mo)`);
        continue;
      }
      if (next.length >= MAX_ATTACHMENTS) {
        rejected.push(`${file.name} (maximum ${MAX_ATTACHMENTS} fichiers)`);
        continue;
      }
      next.push(file);
      existing.add(key);
      if (inlineImages && file.type.startsWith('image/')) {
        imagesToInsert.push(file);
      }
    }

    setSelectedFiles(next);

    if (imagesToInsert.length > 0) {
      try {
        const sources = await Promise.all(
          imagesToInsert.map(readFileAsDataUrl),
        );
        for (let i = 0; i < sources.length; i += 1) {
          editorRef.current?.insertImage(
            sources[i],
            imagesToInsert[i]?.name ?? 'Image',
          );
        }
      } catch (e) {
        rejected.push('Impossible d’insérer une image inline.');
      }
    }

    if (rejected.length > 0) {
      setError(`Fichiers ignorés: ${rejected.join(', ')}`);
    } else {
      setError(null);
    }
  };

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !leadId) return;

    const errCc = validateAddressList(ccRaw, 'Cc');
    const errBcc = validateAddressList(bccRaw, 'Cci');
    if (errCc || errBcc) {
      setError(errCc || errBcc || null);
      return;
    }

    const bodyHtml = editorRef.current?.getHtml() ?? '';
    const plain = emailHtmlToPlainSummary(bodyHtml, 50_000);
    if (plain.length === 0) {
      setError('Saisissez un message.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('leadId', leadId);
      formData.append('to', recipientEmail);
      formData.append('subject', subject.trim() || '(Sans objet)');
      formData.append('bodyHtml', bodyHtml);
      formData.append('recipientName', recipientName);
      formData.append(
        'createFollowUpTask',
        createFollowUpTask ? 'true' : 'false',
      );
      formData.append('cc', JSON.stringify(splitEmailAddresses(ccRaw)));
      formData.append('bcc', JSON.stringify(splitEmailAddresses(bccRaw)));
      for (const file of selectedFiles) {
        formData.append('attachments', file, file.name);
      }

      const res = await fetch('/api/emails/send', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de l’envoi');
      }
      const created = await res.json();
      if (selectedFiles.length > 0) {
        const uploads = await Promise.allSettled(
          selectedFiles.map(async (file) => {
            const leadFd = new FormData();
            leadFd.append('file', file, file.name);
            const up = await fetch(
              `/api/leads/${encodeURIComponent(leadId)}/attachments`,
              {
                method: 'POST',
                body: leadFd,
              },
            );
            if (!up.ok) {
              const data = await up.json().catch(() => ({}));
              throw new Error(
                typeof data.error === 'string'
                  ? data.error
                  : `Échec upload ${file.name}`,
              );
            }
          }),
        );
        const failed = uploads.filter((r) => r.status === 'rejected').length;
        if (failed > 0) {
          window.alert(
            `Email envoyé, mais ${failed} pièce(s) jointe(s) n'ont pas pu être enregistrées dans le lead.`,
          );
        }
      }
      onSent?.(created);
      editorRef.current?.clear();
      setSubject('');
      setCcRaw('');
      setBccRaw('');
      setShowCc(false);
      setShowBcc(false);
      setSelectedFiles([]);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (id: string) => {
    const t = EMAIL_COMPOSE_TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    if (t.subject) setSubject(t.subject);
    editorRef.current?.setHtml(t.html);
  };

  const rowClass =
    'flex items-center gap-2 min-h-[40px] px-3 border-b border-gray-700 text-xs';

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3'>
      <div
        className={
          expanded
            ? 'w-full max-w-5xl h-[min(90vh,880px)] overflow-hidden rounded-2xl bg-gray-900 shadow-2xl flex flex-col'
            : 'w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-gray-900 shadow-2xl flex flex-col'
        }
      >
        <div className='flex items-center justify-between px-3 py-2.5 border-b border-gray-700 shrink-0'>
          <h2 className='text-sm font-semibold text-white'>Nouveau message</h2>
          <div className='flex items-center gap-1'>
            <button
              type='button'
              onClick={() => setExpanded((v) => !v)}
              className='p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white'
              title={expanded ? 'Réduire' : 'Agrandir'}
            >
              {expanded ? (
                <Minimize2 className='w-4 h-4' />
              ) : (
                <Maximize2 className='w-4 h-4' />
              )}
            </button>
            <button
              type='button'
              onClick={handleDiscard}
              className='p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white'
              title='Fermer'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className='flex flex-col flex-1 min-h-0 overflow-hidden'
        >
          <div className='shrink-0 bg-gray-900/95'>
            <div className={rowClass}>
              <span className='w-10 shrink-0 text-gray-500'>De</span>
              <div className='flex-1 min-w-0 flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2 min-w-0'>
                  <div className='w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-semibold shrink-0'>
                    U
                  </div>
                  <span className='text-gray-200 truncate'>
                    Compte commercial (expéditeur SMTP serveur)
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type='button'
                      className='shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-sky-400 hover:bg-gray-800'
                    >
                      Insérer un modèle
                      <ChevronDown className='w-3 h-3 opacity-70' />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='min-w-[200px]'>
                    {EMAIL_COMPOSE_TEMPLATES.map((tpl) => (
                      <DropdownMenuItem
                        key={tpl.id}
                        onClick={() => applyTemplate(tpl.id)}
                      >
                        {tpl.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className={rowClass}>
              <span className='w-10 shrink-0 text-gray-500 self-start pt-0.5'>
                À
              </span>
              <div className='flex-1 min-w-0 space-y-1'>
                <input
                  type='text'
                  readOnly
                  value={`${recipientName} <${recipientEmail}>`}
                  className='w-full bg-transparent text-gray-100 placeholder:text-gray-600 focus:outline-none'
                />
                <div className='flex flex-wrap items-center gap-2 text-[11px]'>
                  {!showCc && (
                    <button
                      type='button'
                      className='text-sky-400 hover:underline'
                      onClick={() => setShowCc(true)}
                    >
                      Cc
                    </button>
                  )}
                  {!showBcc && (
                    <button
                      type='button'
                      className='text-sky-400 hover:underline'
                      onClick={() => setShowBcc(true)}
                    >
                      Cci
                    </button>
                  )}
                </div>
              </div>
            </div>

            {showCc && (
              <div className={rowClass}>
                <span className='w-10 shrink-0 text-gray-500'>Cc</span>
                <input
                  type='text'
                  value={ccRaw}
                  onChange={(e) => setCcRaw(e.target.value)}
                  placeholder='Séparez les adresses par une virgule'
                  className='flex-1 min-w-0 bg-transparent text-gray-100 placeholder:text-gray-600 focus:outline-none'
                />
              </div>
            )}

            {showBcc && (
              <div className={rowClass}>
                <span className='w-10 shrink-0 text-gray-500'>Cci</span>
                <input
                  type='text'
                  value={bccRaw}
                  onChange={(e) => setBccRaw(e.target.value)}
                  placeholder='Séparez les adresses par une virgule'
                  className='flex-1 min-w-0 bg-transparent text-gray-100 placeholder:text-gray-600 focus:outline-none'
                />
              </div>
            )}

            <div className={rowClass}>
              <span className='w-10 shrink-0 text-gray-500'>Objet</span>
              <input
                type='text'
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder='Objet de l’email'
                className='flex-1 min-w-0 bg-transparent text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-0'
              />
            </div>
          </div>

          <div className='flex-1 min-h-0 flex flex-col px-3 pt-2 pb-1 overflow-hidden'>
            <EmailRichTextEditor
              ref={editorRef}
              disabled={loading}
              className='flex-1 min-h-0 flex flex-col [&_.ProseMirror]:overflow-y-auto [&_.ProseMirror]:max-h-[min(48vh,420px)]'
            />
            <p className='text-[10px] text-gray-500 mt-1 shrink-0'>
              Associé à ce prospect
            </p>
            {selectedFiles.length > 0 && (
              <div className='mt-2 rounded-md border border-gray-700 bg-gray-900/50 p-2'>
                <p className='text-[11px] text-gray-300 mb-1'>
                  Pièces jointes ({selectedFiles.length}/{MAX_ATTACHMENTS})
                </p>
                <ul className='space-y-1 max-h-24 overflow-y-auto'>
                  {selectedFiles.map((file, idx) => (
                    <li
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                      className='flex items-center justify-between gap-2 text-[11px]'
                    >
                      <span className='truncate text-gray-400'>
                        {file.name} · {formatBytes(file.size)}
                      </span>
                      <button
                        type='button'
                        onClick={() => removeFile(idx)}
                        className='text-gray-500 hover:text-rose-400'
                        title='Retirer'
                      >
                        <FileX className='w-3.5 h-3.5' />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className='shrink-0 px-3 py-2.5 border-t border-gray-700 space-y-2'>
            <label className='flex items-center gap-2 cursor-pointer select-none'>
              <input
                type='checkbox'
                checked={createFollowUpTask}
                onChange={(e) => setCreateFollowUpTask(e.target.checked)}
                className='rounded border-gray-600 bg-gray-800'
              />
              <span className='text-[11px] text-gray-400'>
                Créer une tâche de relance dans l’agenda (échéance +7 jours)
              </span>
            </label>

            {error && <p className='text-[11px] text-rose-400'>{error}</p>}

            <div className='flex items-center justify-between gap-2'>
              <div className='flex items-center gap-1'>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='text-gray-500 hover:text-gray-300'
                  title='Joindre un fichier'
                  onClick={() => attachInputRef.current?.click()}
                >
                  <Paperclip className='w-4 h-4' />
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='text-gray-500 hover:text-gray-300'
                  title='Ajouter une image'
                  onClick={() => imageInputRef.current?.click()}
                >
                  <ImageIcon className='w-4 h-4' />
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='text-gray-500 hover:text-rose-400'
                  onClick={handleDiscard}
                  title='Abandonner'
                >
                  <Trash2 className='w-4 h-4' />
                </Button>
              </div>
              <Button type='submit' disabled={loading} className='px-6'>
                {loading ? 'Envoi…' : 'Envoyer'}
              </Button>
            </div>
            <input
              ref={attachInputRef}
              type='file'
              multiple
              className='hidden'
              onChange={async (e) => {
                await addFiles(e.target.files, false);
                e.currentTarget.value = '';
              }}
            />
            <input
              ref={imageInputRef}
              type='file'
              multiple
              accept='image/*'
              className='hidden'
              onChange={async (e) => {
                await addFiles(e.target.files, true);
                e.currentTarget.value = '';
              }}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
