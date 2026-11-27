import type {
  SellerDailyProgressPoint,
  SellerDashboardPeriod,
} from "@/types/sellers.types";

export const MONTH_LABELS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

export interface SellerPeriodOption {
  /** `YYYY-MM`, stable key for the select. */
  value: string;
  label: string;
  year: number;
  month: number;
}

export type SellerPeriodValue = Pick<SellerDashboardPeriod, "year" | "month">;

export function toPeriodValue({ year, month }: SellerPeriodValue): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

/**
 * Months the seller dashboard can show, newest first: from the month the seller
 * was created up to the current month. The first option is the current month.
 */
export function buildSellerPeriodOptions(
  sellerSince: string | Date | null | undefined,
  now: Date = new Date(),
): SellerPeriodOption[] {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const since = sellerSince ? new Date(sellerSince) : null;
  const sinceIsValid = since != null && !Number.isNaN(since.getTime());
  const firstIndex = sinceIsValid
    ? since.getFullYear() * 12 + since.getMonth()
    : currentYear * 12 + currentMonth - 1;
  const lastIndex = currentYear * 12 + currentMonth - 1;

  const options: SellerPeriodOption[] = [];
  for (let index = lastIndex; index >= Math.min(firstIndex, lastIndex); index--) {
    const year = Math.floor(index / 12);
    const month = (index % 12) + 1;
    const monthName = MONTH_LABELS[month - 1];
    options.push({
      value: toPeriodValue({ year, month }),
      label:
        index === lastIndex
          ? `Mes actual (${monthName})`
          : `${monthName} ${year}`,
      year,
      month,
    });
  }
  return options;
}

/** Label for the KPI cards: "Este mes" for the current month, else the month name. */
export function periodCardLabel(period: SellerDashboardPeriod): string {
  return period.isCurrent ? "Este mes" : `${period.label} ${period.year}`;
}

export interface SellerDailySeries {
  sales: Array<number | null>;
  approvedCredits: Array<number | null>;
  newCreditsAmount: Array<number | null>;
}

/** One series per goal card from the daily points of the dashboard. */
export function splitDailyProgress(
  points: SellerDailyProgressPoint[],
): SellerDailySeries {
  return {
    sales: points.map((point) => point.sales),
    approvedCredits: points.map((point) => point.approvedCredits),
    newCreditsAmount: points.map((point) => point.newCreditsAmount),
  };
}
