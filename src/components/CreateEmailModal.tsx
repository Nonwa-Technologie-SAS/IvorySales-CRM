"use client";

import { useState, type FormEvent } from "react";
import { X, Maximize2, Bold, Italic, Underline, Link, Paperclip, Image } from "lucide-react";

interface CreateEmailModalProps {
  open: boolean;
  leadId: string;
  recipientName: string;
  recipientEmail: string;
  onClose: () => void;
  onSent?: (activity: { id: string; type: string; content: string; date: string; user?: { name: string } }) => void;
}

export default function CreateEmailModal({
  open,
  leadId,
  recipientName,
  recipientEmail,
  onClose,
  onSent,
}: CreateEmailModalProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [createTask, setCreateTask] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !leadId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          to: recipientEmail,
          subject: subject || "(Sans objet)",
          body,
          recipientName,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de l'envoi");
      }
      const created = await res.json();
      onSent?.(created);
      setSubject("");
      setBody("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-gray-900 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 className="text-sm font-semibold text-white">Créer un email</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold shrink-0">
                U
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white">De : Vous</p>
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    className="px-2 py-1 rounded text-[10px] text-gray-400 hover:bg-gray-800"
                  >
                    Insérer un modèle ▼
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] text-gray-400">À</label>
              <input
                type="text"
                readOnly
                value={`${recipientName} (${recipientEmail})`}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white text-xs border border-gray-700"
              />
              <div className="flex gap-2 text-[10px]">
                <button type="button" className="text-gray-500 hover:text-white">
                  Cc
                </button>
                <button type="button" className="text-gray-500 hover:text-white">
                  Bcc
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] text-gray-400">Objet</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Vos factures"
                className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white text-xs border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] text-gray-400">Message</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Rédigez votre message..."
                className="w-full min-h-[180px] px-3 py-2 rounded-lg bg-gray-800 text-white text-xs border border-gray-700 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex items-center gap-2 py-1">
                <button
                  type="button"
                  className="p-1.5 rounded text-gray-400 hover:bg-gray-700"
                  title="Gras"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded text-gray-400 hover:bg-gray-700"
                  title="Italique"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded text-gray-400 hover:bg-gray-700"
                  title="Souligner"
                >
                  <Underline className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded text-gray-400 hover:bg-gray-700"
                  title="Lien"
                >
                  <Link className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded text-gray-400 hover:bg-gray-700"
                  title="Pièce jointe"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded text-gray-400 hover:bg-gray-700"
                  title="Image"
                >
                  <Image className="w-4 h-4" />
                </button>
                <span className="ml-auto text-[10px] text-gray-500">
                  Associé à 1 enregistrement ▼
                </span>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createTask}
                onChange={(e) => setCreateTask(e.target.checked)}
                className="rounded border-gray-600"
              />
              <span className="text-[11px] text-gray-400">
                Enregistrer un rappel dans l&apos;agenda
              </span>
            </label>

            {error && (
              <p className="text-[11px] text-rose-400">{error}</p>
            )}
          </div>

          <div className="px-4 py-3 border-t border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-primary text-white text-xs font-medium hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Envoi..." : "Envoyer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
