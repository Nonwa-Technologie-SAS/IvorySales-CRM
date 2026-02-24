"use client";

import { useState } from "react";
import { startOfWeek, endOfWeek } from "date-fns";
import { CalendarDays } from "lucide-react";
import { withDashboardLayout } from "@/components/layouts/withDashboardLayout";
import AgendaViewFilter from "@/components/agenda/AgendaViewFilter";
import type { AgendaView, CustomPeriod } from "@/components/agenda/AgendaViewFilter";
import AgendaCalendarBlock from "@/components/agenda/AgendaCalendarBlock";

function AgendaPageInner() {
  const [view, setView] = useState<AgendaView>("semaine");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [customPeriod, setCustomPeriod] = useState<CustomPeriod>(() => {
    const now = new Date();
    return {
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 }),
    };
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Bloc 1 : En-tête page Agenda */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-primary">Agenda</h1>
            <p className="text-xs text-gray-500">
              Tâches et actions du commercial par jour, semaine, mois, année ou période personnalisée
            </p>
          </div>
        </div>
      </div>

      {/* Bloc 2 : Filtre de vue (Jour | Semaine | Mois | Année | Période) + choix des dates si Période */}
      <section className="rounded-2xl bg-white/80 border border-gray-100 p-3">
        <p className="text-[11px] font-medium text-gray-600 mb-2">Vue</p>
        <AgendaViewFilter
          value={view}
          onChange={setView}
          customPeriod={customPeriod}
          onCustomPeriodChange={setCustomPeriod}
        />
      </section>

      {/* Bloc 3 : Calendrier / liste des tâches selon le filtre */}
      <section aria-label="Tâches du commercial">
        <AgendaCalendarBlock
          view={view}
          currentDate={currentDate}
          onCurrentDateChange={setCurrentDate}
          customRange={view === "période" ? customPeriod : undefined}
          onCustomRangeChange={view === "période" ? setCustomPeriod : undefined}
        />
      </section>
    </div>
  );
}

export default withDashboardLayout(AgendaPageInner);
