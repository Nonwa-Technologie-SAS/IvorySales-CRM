export type GoalPeriodType = "MONTH" | "QUARTER" | "SEMESTER" | "YEAR";

export interface PeriodBounds {
  periodStart: Date;
  periodEnd: Date;
}

/**
 * Calcule periodStart et periodEnd selon le type de période.
 * - MONTH: year + month (1-12)
 * - QUARTER: year + quarter (1-4) → T1=Jan-Mar, T2=Apr-Jun, T3=Jul-Sep, T4=Oct-Dec
 * - SEMESTER: year + semester (1-2) → S1=Jan-Jun, S2=Jul-Dec
 * - YEAR: year uniquement
 */
export function getPeriodBounds(
  periodType: GoalPeriodType,
  year: number,
  month?: number,
  quarter?: number,
  semester?: number
): PeriodBounds {
  switch (periodType) {
    case "MONTH": {
      if (month == null || month < 1 || month > 12) {
        throw new Error("month doit être entre 1 et 12 pour MONTH");
      }
      const periodStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const periodEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
      return { periodStart, periodEnd };
    }
    case "QUARTER": {
      if (quarter == null || quarter < 1 || quarter > 4) {
        throw new Error("quarter doit être entre 1 et 4 pour QUARTER");
      }
      const startMonth = (quarter - 1) * 3;
      const periodStart = new Date(Date.UTC(year, startMonth, 1, 0, 0, 0, 0));
      const periodEnd = new Date(
        Date.UTC(year, startMonth + 3, 0, 23, 59, 59, 999)
      );
      return { periodStart, periodEnd };
    }
    case "SEMESTER": {
      if (semester == null || semester < 1 || semester > 2) {
        throw new Error("semester doit être 1 ou 2 pour SEMESTER");
      }
      const startMonth = semester === 1 ? 0 : 6;
      const periodStart = new Date(Date.UTC(year, startMonth, 1, 0, 0, 0, 0));
      const periodEnd = new Date(
        Date.UTC(year, startMonth + 6, 0, 23, 59, 59, 999)
      );
      return { periodStart, periodEnd };
    }
    case "YEAR": {
      const periodStart = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
      const periodEnd = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
      return { periodStart, periodEnd };
    }
    default:
      throw new Error(`Type de période inconnu: ${periodType}`);
  }
}

/** Libellé court de la période pour l'affichage (ex. "Fév. 2025", "T1 2025", "S1 2025", "2025") */
export function getPeriodLabel(
  periodType: GoalPeriodType,
  periodStart: Date
): string {
  const d = new Date(periodStart);
  const y = d.getUTCFullYear();
  switch (periodType) {
    case "MONTH": {
      const months = [
        "Janv.", "Fév.", "Mars", "Avr.", "Mai", "Juin",
        "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc.",
      ];
      return `${months[d.getUTCMonth()]} ${y}`;
    }
    case "QUARTER": {
      const m = d.getUTCMonth();
      const q = Math.floor(m / 3) + 1;
      return `T${q} ${y}`;
    }
    case "SEMESTER": {
      const m = d.getUTCMonth();
      const s = m < 6 ? 1 : 2;
      return `S${s} ${y}`;
    }
    case "YEAR":
      return String(y);
    default:
      return String(periodType);
  }
}

/**
 * Calcule les paramètres (year, month/quarter/semester) de la période suivante
 * par rapport à une période donnée.
 */
export function getNextPeriod(
  periodType: GoalPeriodType,
  periodStart: Date
): {
  year: number;
  month?: number;
  quarter?: number;
  semester?: number;
} {
  const d = new Date(periodStart);
  const year = d.getUTCFullYear();
  const monthIndex = d.getUTCMonth(); // 0-11

  switch (periodType) {
    case "MONTH": {
      const currentMonth = monthIndex + 1; // 1-12
      let nextMonth = currentMonth + 1;
      let nextYear = year;
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear += 1;
      }
      return { year: nextYear, month: nextMonth };
    }
    case "QUARTER": {
      const currentQuarter = Math.floor(monthIndex / 3) + 1; // 1-4
      let nextQuarter = currentQuarter + 1;
      let nextYear = year;
      if (nextQuarter > 4) {
        nextQuarter = 1;
        nextYear += 1;
      }
      return { year: nextYear, quarter: nextQuarter };
    }
    case "SEMESTER": {
      const currentSemester = monthIndex < 6 ? 1 : 2; // 1: Jan-Jun, 2: Jul-Dec
      let nextSemester: 1 | 2;
      let nextYear = year;
      if (currentSemester === 1) {
        nextSemester = 2;
      } else {
        nextSemester = 1;
        nextYear += 1;
      }
      return { year: nextYear, semester: nextSemester };
    }
    case "YEAR": {
      return { year: year + 1 };
    }
    default: {
      return { year };
    }
  }
}
