import { get, type ApiResult } from "@/lib/axios";
import type {
  Branch,
  BranchPromotion,
  BranchSettings,
  BranchStatus,
  MonthlySalesPoint,
  SalesDashboardKpis,
  SalesHistoryPoint,
  SellerGoalRow,
  SellerSalesRow,
} from "@/types/sucursales.types";
import {
  getBranch as getBranchFromApi,
  updateBranch as updateBranchFromApi,
  type Branch as ApiBranch,
} from "@/services/branches.service";
import { unwrapSuccessEnvelope } from "@/services/promociones.service";
import type { PromotionListItem } from "@/types/promociones.types";

function toBranchStatus(status: ApiBranch["status"]): BranchStatus {
  if (typeof status === "string" && status.toLowerCase() === "inactive") return "inactive";
  return "active";
}

function mapApiBranch(data: ApiBranch): Branch {
  return {
    id: data.id,
    name: data.name,
    city: "",
    status: toBranchStatus(data.status),
  };
}

const BRANCH_BASE = (branchId: number) => `/branches/${branchId}`;

export async function getBranch(id: number): Promise<Branch | null> {
  const result = await getBranchFromApi(id);
  if (result.error || !result.data) return null;
  return mapApiBranch(result.data);
}

export async function getSalesDashboard(
  branchId: number,
): Promise<ApiResult<SalesDashboardKpis>> {
  return get<SalesDashboardKpis>(`${BRANCH_BASE(branchId)}/sales-dashboard`);
}

export async function getMonthlySales(
  branchId: number,
): Promise<ApiResult<MonthlySalesPoint[]>> {
  return get<MonthlySalesPoint[]>(`${BRANCH_BASE(branchId)}/monthly-sales`);
}

export async function getSalesBySeller(
  branchId: number,
): Promise<ApiResult<SellerSalesRow[]>> {
  return get<SellerSalesRow[]>(`${BRANCH_BASE(branchId)}/sales-by-seller`);
}

export async function getSalesHistory(
  branchId: number,
): Promise<ApiResult<SalesHistoryPoint[]>> {
  return get<SalesHistoryPoint[]>(`${BRANCH_BASE(branchId)}/sales-history`);
}

export async function getSellerGoals(
  branchId: number,
  month: number,
  year: number,
): Promise<
  ApiResult<{ monthLabel: string; totalGoal: number; sellers: SellerGoalRow[] }>
> {
  return get<{
    monthLabel: string;
    totalGoal: number;
    sellers: SellerGoalRow[];
  }>(`${BRANCH_BASE(branchId)}/seller-goals?month=${month}&year=${year}`);
}

export async function getBranchSettings(branchId: number): Promise<BranchSettings> {
  const result = await getBranchFromApi(branchId);
  if (result.error || !result.data) return { name: "" };
  return { name: result.data.name };
}

export async function saveBranchSettings(
  branchId: number,
  data: BranchSettings,
): Promise<BranchSettings> {
  const result = await updateBranchFromApi(branchId, { name: data.name });
  if (result.error) {
    throw new Error(result.error.message);
  }
  return { name: result.data?.name ?? data.name };
}

function mapPromotionType(code: string): BranchPromotion["type"] {
  const u = code.toUpperCase();
  if (u.includes("CREDITO") || u.includes("CRÉD") || u.includes("CREDIT")) {
    return "credit";
  }
  if (u.includes("APART") || u.includes("LAYAWAY")) {
    return "layaway";
  }
  return "cash";
}

function toBranchPromotion(item: PromotionListItem, branchId: number): BranchPromotion {
  return {
    id: item.id,
    name: item.name,
    margin: item.discount_rate,
    type: mapPromotionType(item.purchase_type_code),
    startDate: item.start_date,
    endDate: item.end_date,
    departments: item.department_summary || "Todos",
    lines: "Todos",
    branches: item.branch_summary || `Sucursal ${branchId}`,
  };
}

interface PaginatedPromotionsResponse {
  rows: PromotionListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getPromotions(
  branchId: number,
): Promise<ApiResult<BranchPromotion[]>> {
  const result = await get<PaginatedPromotionsResponse>(
    `/promotions?branchIds=${branchId}&limit=100&page=1`,
  );
  if (result.error || !result.data) {
    return { data: null, error: result.error };
  }
  const payload = unwrapSuccessEnvelope(result.data) as PaginatedPromotionsResponse;
  const rows = Array.isArray(payload?.rows) ? payload.rows : [];
  return { data: rows.map((row) => toBranchPromotion(row, branchId)), error: null };
}
