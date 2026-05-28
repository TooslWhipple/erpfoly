import type {
  SalesHistoryPoint,
  MonthlyGoalsSummary,
  BranchMonthlyGoal,
  GoalsPageData,
  ChartMetricType,
} from "@/types/goals.types";

const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function formatShortMonth(month: number, year: number): string {
  const yy = String(year).slice(-2);
  return `${MONTH_LABELS[month - 1]}, ${yy}`;
}

/** Generate mock sales history from Jan 25 to Jan 26 */
function buildMockSalesHistory(metric: ChartMetricType): SalesHistoryPoint[] {
  const points: SalesHistoryPoint[] = [];
  const baseGoal = 112450.5;
  for (let year = 2025; year <= 2026; year++) {
    const startMonth = year === 2025 ? 1 : 1;
    const endMonth = year === 2025 ? 12 : 1;
    for (let m = startMonth; m <= endMonth; m++) {
      const isFuture = year === 2026 && m === 1;
      const sales = isFuture ? 0 : Math.round(baseGoal * (0.7 + Math.random() * 0.5) * 100) / 100;
      const goal = isFuture ? 0 : Math.round(baseGoal * (1 + (m / 12) * 0.1) * 100) / 100;
      points.push({
        month: m,
        year,
        label: formatShortMonth(m, year),
        sales,
        goal,
        displayValue: isFuture ? 0 : baseGoal,
      });
    }
  }
  return points;
}

const MOCK_BRANCHES: Omit<
  BranchMonthlyGoal,
  "numCredits" | "newCredits" | "collectionGoal" | "monthlyGoal"
>[] = [
  { id: "1", branchName: "Campestre" },
  { id: "2", branchName: "Carrera" },
  { id: "3", branchName: "Concordia-Mty" },
  { id: "4", branchName: "Cumbres-Mty" },
  { id: "5", branchName: "Estación" },
  { id: "6", branchName: "Guadalupe-NL" },
  { id: "7", branchName: "Matamoros-Pedro Cárdenas" },
  { id: "8", branchName: "Matamoros-Plaza Patio" },
  { id: "9", branchName: "Matamoros-Brisas" },
  { id: "10", branchName: "Marfre" },
  { id: "11", branchName: "Marfre Centro" },
  { id: "12", branchName: "Reynosa-Av. Hidalgo" },
  { id: "13", branchName: "Reynosa-Periferico" },
  { id: "14", branchName: "Nuevo Laredo" },
];

/** Mock branch goals for a given month: same structure, values can vary by month */
function buildMockBranchGoals(month: number, year: number): BranchMonthlyGoal[] {
  const totalMonthly = 480000;
  const count = MOCK_BRANCHES.length;
  const perBranch = Math.round((totalMonthly / count) * 100) / 100;
  return MOCK_BRANCHES.map((b) => ({
    ...b,
    numCredits: 12,
    newCredits: 300000,
    collectionGoal: 600000,
    monthlyGoal: perBranch,
  }));
}

/**
 * Fetches all data for the goals page (sales history, monthly summary, branch table).
 * In production, this would call real APIs or a single aggregated endpoint.
 */
export async function getGoalsPageData(
  month: number,
  year: number,
  chartMetric: ChartMetricType
): Promise<GoalsPageData> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const salesHistory = buildMockSalesHistory(chartMetric);
  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;
  const branchGoals = buildMockBranchGoals(month, year);
  const totalGoal = branchGoals.reduce((sum, b) => sum + b.monthlyGoal, 0);

  return {
    salesHistory,
    monthlySummary: {
      month,
      year,
      totalGoal,
      monthLabel,
    },
    branchGoals,
  };
}

/**
 * Fetches only sales history for the chart (e.g. when changing metric filter).
 */
export async function getSalesHistory(
  metric: ChartMetricType
): Promise<SalesHistoryPoint[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return buildMockSalesHistory(metric);
}
