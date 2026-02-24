"use client";

import { useCallback, useEffect, useState } from "react";
import { addDays, addHours, differenceInCalendarDays, endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek, startOfYear, endOfYear } from "date-fns";
import type { AgendaView } from "./AgendaViewFilter";
import type { CustomPeriod } from "./AgendaViewFilter";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  leadId?: string;
  leadName?: string;
  status?: string;
  description?: string | null;
}

interface AgendaCalendarBlockProps {
  view: AgendaView;
  currentDate: Date;
  onCurrentDateChange: (date: Date) => void;
  /** Quand view === "période", plage personnalisée définie par le commercial */
  customRange?: CustomPeriod;
  onCustomRangeChange?: (range: CustomPeriod) => void;
}

/**
 * Bloc affichage des tâches du commercial selon le filtre (jour / semaine / mois / année).
 * Utilise l'API /api/agenda/calendar pour charger les événements.
 */
export default function AgendaCalendarBlock({
  view,
  currentDate,
  onCurrentDateChange,
  customRange,
  onCustomRangeChange,
}: AgendaCalendarBlockProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRange = useCallback(() => {
    if (view === "période" && customRange) {
      return { from: customRange.start, to: customRange.end };
    }
    if (view === "période") {
      return { from: startOfWeek(currentDate, { weekStartsOn: 1 }), to: endOfWeek(currentDate, { weekStartsOn: 1 }) };
    }
    switch (view) {
      case "jour":
        return { from: startOfDay(currentDate), to: endOfDay(currentDate) };
      case "semaine":
        return { from: startOfWeek(currentDate, { weekStartsOn: 1 }), to: endOfWeek(currentDate, { weekStartsOn: 1 }) };
      case "mois":
        return { from: startOfMonth(currentDate), to: endOfMonth(currentDate) };
      case "année":
        return { from: startOfYear(currentDate), to: endOfYear(currentDate) };
      default:
        return { from: startOfDay(currentDate), to: endOfDay(currentDate) };
    }
  }, [view, currentDate, customRange]);

  useEffect(() => {
    const { from, to } = getRange();
    setLoading(true);
    setError(null);
    fetch(
      `/api/agenda/calendar?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Erreur chargement calendrier");
        return res.json();
      })
      .then((data: Array<{ id: string; title: string; dueDate: string; description?: string | null; status: string; lead?: { id: string; firstName: string; lastName: string; company?: { name: string } } }>) => {
        const mapped: CalendarEvent[] = data.map((item) => {
          const start = new Date(item.dueDate);
          const end = addHours(start, 1);
          return {
            id: item.id,
            title: item.title,
            start,
            end,
            leadId: item.lead?.id,
            leadName: item.lead ? `${item.lead.firstName} ${item.lead.lastName}` : undefined,
            status: item.status,
            description: item.description,
          };
        });
        setEvents(mapped);
      })
      .catch(() => setError("Impossible de charger les tâches."))
      .finally(() => setLoading(false));
  }, [getRange]);

  const goPrev = () => {
    if (view === "période" && customRange && onCustomRangeChange) {
      const span = differenceInCalendarDays(customRange.end, customRange.start) + 1;
      onCustomRangeChange({
        start: addDays(customRange.start, -span),
        end: addDays(customRange.end, -span),
      });
      return;
    }
    let next: Date;
    if (view === "jour") next = addHours(currentDate, -24);
    else if (view === "semaine") next = addHours(currentDate, -24 * 7);
    else if (view === "mois") next = addHours(startOfMonth(currentDate), -1);
    else next = addHours(startOfYear(currentDate), -24);
    onCurrentDateChange(next);
  };

  const goNext = () => {
    if (view === "période" && customRange && onCustomRangeChange) {
      const span = differenceInCalendarDays(customRange.end, customRange.start) + 1;
      onCustomRangeChange({
        start: addDays(customRange.start, span),
        end: addDays(customRange.end, span),
      });
      return;
    }
    let next: Date;
    if (view === "jour") next = addHours(currentDate, 24);
    else if (view === "semaine") next = addHours(currentDate, 24 * 7);
    else if (view === "mois") next = addHours(endOfMonth(currentDate), 24);
    else next = addHours(endOfYear(currentDate), 24);
    onCurrentDateChange(next);
  };

  const formatTitle = () => {
    if (view === "période" && customRange) {
      return `Du ${customRange.start.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })} au ${customRange.end.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;
    }
    if (view === "jour") return currentDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    if (view === "semaine") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${start.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} - ${end.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;
    }
    if (view === "mois") return currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return currentDate.getFullYear().toString();
  };

  return (
    <div className="rounded-3xl bg-[#f5f5ff] shadow-neu-soft border border-white/50 backdrop-blur-sm p-4 flex flex-col gap-4">
      {/* En-tête : navigation + période */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="w-9 h-9 rounded-xl bg-white shadow-neu flex items-center justify-center text-gray-600 hover:text-primary"
            aria-label="Période précédente"
          >
            <span className="text-lg leading-none">‹</span>
          </button>
          <h2 className="text-sm font-semibold text-primary min-w-[200px] capitalize">
            {formatTitle()}
          </h2>
          <button
            type="button"
            onClick={goNext}
            className="w-9 h-9 rounded-xl bg-white shadow-neu flex items-center justify-center text-gray-600 hover:text-primary"
            aria-label="Période suivante"
          >
            <span className="text-lg leading-none">›</span>
          </button>
        </div>
      </div>

      {/* Liste des tâches selon la période */}
      <div className="min-h-[280px] rounded-2xl bg-white/70 border border-gray-100 p-3">
        {loading ? (
          <p className="text-xs text-gray-500 py-4">Chargement des tâches...</p>
        ) : error ? (
          <p className="text-xs text-rose-600 py-4">{error}</p>
        ) : events.length === 0 ? (
          <p className="text-xs text-gray-400 py-4">Aucune tâche sur cette période.</p>
        ) : (
          <ul className="space-y-2">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 text-[11px]"
              >
                <span className="font-medium text-primary shrink-0">
                  {ev.start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800">{ev.title}</p>
                  {ev.leadName && (
                    <p className="text-[10px] text-gray-500 mt-0.5">Prospect : {ev.leadName}</p>
                  )}
                  {ev.description && (
                    <p className="text-[10px] text-gray-400 line-clamp-2 mt-0.5">{ev.description}</p>
                  )}
                </div>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] ${
                    ev.status === "DONE"
                      ? "bg-emerald-50 text-emerald-700"
                      : ev.status === "IN_PROGRESS"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {ev.status === "DONE" ? "Terminé" : ev.status === "IN_PROGRESS" ? "En cours" : "À faire"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
