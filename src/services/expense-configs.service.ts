import { get, patch, type ApiResult } from "@/lib/axios";
import type {
  ExpenseRequestConfig,
  PettyCashBranchConfig,
  UpdateExpenseRequestConfigPayload,
  UpdatePettyCashConfigPayload,
} from "@/types/expense-configs.types";

const BASE = "/expense-configs";

export async function getPettyCashConfigs(): Promise<
  ApiResult<PettyCashBranchConfig[]>
> {
  return get<PettyCashBranchConfig[]>(`${BASE}/petty-cash`);
}

export async function updatePettyCashConfig(
  branchId: number | string,
  payload: UpdatePettyCashConfigPayload,
): Promise<ApiResult<PettyCashBranchConfig>> {
  return patch<PettyCashBranchConfig>(
    `${BASE}/petty-cash/${branchId}`,
    payload,
  );
}

export async function getExpenseRequestConfig(): Promise<
  ApiResult<ExpenseRequestConfig>
> {
  return get<ExpenseRequestConfig>(`${BASE}/expense-requests`);
}

export async function updateExpenseRequestConfig(
  payload: UpdateExpenseRequestConfigPayload,
): Promise<ApiResult<ExpenseRequestConfig>> {
  return patch<ExpenseRequestConfig>(`${BASE}/expense-requests`, payload);
}
