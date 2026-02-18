"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import type { Activity } from "./InteractionHistory";

interface EmailsTabContentProps {
  emails: Activity[];
  loading: boolean;
  recipientName: string;
  recipientEmail: string;
  onCreateEmail: () => void;
  onEmailAdded?: (activity: Activity) => void;
}

function parseEmailContent(content: string): { subject: string; body: string } {
  const subjectMatch = content.match(/^Subject:\s*(.+?)(?:\n\n|$)/);
  if (subjectMatch) {
    return {
      subject: subjectMatch[1].trim(),
      body: content.replace(/^Subject:\s*.+?(?:\n\n)?/, "").trim(),
    };
  }
  return { subject: "(Sans objet)", body: content };
}

export default function EmailsTabContent({
  emails,
  loading,
  recipientName,
  recipientEmail,
  onCreateEmail,
}: EmailsTabContentProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const groupedByDate = emails.reduce<Record<string, Activity[]>>((acc, e) => {
    const d = new Date(e.date);
    const key = d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  const dates = Object.keys(groupedByDate).sort((a, b) => {
    const da = groupedByDate[a][0]?.date;
    const db = groupedByDate[b][0]?.date;
    return new Date(db || 0).getTime() - new Date(da || 0).getTime();
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-[11px] text-gray-600"
          >
            <span>Tous les utilisateurs</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={onCreateEmail}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-medium shadow-neu"
        >
          Créer un email
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col gap-6 max-h-[300px] overflow-y-auto pr-1">
        {loading ? (
          <p className="text-[11px] text-gray-400">Chargement...</p>
        ) : dates.length === 0 ? (
          <p className="text-[11px] text-gray-500">
            Aucun email envoyé. Cliquez sur "Créer un email" pour en envoyer un.
          </p>
        ) : (
          dates.map((date) => (
            <div key={date} className="space-y-4">
              <h4 className="text-[11px] font-medium text-gray-500">{date}</h4>
              <div className="space-y-2">
                {groupedByDate[date].map((email) => {
                  const { subject, body } = parseEmailContent(email.content);
                  const isExpanded = expandedIds.has(email.id);
                  return (
                    <div
                      key={email.id}
                      className="rounded-xl bg-white border border-gray-100 shadow-neu overflow-hidden"
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        className="w-full flex items-start gap-3 p-3 text-left hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => toggleExpand(email.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleExpand(email.id);
                          }
                        }}
                      >
                        <div className="mt-0.5">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary">
                              {email.user?.name?.[0] ?? "?"}
                            </div>
                            <span className="text-[11px] font-medium text-gray-700 truncate">
                              {email.user?.name ?? "Inconnu"}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-1">
                            à : {recipientName}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1">
                            {subject}
                          </p>
                          {!isExpanded && body && (
                            <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">
                              {body}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-gray-400">
                            {new Date(email.date).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 rounded text-gray-400 hover:bg-gray-100"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-0 border-t border-gray-50 mt-0">
                          <p className="text-[11px] text-gray-600 whitespace-pre-wrap mt-2">
                            {body || "(Message vide)"}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
