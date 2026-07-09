import {
  get,
  post,
  patch,
  type ApiResult,
  type PaginatedRowsResponse,
} from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  AssignCashRegisterSellerPayload,
  CashRegisterCatalogItem,
  CashRegisterListItem,
  CreateCashRegisterPayload,
  GetCashRegistersParams,
  UpdateCashRegisterPayload,
} from "@/types/cash-registers.types";

const BASE = "/cash-registers";

export type GetCashRegistersResponse = PaginatedRowsResponse<CashRegisterListItem>;

export async function getCashRegisters(
  params: GetCashRegistersParams,
): Promise<ApiResult<GetCashRegistersResponse>> {
  return get<GetCashRegistersResponse>(buildListUrl(BASE, params));
}

export async function createCashRegister(
  payload: CreateCashRegisterPayload,
): Promise<ApiResult<CashRegisterListItem>> {
  return post<CashRegisterListItem>(BASE, payload);
}

export async function updateCashRegister(
  id: number,
  payload: UpdateCashRegisterPayload,
): Promise<ApiResult<CashRegisterListItem>> {
  return patch<CashRegisterListItem>(`${BASE}/${id}`, payload);
}

export async function getCashRegistersCatalog(): Promise<CashRegisterCatalogItem[]> {
  const result = await get<CashRegisterCatalogItem[]>(`${BASE}/catalog`);
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data ?? [];
}

export async function assignCashRegisterToSeller(
  cashRegisterId: number,
  payload: AssignCashRegisterSellerPayload,
): Promise<ApiResult<CashRegisterListItem>> {
  return post<CashRegisterListItem>(
    `${BASE}/${cashRegisterId}/assign-seller`,
    payload,
  );
}
