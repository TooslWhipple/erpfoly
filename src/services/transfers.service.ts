import { api, get, patch, post, type ApiResult } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import { printPdfBlob } from "@/lib/printing";
import type { CreateOrderResponse } from "@/types/orders.types";
import type { ScheduleBranchRequestPayload } from "@/types/solicitudes.types";
import type {
  CancelTransferPayload,
  CorrectShipmentPayload,
  CreateTransferPayload,
  EscalateIncidentPayload,
  QueryTransferIncidentsParams,
  QueryTransfersParams,
  ReportIncidentPayload,
  ResolveIncidentPayload,
  ShipTransferPayload,
  TransferDetail,
  TransferDocumentKind,
  TransferIncidentView,
  TransferIncidentsPage,
  TransferListItem,
  TransferNotesPayload,
  TransferStats,
  UpdateTransferPayload,
} from "@/types/transfers.types";

const TRANSFERS_BASE = "/transfers";

/** Los errores de las acciones se muestran en la propia pantalla, no como toast global. */
const ACTION_CONFIG = { skipGlobalErrorToast: true } as const;

export async function getTransfers(
  params: QueryTransfersParams,
): Promise<
  ApiResult<{ rows: TransferListItem[]; total: number; page: number; limit: number }>
> {
  return get(buildListUrl(TRANSFERS_BASE, params));
}

export async function getTransferStats(
  branchId?: number,
): Promise<ApiResult<TransferStats>> {
  return get<TransferStats>(buildListUrl(`${TRANSFERS_BASE}/stats`, { branch_id: branchId }));
}

export async function getTransfer(id: number): Promise<ApiResult<TransferDetail>> {
  return get<TransferDetail>(`${TRANSFERS_BASE}/${id}`);
}

export async function createTransfer(
  payload: CreateTransferPayload,
): Promise<ApiResult<CreateOrderResponse>> {
  return post<CreateOrderResponse>(TRANSFERS_BASE, payload);
}

export async function updateTransfer(
  id: number,
  payload: UpdateTransferPayload,
): Promise<ApiResult<CreateOrderResponse>> {
  return patch<CreateOrderResponse>(`${TRANSFERS_BASE}/${id}`, payload);
}

export async function scheduleTransfer(
  id: number,
  payload: ScheduleBranchRequestPayload,
): Promise<ApiResult<CreateOrderResponse>> {
  return patch<CreateOrderResponse>(`${TRANSFERS_BASE}/${id}/schedule`, payload);
}

export async function shipTransfer(
  id: number,
  payload: ShipTransferPayload,
): Promise<ApiResult<TransferDetail>> {
  return post<TransferDetail>(`${TRANSFERS_BASE}/${id}/ship`, payload, ACTION_CONFIG);
}

export async function receiveTransfer(
  id: number,
  payload: TransferNotesPayload,
): Promise<ApiResult<TransferDetail>> {
  return post<TransferDetail>(`${TRANSFERS_BASE}/${id}/receive`, payload, ACTION_CONFIG);
}

export async function cancelTransfer(
  id: number,
  payload: CancelTransferPayload,
): Promise<ApiResult<TransferDetail>> {
  return post<TransferDetail>(`${TRANSFERS_BASE}/${id}/cancel`, payload, ACTION_CONFIG);
}

export async function reportTransferIncident(
  id: number,
  payload: ReportIncidentPayload,
): Promise<ApiResult<TransferDetail>> {
  const formData = new FormData();
  formData.append("items", JSON.stringify(payload.items));
  formData.append("description", payload.description);
  payload.evidence.forEach((file) => formData.append("evidence", file));
  return post<TransferDetail>(`${TRANSFERS_BASE}/${id}/incidents`, formData, {
    ...ACTION_CONFIG,
    transformRequest: (data, headers) => {
      if (data instanceof FormData && headers) {
        delete headers["Content-Type"];
      }
      return data;
    },
  });
}

export async function correctTransferShipment(
  id: number,
  incidentId: number,
  payload: CorrectShipmentPayload,
): Promise<ApiResult<TransferDetail>> {
  return post<TransferDetail>(
    `${TRANSFERS_BASE}/${id}/incidents/${incidentId}/correct-shipment`,
    payload,
    ACTION_CONFIG,
  );
}

export async function escalateTransferIncident(
  id: number,
  incidentId: number,
  payload: EscalateIncidentPayload,
): Promise<ApiResult<TransferDetail>> {
  return post<TransferDetail>(
    `${TRANSFERS_BASE}/${id}/incidents/${incidentId}/escalate`,
    payload,
    ACTION_CONFIG,
  );
}

export async function withdrawTransferIncident(
  id: number,
  incidentId: number,
  payload: TransferNotesPayload,
): Promise<ApiResult<TransferDetail>> {
  return post<TransferDetail>(
    `${TRANSFERS_BASE}/${id}/incidents/${incidentId}/withdraw`,
    payload,
    ACTION_CONFIG,
  );
}

export async function getTransferIncidents(
  params: QueryTransferIncidentsParams,
): Promise<ApiResult<TransferIncidentsPage>> {
  return get<TransferIncidentsPage>(buildListUrl(`${TRANSFERS_BASE}/incidents`, params));
}

export async function resolveTransferIncident(
  incidentId: number,
  payload: ResolveIncidentPayload,
): Promise<ApiResult<TransferIncidentView>> {
  return post<TransferIncidentView>(
    `${TRANSFERS_BASE}/incidents/${incidentId}/resolve`,
    payload,
    ACTION_CONFIG,
  );
}

export async function printTransferDocument(
  id: number,
  kind: TransferDocumentKind,
): Promise<void> {
  const response = await api.get(`${TRANSFERS_BASE}/${id}/document`, {
    params: { kind },
    responseType: "blob",
  });
  await printPdfBlob(new Blob([response.data], { type: "application/pdf" }));
}
