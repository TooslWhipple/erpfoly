/**
 * Branch (sucursal) detail types.
 * Used by /catalogos/sucursales/[id] and its tabs.
 */

export type BranchStatus = "active" | "inactive";

export interface Branch {
  id: number;
  name: string;
  city: string;
  status: BranchStatus;
}

// --- Sales tab ---

export interface SalesDashboardKpis {
  thisMonth: number;
  goal: number;
  performancePercent: number;
  closeRatePercent: number;
  avgTicket: number;
}

export interface MonthlySalesPoint {
  month: string;
  sales: number;
  goal: number;
}

export interface SellerSalesRow {
  id: string;
  name: string;
  avatarUrl?: string;
  previousMonth: number;
  thisMonth: number;
  trend: "up" | "down";
}

// --- Goals tab ---

export interface SalesHistoryPoint {
  label: string;
  sales: number;
  goal: number;
}

export interface SellerGoalRow {
  id: string;
  name: string;
  avatarUrl?: string;
  numCredits: number;
  newCredits: number;
  quoteGoal: number;
  monthlyGoal: number;
}

// --- Promotions tab ---

export type PromotionType = "credit" | "cash" | "layaway";

export interface BranchPromotion {
  id: number;
  name: string;
  margin: number;
  type: PromotionType;
  startDate: string;
  endDate: string | null;
  departments: string;
  lines: string;
  branches: string;
}

// --- Settings tab ---

export interface BranchSettings {
  name: string;
}
