export type SellerStatus = "ACTIVE" | "INACTIVE";

export type SellerSaleType = "cash" | "credit";

export interface SellerBranchItem {
  id: number;
  name: string;
}

export interface SellerListItem {
  id: number;
  fullName: string;
  cellphone: string;
  branchIds: number[];
  branches: SellerBranchItem[];
}

export interface SellerMonthlyBreakdownRow {
  monthIndex: number;
  monthLabel: string;
  salesAmount: number;
  goalAmount: number;
  variationVsGoalPercent: number;
  priorYearSalesAmount: number;
  variationVsPriorYearPercent: number;
}

export interface SellerMonthlyChartPoint {
  monthLabel: string;
  sales: number;
  goal: number;
}

export interface SellerSaleHistoryRow {
  id: string;
  code: string;
  createdAt: string | Date;
  type: SellerSaleType;
  articleName: string;
  department: string;
  line: string;
  amount: number;
}

/** Month the seller dashboard reports on (the current month by default). */
/** Running totals up to a day of the selected month. */
export interface SellerDailyProgressPoint {
  day: number;
  sales: number | null;
  approvedCredits: number | null;
  newCreditsAmount: number | null;
}

export interface SellerDashboardPeriod {
  year: number;
  month: number;
  /** Month name in Spanish, e.g. "Septiembre". */
  label: string;
  isCurrent: boolean;
}

export interface SellerDetail {
  id: number;
  fullName: string;
  cellphone: string;
  branchId: number | null;
  branchName: string;
  status: SellerStatus;
  /** Seller creation date; the first month the dashboard can show. */
  sellerSince: string;
  period: SellerDashboardPeriod;
  /** The currentMonth* fields hold the selected `period`. */
  currentMonthLabel: string;
  currentMonthSales: number;
  currentMonthGoal: number;
  goalProgressPercent: number;
  currentMonthApprovedCredits: number;
  currentMonthCreditGoal: number;
  creditGoalProgressPercent: number;
  currentMonthApprovedNewCreditsAmount: number;
  currentMonthNewCreditsGoal: number;
  newCreditsGoalProgressPercent: number;
  commissionRatePercent: number;
  commissionAmount: number;
  /** One point per day of `period`; `null` values are days still to come. */
  dailyProgress: SellerDailyProgressPoint[];
  monthlyChart: SellerMonthlyChartPoint[];
  monthlyBreakdown: SellerMonthlyBreakdownRow[];
  salesHistory: SellerSaleHistoryRow[];
}
