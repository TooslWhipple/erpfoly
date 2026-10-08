import { api, get, patch, post, unwrapOrThrow } from "@/lib/axios";
import type { PaginatedListParams, PaginatedListPayload } from "@/hooks/usePaginatedList";

export interface HandoverLine {
  saleItemId: number;
  productId: number;
  code: string;
  name: string;
  quantity: number;
  delivered: number;
  ready: number;
  pendingSupply: number;
}

export interface HandoverSale {
  saleId: number;
  folio: string;
  clientName: string;
  status: string;
  holdStatus: "ACTIVE" | "EXPIRED" | "RELEASED" | null;
  holdLabel: string | null;
  blockReason: string | null;
  lines: HandoverLine[];
}

export interface PickupHoldRow {
  id: number;
  saleId: number;
  folio: string;
  clientName: string;
  branchName: string;
  readyAt: string;
  expiresAt: string;
  status: string;
  label: string | null;
}

const BASE = "/sale-handovers";

export interface HandoverBranch {
  id: number;
  name: string;
}

export async function listHandoverBranches(): Promise<HandoverBranch[]> {
  return unwrapOrThrow(await get<HandoverBranch[]>(`${BASE}/branches`));
}

export function listHandoverQueue(params: PaginatedListParams) {
  return get<PaginatedListPayload<HandoverSale>>(BASE, {
    params: {
      branchId: params.branchId,
      page: params.page,
      limit: params.limit,
      ...(params.search ? { q: params.search } : {}),
    },
  });
}

export async function getHandoverSale(saleId: number, branchId: number) {
  return unwrapOrThrow(
    await get<HandoverSale>(`${BASE}/sales/${saleId}`, { params: { branchId } }),
  );
}

export async function confirmHandover(payload: {
  saleId: number;
  branchId: number;
  signatureFileId: number;
  receiverName?: string;
  idempotencyKey: string;
  overrideReason?: string;
  lines: Array<{
    saleItemId: number;
    quantity: number;
    inputMethod: "QR" | "BARCODE" | "MANUAL";
  }>;
  evidences?: Array<{ fileId: number; side: "INE_FRONT" | "INE_BACK" }>;
}) {
  return unwrapOrThrow(
    await post<{ id: number; folio: string; status: string }>(BASE, payload),
  );
}

export async function fetchHandoverPdf(handoverId: number): Promise<Blob> {
  const response = await api.get(`${BASE}/${handoverId}/pdf`, {
    responseType: "blob",
  });
  return response.data as Blob;
}

export async function fetchSaleTicketPdf(saleId: number): Promise<Blob> {
  const response = await api.get(`${BASE}/sales/${saleId}/ticket`, {
    responseType: "blob",
  });
  return response.data as Blob;
}

export async function uploadHandoverFile(
  file: Blob,
  type: "PHOTO" | "SIGNATURE",
  name: string,
): Promise<number> {
  const formData = new FormData();
  formData.append("file", file, name);
  formData.append("type", type);
  formData.append("related_entity", "SaleHandover");
  const uploaded = unwrapOrThrow(
    await post<{ id: number }>("/driver-files/upload", formData, {
      transformRequest: (data, headers) => {
        if (data instanceof FormData && headers) {
          delete headers["Content-Type"];
        }
        return data;
      },
    }),
  );
  return uploaded.id;
}

export function listExpiredHolds(params: PaginatedListParams) {
  return get<PaginatedListPayload<PickupHoldRow>>(`${BASE}/holds`, {
    params: {
      branchId: params.branchId,
      page: params.page,
      limit: params.limit,
    },
  });
}

export async function getHoldDays() {
  return unwrapOrThrow(await get<{ holdDays: number }>(`${BASE}/config`));
}

export async function updateHoldDays(holdDays: number) {
  return unwrapOrThrow(
    await patch<{ holdDays: number }>(`${BASE}/config`, { holdDays }),
  );
}

export async function extendHold(
  holdId: number,
  payload: { expiresAt: string; reason: string },
) {
  return unwrapOrThrow(await post(`${BASE}/holds/${holdId}/extend`, payload));
}

export async function releaseHold(holdId: number, reason: string) {
  return unwrapOrThrow(
    await post(`${BASE}/holds/${holdId}/release`, { reason }),
  );
}
