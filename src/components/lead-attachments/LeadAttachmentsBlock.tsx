"use client";

import { useCallback, useEffect, useState } from "react";
import NeumoCard from "@/components/NeumoCard";
import LeadAttachmentUploadZone from "./LeadAttachmentUploadZone";
import LeadAttachmentsList, {
  type LeadAttachmentItem,
} from "./LeadAttachmentsList";
import { Paperclip } from "lucide-react";

interface LeadAttachmentsBlockProps {
  leadId: string;
}

export default function LeadAttachmentsBlock({ leadId }: LeadAttachmentsBlockProps) {
  const [attachments, setAttachments] = useState<LeadAttachmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttachments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/attachments`);
      if (res.ok) {
        const data = await res.json();
        setAttachments(data);
      }
    } catch {
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  return (
    <NeumoCard className="p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Paperclip className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-xs font-semibold text-primary">
            Pièces jointes
          </h3>
        </div>
        {!loading && (
          <span className="text-[10px] text-gray-400">
            {attachments.length} fichier{attachments.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Block 1 : Zone d'upload — mis en évidence */}
      <div className="rounded-2xl border-2 border-primary/15 bg-white/60 p-3">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Ajouter un fichier
        </p>
        <LeadAttachmentUploadZone
          leadId={leadId}
          onUploaded={fetchAttachments}
        />
      </div>

      {/* Block 2 : Liste des pièces jointes — mis en évidence */}
      <div className="rounded-2xl border-2 border-gray-100 bg-gray-50/70 p-3">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Fichiers attachés
        </p>
        <LeadAttachmentsList
          leadId={leadId}
          attachments={attachments}
          onDeleted={fetchAttachments}
          loading={loading}
        />
      </div>
    </NeumoCard>
  );
}
