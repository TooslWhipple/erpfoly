import { post, type ApiResult } from "@/lib/axios";

export type SupplierReturnReason = "damaged_goods" | "overstock" | "other";

export interface SupplierReturnItemPayload {
  productId: number;
  branchId: number;
  quantity: number;
}

export interface CreateSupplierReturnPayload {
  supplierId: number;
  damagedProductId?: number;
  items: SupplierReturnItemPayload[];
  reason: SupplierReturnReason;
  notes?: string;
}

export interface SupplierReturnResult {
  id: number;
  status: "completed";
}

export async function createSupplierReturn(
  payload: CreateSupplierReturnPayload,
): Promise<ApiResult<SupplierReturnResult>> {
  return post<SupplierReturnResult>("/supplier-returns", payload);
}
