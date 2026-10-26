import { get, post } from "@/lib/axios";
import type { ApiResult } from "@/lib/axios";
import type {
  CreateSaleCancellationPayload,
  SaleCancellationLineSelection,
  SaleCancellationPreview,
  SaleCancellationResult,
} from "@/types/saleCancellation.types";

const BASE = "/pos/sales";

export async function getSaleCancellationPreview(
  saleId: number,
  lines: SaleCancellationLineSelection[] = [],
): Promise<ApiResult<SaleCancellationPreview>> {
  const query = lines
    .filter((line) => line.quantity > 0)
    .map((line) => `${line.saleItemId}:${line.quantity}`)
    .join(",");
  return get<SaleCancellationPreview>(`${BASE}/${saleId}/cancellation-preview`, {
    params: query ? { lines: query } : undefined,
    skipGlobalErrorToast: true,
  });
}

export async function createSaleCancellation(
  saleId: number,
  payload: CreateSaleCancellationPayload,
): Promise<ApiResult<SaleCancellationResult>> {
  return post<SaleCancellationResult>(`${BASE}/${saleId}/cancellations`, payload, {
    skipGlobalErrorToast: true,
  });
}
