"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  FileText,
  Plus,
} from "lucide-react";
import { Field } from "./ui/field";
import type { Lead } from "./LeadCard";

const ACTIVITY_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  CALL: { label: "Appel", icon: Phone, color: "text-emerald-600 bg-emerald-50" },
  EMAIL: { label: "Email", icon: Mail, color: "text-blue-600 bg-blue-50" },
  WHATSAPP: { label: "WhatsApp", icon: MessageCircle, color: "text-green-600 bg-green-50" },
  MEETING: { label: "Rendez-vous", icon: Calendar, color: "text-violet-600 bg-violet-50" },
  NOTE: { label: "Note interne", icon: FileText, color: "text-amber-600 bg-amber-50" },
};

export interface Activity {
  id: string;
  type: string;
  content: string;
  date: string;
  user?: { name: string };
}

interface InteractionHistoryProps {
  /** Prospect associé (optionnel si tenderId est fourni) */
  lead?: Lead | null;
  /** Appel d'offre associé (optionnel si lead est fourni) */
  tenderId?: string;
  /** Liste d'activités contrôlée par le parent (ex: lead.activities). Si fournie, aucune requête GET /api/activities n'est faite. */
  activities?: Activity[];
  onActivityAdded?: (activity: Activity) => void;
  /** Filtre optionnel : n'afficher que ce type (CALL, EMAIL, WHATSAPP, MEETING, NOTE) */
  filterType?: string;
  /** Titre personnalisé pour la section (par défaut: "Historique des Interactions") */
  title?: string;
  /** Type initial sélectionné dans le formulaire (CALL, EMAIL, WHATSAPP, MEETING, NOTE) */
  initialType?: string;
  /** Autorise l'ajout d'activité (true par défaut) */
  canWrite?: boolean;
}

