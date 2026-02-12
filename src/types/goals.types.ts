/**
 * Goals (metas) domain types.
 * Sales history, monthly goals, and branch-level goals.
 */

export type ChartMetricType = "sales" | "quotes" | "credits";

export interface SalesHistoryPoint {
  month: number;
  year: number;
  /** Short label for X axis e.g. "Ene, 25" */
  label: string;
  sales: number;
  goal: number;
  /** Optional value shown below X label (e.g. base or average) */
  displayValue?: number;
}

export interface MonthlyGoalsSummary {
  month: number;
  year: number;
  /** Total goal for the selected month */
  totalGoal: number;
  /** Human-readable month name e.g. "Enero 2026" */
  monthLabel: string;
}

export interface BranchMonthlyGoal {
  id: string;
  branchName: string;
  newCredits: number;
  collectionGoal: number;
  monthlyGoal: number;
}

export interface GoalsPageData {
  salesHistory: SalesHistoryPoint[];
  monthlySummary: MonthlyGoalsSummary;
  branchGoals: BranchMonthlyGoal[];
}
