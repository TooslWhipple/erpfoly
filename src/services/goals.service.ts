import { get, post } from "@/lib/axios";
import { unwrapOrThrow } from "@/lib/axios";
import type {
  SalesHistoryPoint,
  BranchMonthlyGoal,
  ChartMetricType,
} from "@/types/goals.types";

interface BackendGoalsPageData {
  salesHistory: SalesHistoryPoint[];
  monthLabel: string;
  totalGoal: number;
  branchGoals: BranchMonthlyGoal[];
}

interface GoalsPageData {
  salesHistory: SalesHistoryPoint[];
  monthlySummary: {
    month: number;
    year: number;
    totalGoal: number;
    monthLabel: string;
  };
  branchGoals: BranchMonthlyGoal[];
}

export async function getGoalsPageData(
  month: number,
  year: number,
  _chartMetric: ChartMetricType
): Promise<GoalsPageData> {
  const result = await get<BackendGoalsPageData>(
    `/goals/page?month=${month}&year=${year}`
  );
  const data = unwrapOrThrow(result);

  return {
    salesHistory: data.salesHistory,
    monthlySummary: {
      month,
      year,
      totalGoal: data.totalGoal,
      monthLabel: data.monthLabel,
    },
    branchGoals: data.branchGoals,
  };
}

export async function getSalesHistory(
  _metric: ChartMetricType
): Promise<SalesHistoryPoint[]> {
  return [];
}

export async function saveBranchGoals(
  month: number,
  year: number,
  goals: BranchMonthlyGoal[]
): Promise<void> {
  const payload = {
    month,
    year,
    goals: goals.map((g) => ({
      branch_id: parseInt(g.id, 10),
      month,
      year,
      num_credits: g.numCredits,
      new_credits: g.newCredits,
      collection_goal: g.collectionGoal,
      monthly_goal: g.monthlyGoal,
    })),
  };

  const result = await post<void>("/goals/bulk-upsert", payload);
  unwrapOrThrow(result);
}
