import {
  get,
  post,
  patch,
  del,
  type ApiResult,
  type PaginatedRowsResponse,
} from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  CreatePaymentTerminalPayload,
  GetPaymentTerminalsParams,
  PaymentTerminalCatalogItem,
  PaymentTerminalListItem,
  UpdatePaymentTerminalPayload,
} from "@/types/payment-terminals.types";

const BASE = "/payment-terminals";

export type GetPaymentTerminalsResponse = PaginatedRowsResponse<PaymentTerminalListItem>;

export async function getPaymentTerminals(
  params: GetPaymentTerminalsParams,
): Promise<ApiResult<GetPaymentTerminalsResponse>> {
  return get<GetPaymentTerminalsResponse>(buildListUrl(BASE, params));
}

export async function createPaymentTerminal(
  payload: CreatePaymentTerminalPayload,
): Promise<ApiResult<PaymentTerminalListItem>> {
  return post<PaymentTerminalListItem>(BASE, payload);
}

export async function updatePaymentTerminal(
  id: number,
  payload: UpdatePaymentTerminalPayload,
): Promise<ApiResult<PaymentTerminalListItem>> {
  return patch<PaymentTerminalListItem>(`${BASE}/${id}`, payload);
}

export async function deactivatePaymentTerminal(
  id: number,
): Promise<ApiResult<PaymentTerminalListItem>> {
  return del<PaymentTerminalListItem>(`${BASE}/${id}`);
}

export async function getPaymentTerminalsCatalog(
  branchId: number,
): Promise<PaymentTerminalCatalogItem[]> {
  const result = await get<PaymentTerminalCatalogItem[]>(
    buildListUrl(`${BASE}/catalog`, { branch_id: branchId }),
  );
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data ?? [];
}
