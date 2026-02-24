"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";

type AgendaStatus = "TODO" | "IN_PROGRESS" | "DONE";

interface AgendaItem {
  id: string;
  leadId: string;
  title: string;
  description?: string | null;
  dueDate: string;
  status: AgendaStatus;
}

interface AgendaTabProps {
  leadId: string;
}

export default function AgendaTab({ leadId }: AgendaTabProps) {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const fetchItems = useCallback(async () => {
    if (!leadId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/agenda?leadId=${encodeURIComponent(leadId)}`);
      const data = res.ok ? await res.json() : [];
      setItems(data ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCreate = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!leadId || !title || !dueDate) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          title,
          description: description || undefined,
          dueDate,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error || "Impossible de créer l'élément d'agenda.",
        );
      }
      const created: AgendaItem = await res.json();
      setItems((prev) => [created, ...prev]);
      setTitle("");
      setDescription("");
      setDueDate("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur inattendue lors de la création.",
      );
    } finally {
      setCreating(false);
    }
  }, [description, dueDate, leadId, title]);

  const handleStatusChange = useCallback(async (id: string, status: AgendaStatus) => {
    setUpdatingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/agenda/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error || "Impossible de mettre à jour le statut de la tâche."
        );
      }
      const updated = await res.json();
      setItems((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur inattendue lors de la mise à jour."
      );
    } finally {
      setUpdatingId(null);
    }
  }, []);

  const now = useMemo(() => new Date(), []);

  const { upcoming, done } = useMemo(() => {
    const upcomingItems = items
      .filter((item) => item.status !== "DONE")
      .sort(
        (a, b) =>
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
    const doneItems = items
      .filter((item) => item.status === "DONE")
      .sort(
        (a, b) =>
          new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      );
    return { upcoming: upcomingItems, done: doneItems };
  }, [items]);

  const formatDate = (value: string) =>
    new Date(value).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex flex-col gap-4">
      {/* Bloc agenda header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CalendarCheck2 className="h-4 w-4" />
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-primary">
              Agenda du prospect
            </span>
            <span className="text-[10px] text-gray-500">
              Actions à venir et tâches liées à la prospection.
            </span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] text-gray-600">
          <Clock className="h-3 w-3" />
          {upcoming.length} à venir
        </span>
      </div>

      {/* Bloc liste tâches à venir */}
      <div className="rounded-2xl bg-white/70 border border-gray-100 px-3 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-gray-700">
            Actions à mener
          </span>
          <span className="text-[10px] text-gray-400">
            {now.toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
              year: "2-digit",
            })}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Chargement de l&apos;agenda...
          </div>
        ) : upcoming.length === 0 ? (
          <p className="text-[11px] text-gray-400">
            Aucune action planifiée. Ajoutez des tâches à ce lead pour les voir
            apparaître ici.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {upcoming.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-2 rounded-xl bg-gray-50 px-2.5 py-2 text-[11px]"
              >
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CalendarClock className="h-3 w-3" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-gray-800 truncate">
                      {item.title}
                    </p>
                    <span className="whitespace-nowrap text-[10px] text-gray-500">
                      {formatDate(item.dueDate)}
                    </span>
                  </div>
                  {item.description && (
                    <p className="mt-0.5 line-clamp-2 text-[10px] text-gray-500">
                      {item.description}
                    </p>
                  )}
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${
                        item.status === "IN_PROGRESS"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {item.status === "IN_PROGRESS"
                        ? "En cours"
                        : "À faire"}
                    </span>
                    <button
                      type="button"
                      disabled={updatingId === item.id}
                      onClick={() =>
                        handleStatusChange(
                          item.id,
                          item.status === "IN_PROGRESS" ? "TODO" : "IN_PROGRESS"
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary hover:bg-primary/15 disabled:opacity-60"
                    >
                      {updatingId === item.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CalendarClock className="h-3 w-3" />
                      )}
                      {item.status === "IN_PROGRESS"
                        ? "Marquer à faire"
                        : "Marquer en cours"}
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === item.id}
                      onClick={() => handleStatusChange(item.id, "DONE")}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 border border-emerald-100 hover:bg-emerald-100/80 disabled:opacity-60"
                    >
                      {updatingId === item.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      Terminer
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Formulaire création rapide d'action agenda */}
        <form
          onSubmit={handleCreate}
          className="mt-3 border-t border-gray-100 pt-3 space-y-2"
        >
          <p className="text-[10px] font-medium text-gray-600">
            Ajouter une action à l&apos;agenda
          </p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de l'action (ex: Relancer par téléphone)"
            className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-primary/30"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Détails (facultatif)"
            className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-[11px] bg-white resize-none min-h-[50px] focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-primary/30"
              required
            />
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-[11px] font-medium text-white shadow-neu disabled:opacity-60"
            >
              {creating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Ajouter"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Bloc historique des tâches terminées */}
      <div className="rounded-2xl bg-gray-50 border border-gray-100 px-3 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-gray-700">
            Historique de l&apos;agenda
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] text-emerald-700 border border-emerald-100">
            <CheckCircle2 className="h-3 w-3" />
            {done.length} terminée(s)
          </span>
        </div>

        {done.length === 0 ? (
          <p className="text-[11px] text-gray-400">
            Aucune tâche terminée pour le moment.
          </p>
        ) : (
          <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {done.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-2 rounded-xl bg-white px-2.5 py-1.5 text-[11px] border border-gray-100"
              >
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-500" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Terminée le {formatDate(item.dueDate)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {error && (
          <p className="text-[10px] text-rose-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

