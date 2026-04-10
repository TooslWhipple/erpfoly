export type SellerStatus = "ACTIVE" | "INACTIVE";

export type SellerSaleType = "cash" | "credit";

export interface SellerListItem {
  id: number;
  fullName: string;
  email: string;
  branchName: string;
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
  dateLabel: string;
  type: SellerSaleType;
  articleName: string;
  department: string;
  line: string;
  amount: number;
}

export interface SellerDetail {
  id: number;
  fullName: string;
  email: string;
  branchName: string;
  status: SellerStatus;
  currentMonthLabel: string;
  currentMonthSales: number;
  currentMonthGoal: number;
  goalProgressPercent: number;
  commissionRatePercent: number;
  commissionAmount: number;
  progressSeries: { label: string; actual: number; goal: number }[];
  monthlyChart: SellerMonthlyChartPoint[];
  monthlyBreakdown: SellerMonthlyBreakdownRow[];
  salesHistory: SellerSaleHistoryRow[];
}

export interface SellerListResponse {
  rows: SellerListItem[];
  total: number;
}
