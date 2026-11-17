import {
  del,
  get,
  post,
  type ApiResult,
  type PaginatedRowsResponse,
} from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  CreateDiverseDebtorExpensePayload,
  DiscountsReportResponse,
  DiverseDebtorExpense,
} from "@/types/diverse-debtor-expenses.types";

const BASE = "/diverse-debtor-expenses";

export interface ListDiverseDebtorExpensesParams {
  page?: number;
  limit?: number;
  search?: string;
  debtorId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface DiscountsReportParams {
  cutOffDate?: string;
  debtorId?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'ALL';
}

export async function getDiverseDebtorExpenses(
  params: ListDiverseDebtorExpensesParams = {},
): Promise<ApiResult<PaginatedRowsResponse<DiverseDebtorExpense>>> {
  const result = await get<any>(buildListUrl(BASE, params));
  if (result.data) {
    const raw = result.data;
    const items: DiverseDebtorExpense[] =
      raw.items ?? raw.rows ?? raw.data ?? (Array.isArray(raw) ? raw : []);
    const total = raw.total ?? items.length;
    const limit = raw.limit ?? params.limit ?? 20;
    const page = raw.page ?? params.page ?? 1;
    const totalPages = raw.totalPages ?? Math.max(1, Math.ceil(total / limit));

    return {
      ...result,
      data: {
        rows: items,
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
  return result;
}

export async function getDiverseDebtorExpense(
  id: number | string,
): Promise<ApiResult<DiverseDebtorExpense>> {
  return get<DiverseDebtorExpense>(`${BASE}/${id}`);
}

export async function createDiverseDebtorExpense(
  payload: CreateDiverseDebtorExpensePayload,
): Promise<ApiResult<DiverseDebtorExpense>> {
  const formData = new FormData();
  formData.append("diverseDebtorId", String(payload.diverseDebtorId));
  formData.append("date", payload.date);
  formData.append("amount", String(payload.amount));
  formData.append("description", payload.description);
  formData.append("installmentsCount", String(payload.installmentsCount));
  if (payload.notes) {
    formData.append("notes", payload.notes);
  }
  if (payload.file) {
    formData.append("file", payload.file);
  }

  return post<DiverseDebtorExpense>(BASE, formData, {
    transformRequest: (data, headers) => {
      if (data instanceof FormData && headers) {
        delete headers["Content-Type"];
      }
      return data;
    },
  });
}

export async function getDiscountsReport(
  params: DiscountsReportParams = {},
): Promise<ApiResult<DiscountsReportResponse>> {
  return get<DiscountsReportResponse>(buildListUrl(`${BASE}/discounts-report`, params));
}

export async function confirmInstallment(
  installmentId: number | string,
  notes?: string,
): Promise<ApiResult<{ id: number; status: string }>> {
  return post<{ id: number; status: string }>(
    `${BASE}/installments/${installmentId}/confirm`,
    { notes },
  );
}

export async function batchConfirmInstallments(
  installmentIds: number[],
  notes?: string,
): Promise<ApiResult<{ confirmedCount: number; confirmedIds: number[] }>> {
  return post<{ confirmedCount: number; confirmedIds: number[] }>(
    `${BASE}/installments/batch-confirm`,
    { installmentIds, notes },
  );
}

export async function cancelDiverseDebtorExpense(
  id: number | string,
): Promise<ApiResult<{ message: string }>> {
  return del<{ message: string }>(`${BASE}/${id}`);
}
