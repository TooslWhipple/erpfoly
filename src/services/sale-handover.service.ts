import { api, get, patch, post } from "@/lib/axios";
import type {
  ApiResult,
  AxiosConfigWithSkipToast,
  PaginatedRowsResponse,
} from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import { downloadBlob, printPdfBlob } from "@/lib/printing";
import type {
  ConfirmHandoverRequest,
  DeliveryConfig,
  ExtendHoldRequest,
  GetHoldsParams,
  HandoverEvidenceResponse,
  HandoverEvidenceSide,
  HoldDetail,
  HoldRow,
  ReleaseHoldRequest,
  ReleaseHoldResponse,
  UpdateDeliveryConfigRequest,
  GetHandoverQueueParams,
  HandoverBranch,
  HandoverFileKind,
  HandoverHistoryEntry,
  HandoverOtpSendRequest,
  HandoverOtpSendResponse,
  HandoverOtpVerifyRequest,
  HandoverOtpVerifyResponse,
  HandoverReceiptFormat,
  HandoverResendChannel,
  HandoverResendResponse,
  HandoverResult,
  HandoverSaleDetail,
  HandoverSupervisorAuthorizationRequest,
  HandoverSupervisorAuthorizationResponse,
  QueueRow,
  UploadHandoverFileResponse,
} from "@/types/saleHandover.types";

const BASE = "/sale-handovers";

export function getHandoverBranches(): Promise<ApiResult<HandoverBranch[]>> {
  return get<HandoverBranch[]>(`${BASE}/branches`);
}

export function getHandoverQueue(
  params: GetHandoverQueueParams,
): Promise<ApiResult<PaginatedRowsResponse<QueueRow>>> {
  return get<PaginatedRowsResponse<QueueRow>>(buildListUrl(BASE, params));
}

export function getHandoverSaleDetail(
  saleId: number,
  branchId: number,
  config?: AxiosConfigWithSkipToast,
): Promise<ApiResult<HandoverSaleDetail>> {
  return get<HandoverSaleDetail>(
    `${BASE}/sales/${saleId}?branchId=${branchId}`,
    config,
  );
}

export function uploadHandoverFile(
  file: Blob,
  kind: HandoverFileKind,
  filename: string,
): Promise<ApiResult<UploadHandoverFileResponse>> {
  const formData = new FormData();
  formData.append("file", file, filename);
  formData.append("kind", kind);
  return post<UploadHandoverFileResponse>(`${BASE}/files`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function requestHandoverOtp(
  saleId: number,
  payload: HandoverOtpSendRequest,
): Promise<ApiResult<HandoverOtpSendResponse>> {
  return post<HandoverOtpSendResponse>(
    `${BASE}/sales/${saleId}/otp`,
    payload,
    { skipGlobalErrorToast: true },
  );
}

export function verifyHandoverOtp(
  saleId: number,
  payload: HandoverOtpVerifyRequest,
): Promise<ApiResult<HandoverOtpVerifyResponse>> {
  return post<HandoverOtpVerifyResponse>(
    `${BASE}/sales/${saleId}/otp/verify`,
    payload,
    { skipGlobalErrorToast: true },
  );
}

export function authorizeHandoverWithSupervisor(
  saleId: number,
  payload: HandoverSupervisorAuthorizationRequest,
): Promise<ApiResult<HandoverSupervisorAuthorizationResponse>> {
  return post<HandoverSupervisorAuthorizationResponse>(
    `${BASE}/sales/${saleId}/supervisor-authorization`,
    payload,
    { skipGlobalErrorToast: true },
  );
}

export function confirmHandover(
  payload: ConfirmHandoverRequest,
): Promise<ApiResult<HandoverResult>> {
  return post<HandoverResult>(BASE, payload, { skipGlobalErrorToast: true });
}

export function getSaleHandovers(
  saleId: number,
): Promise<ApiResult<HandoverHistoryEntry[]>> {
  return get<HandoverHistoryEntry[]>(`${BASE}/sales/${saleId}/handovers`);
}

export function resendHandoverReceipt(
  handoverId: number,
  channels: HandoverResendChannel[],
): Promise<ApiResult<HandoverResendResponse>> {
  return post<HandoverResendResponse>(`${BASE}/${handoverId}/resend`, {
    channels,
  });
}

async function fetchPdf(
  url: string,
  fallbackFilename: string,
): Promise<{ blob: Blob; filename: string }> {
  const response = await api.get(url, { responseType: "blob" });
  const contentType =
    (response.headers["content-type"] as string | undefined) ??
    "application/pdf";
  const contentDisposition = response.headers["content-disposition"] as
    | string
    | undefined;
  let filename = fallbackFilename;
  const match = contentDisposition?.match(/filename="?([^";]+)"?/);
  if (match?.[1]) filename = match[1];
  return { blob: new Blob([response.data], { type: contentType }), filename };
}

export async function downloadHandoverReceipt(
  handoverId: number,
  format: HandoverReceiptFormat = "letter",
): Promise<void> {
  const { blob, filename } = await fetchPdf(
    `${BASE}/${handoverId}/receipt?format=${format}`,
    `comprobante-entrega-${handoverId}.pdf`,
  );
  downloadBlob(blob, filename);
}

export async function printHandoverReceipt(
  handoverId: number,
  format: HandoverReceiptFormat = "thermal80",
): Promise<void> {
  const { blob } = await fetchPdf(
    `${BASE}/${handoverId}/receipt?format=${format}`,
    `comprobante-entrega-${handoverId}.pdf`,
  );
  await printPdfBlob(blob);
}

export async function printSaleTicket(saleId: number): Promise<void> {
  const { blob } = await fetchPdf(
    `/pos/sales/${saleId}/ticket?format=thermal80`,
    `ticket-venta-${saleId}.pdf`,
  );
  await printPdfBlob(blob);
}

export function getHolds(
  params: GetHoldsParams,
): Promise<ApiResult<PaginatedRowsResponse<HoldRow>>> {
  return get<PaginatedRowsResponse<HoldRow>>(
    buildListUrl(`${BASE}/holds`, params),
  );
}

export function getHoldDetail(saleId: number): Promise<ApiResult<HoldDetail>> {
  return get<HoldDetail>(`${BASE}/holds/${saleId}`);
}

export function extendHold(
  saleId: number,
  payload: ExtendHoldRequest,
): Promise<ApiResult<HoldRow>> {
  return post<HoldRow>(`${BASE}/holds/${saleId}/extend`, payload, {
    skipGlobalErrorToast: true,
  });
}

export function releaseHold(
  saleId: number,
  payload: ReleaseHoldRequest,
): Promise<ApiResult<ReleaseHoldResponse>> {
  return post<ReleaseHoldResponse>(`${BASE}/holds/${saleId}/release`, payload, {
    skipGlobalErrorToast: true,
  });
}

export function getHandoverEvidenceUrl(
  handoverId: number,
  side: HandoverEvidenceSide,
): Promise<ApiResult<HandoverEvidenceResponse>> {
  return get<HandoverEvidenceResponse>(
    `${BASE}/${handoverId}/evidences/${side}`,
    { skipGlobalErrorToast: true },
  );
}

export function getDeliveryConfig(): Promise<ApiResult<DeliveryConfig>> {
  return get<DeliveryConfig>("/pos/delivery-config");
}

export function updateDeliveryConfig(
  payload: UpdateDeliveryConfigRequest,
): Promise<ApiResult<DeliveryConfig>> {
  return patch<DeliveryConfig>("/pos/delivery-config", payload, {
    skipGlobalErrorToast: true,
  });
}