export default function InteractionHistory({
  lead,
  tenderId,
  activities: activitiesProp,
  onActivityAdded,
  filterType,
  title,
  initialType,
  canWrite = true,
}: InteractionHistoryProps) {
  const [activities, setActivities] = useState<Activity[]>(activitiesProp ?? []);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<string>(initialType || "NOTE");
  const [formContent, setFormContent] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  useEffect(() => {
    if (initialType) {
      setFormType(initialType);
    }
  }, [initialType]);

  // Synchronise avec les activités fournies par le parent (mode contrôlé)
  useEffect(() => {
    if (activitiesProp) {
      setActivities(activitiesProp);
      setLoading(false);
    }
  }, [activitiesProp]);

  // Mode non contrôlé : fallback sur l'API historique /api/activities
  useEffect(() => {
    if (activitiesProp) return;
    const leadId = lead?.id;
    if (!leadId && !tenderId) return;
    setLoading(true);
    const url = leadId
      ? `/api/activities?leadId=${encodeURIComponent(leadId)}`
      : `/api/tenders/${encodeURIComponent(tenderId!)}/activities?skip=0&take=100`;
    fetch(url)
      .then((res) => (res.ok ? res.json() : leadId ? [] : { activities: [] }))
      .then((data) => {
        if (leadId) return setActivities(data as Activity[]);
        const payload = data as { activities?: Activity[] };
        setActivities(Array.isArray(payload.activities) ? payload.activities : []);
      })
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, [lead?.id, tenderId, activitiesProp]);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    const leadId = lead?.id;
    if ((!leadId && !tenderId) || !formContent.trim()) return;
    if (formType === "MEETING" && !scheduledDate) {
      setError("Merci de renseigner la date du rendez-vous.");
      return;
    }
    setFormLoading(true);
    setError(null);
    try {
      const url = leadId
        ? "/api/activities"
        : `/api/tenders/${encodeURIComponent(tenderId!)}/activities`;
      const payload = leadId
        ? {
            leadId,
            type: formType,
            content: formContent.trim(),
            date: scheduledDate || undefined,
          }
        : {
            type: formType,
            content: formContent.trim(),
            date: scheduledDate || undefined,
          };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Erreur lors de l'ajout");
      }
      const created = await res.json();
      // En mode contrôlé, on délègue la mise à jour au parent via le callback
      if (!activitiesProp) {
        setActivities((prev) => [created, ...prev]);
      }
      onActivityAdded?.(created);
      setFormContent("");
      setScheduledDate("");
      setShowForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setFormLoading(false);
    }
  };

  if (!lead?.id && !tenderId) return null;

  const filteredActivities = filterType
    ? activities.filter((a) => (a.type in ACTIVITY_CONFIG ? a.type : "NOTE") === filterType)
    : activities;

  const grouped = filteredActivities.reduce<Record<string, Activity[]>>((acc, a) => {
    const key = a.type in ACTIVITY_CONFIG ? a.type : "NOTE";
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  const typeOrder = ["CALL", "EMAIL", "WHATSAPP", "MEETING", "NOTE"];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-primary">{title ?? "Historique des Interactions"}</h3>
        {canWrite && !showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-medium"
          >
            <Plus className="w-3 h-3" /> Ajouter
          </button>
        )}
      </div>

      {canWrite && showForm && (
        <form
          onSubmit={handleAdd}
          className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-2"
        >
          <div className="flex flex-wrap gap-1.5">
            {typeOrder.map((type) => {
              const cfg = ACTIVITY_CONFIG[type];
              const Icon = cfg?.icon ?? FileText;
              const isActive = formType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormType(type)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-colors ${
                    isActive ? cfg?.color ?? "bg-amber-50 text-amber-600" : "bg-white text-gray-500"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {cfg?.label ?? type}
                </button>
              );
            })}
          </div>
          <textarea
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            placeholder="Détails de l'interaction..."
            className="min-h-[60px] rounded-lg border border-gray-200 px-2.5 py-1.5 text-[11px] bg-white resize-none focus:outline-none focus:ring-1 focus:ring-primary/40"
            required
          />
          {(formType === "CALL" || formType === "EMAIL" || formType === "MEETING") && (
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-gray-600">
                Date & heure {formType === "CALL" ? "de l'appel" : formType === "EMAIL" ? "de l'email" : "du rendez-vous"}
              </span>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="h-8 rounded-lg border border-gray-200 px-2.5 text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
          )}
          {error && <p className="text-[10px] text-rose-500">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setFormContent(""); setScheduledDate(""); setError(null); }}
              className="px-2 py-1 rounded-lg text-[10px] bg-gray-200 text-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-3 py-1 rounded-lg text-[10px] bg-primary text-white disabled:opacity-60"
            >
              {formLoading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
        {loading ? (
          <p className="text-[11px] text-gray-400">Chargement...</p>
        ) : filteredActivities.length === 0 ? (
          <p className="text-[11px] text-gray-400">Aucune interaction enregistrée.</p>
        ) : (
          typeOrder.map((type) => {
            const items = grouped[type];
            if (!items?.length) return null;
            const cfg = ACTIVITY_CONFIG[type];
            const Icon = cfg?.icon ?? FileText;
            return (
              <div key={type} className="space-y-1.5">
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  <Icon className="w-3 h-3" />
                  <span className="font-medium">{cfg?.label ?? type}</span>
                  <span>({items.length})</span>
                </div>
                <ul className="space-y-1.5 pl-5">
                  {items.map((a) => (
                    <li
                      key={a.id}
                      className="text-[11px] text-gray-700 bg-white rounded-lg px-2.5 py-1.5 shadow-neu border border-gray-50"
                    >
                      <p
                        className={`text-[11px] text-gray-700 ${
                          expandedIds.includes(a.id) ? "" : "line-clamp-2"
                        }`}
                      >
                        {a.content}
                      </p>
                      {a.content.length > 120 && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedIds((prev) =>
                              prev.includes(a.id)
                                ? prev.filter((id) => id !== a.id)
                                : [...prev, a.id],
                            )
                          }
                          className="mt-0.5 text-[10px] text-primary hover:underline"
                        >
                          {expandedIds.includes(a.id) ? "Voir moins" : "Voir plus"}
                        </button>
                      )}
                      <span className="block text-[10px] text-gray-400 mt-0.5">
                        {new Date(a.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {a.user?.name && ` · ${a.user.name}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
