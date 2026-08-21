import { api, get, post, patch, del } from "@/lib/axios";
import { unwrapOrThrow } from "@/lib/axios";
import type { ApiResult, PaginatedRowsResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import { dataUrlToFile } from "@/utils/creditApplicationIntake";
import { downloadBlob, printPdfBlob } from "@/lib/printing";
import type {
  SaleListItem,
  GetSalesParams,
  ProductSearchResult,
  ProductDetail,
  SaleDetail,
  DeliveryAvailabilityItem,
  SetDeliveryDatePayload,
  DiscountRequestReason,
  RedDeliveryListItem,
  GetRedDeliveriesParams,
  CancelRedDeliveryPayload,
} from "@/types/ventas.types";

export type { SaleListItem, GetSalesParams };

const BASE = "/pos";

export type GetSalesResponse = PaginatedRowsResponse<SaleListItem>;

export async function getSales(
  params: GetSalesParams,
): Promise<ApiResult<GetSalesResponse>> {
  return get<GetSalesResponse>(buildListUrl(`${BASE}/sales`, params));
}

export interface SearchProductsParams {
  search?: string;
  page?: number;
  limit?: number;
}

export type SearchProductsResponse = PaginatedRowsResponse<ProductSearchResult>;

export async function searchProducts(
  params: SearchProductsParams,
): Promise<ApiResult<SearchProductsResponse>> {
  return get<SearchProductsResponse>(
    buildListUrl(`${BASE}/products/search`, params),
  );
}

export async function getProductDetail(
  productId: number,
  currentBranchId?: number,
  includeOthers?: boolean,
): Promise<ApiResult<ProductDetail>> {
  const params = new URLSearchParams();
  if (currentBranchId !== undefined) {
    params.set("currentBranchId", String(currentBranchId));
  }
  if (includeOthers) {
    params.set("includeOthers", "true");
  }
  const query = params.toString();
  return get<ProductDetail>(
    `${BASE}/products/${productId}/detail${query ? `?${query}` : ""}`,
  );
}

export interface PurchaseType {
  id: number;
  code: string;
  name: string;
}

export async function getPurchaseTypes(): Promise<ApiResult<PurchaseType[]>> {
  return get<PurchaseType[]>(`${BASE}/purchase-types`);
}

export interface LayawayTerm {
  id: number;
  code: string;
  name: string;
  days: number;
}

export async function getLayawayTerms(): Promise<ApiResult<LayawayTerm[]>> {
  return get<LayawayTerm[]>(`${BASE}/layaway-terms`);
}

export interface CreateLayawayPayload {
  layaway_term_id: number;
  deposit_amount: number;
  payment_method: "CASH" | "CARD";
  payment_terminal_id?: number;
}

export async function createLayaway(
  saleId: number,
  payload: CreateLayawayPayload,
): Promise<ApiResult<{ id: number; sale_id: number }>> {
  return post<{ id: number; sale_id: number }>(
    `${BASE}/sales/${saleId}/layaways`,
    payload,
  );
}

export interface RegisterLayawayPaymentPayload {
  payment_method: "CASH" | "CARD" | "TRANSFER";
  amount: number;
  notes?: string;
  payment_terminal_id?: number;
}

export async function registerLayawayPayment(
  layawayId: number,
  payload: RegisterLayawayPaymentPayload,
): Promise<ApiResult<unknown>> {
  return post<unknown>(`${BASE}/layaways/${layawayId}/payments`, payload);
}

export async function completeLayaway(
  layawayId: number,
): Promise<ApiResult<{ success: boolean; message: string }>> {
  return post<{ success: boolean; message: string }>(
    `${BASE}/layaways/${layawayId}/complete`,
  );
}

export async function cancelLayaway(
  layawayId: number,
): Promise<ApiResult<{ success: boolean; message: string }>> {
  return post<{ success: boolean; message: string }>(
    `${BASE}/layaways/${layawayId}/cancel`,
  );
}

export interface CreateSaleDraftPayload {
  branch_id: number;
  purchase_type_id: number;
  client_id?: number;
  origin: "STORE" | "ONLINE" | "PHONE";
  notes?: string;
}

export async function createSaleDraft(
  payload: CreateSaleDraftPayload,
): Promise<ApiResult<{ id: number; folio: string }>> {
  return post<{ id: number; folio: string }>(`${BASE}/sales`, payload);
}

export async function updateSaleClient(
  saleId: number,
  clientId: number,
): Promise<ApiResult<unknown>> {
  return patch<unknown>(`${BASE}/sales/${saleId}/client`, {
    client_id: clientId,
  });
}

export async function updateSaleLayawayTerm(
  saleId: number,
  layawayTermId: number,
): Promise<ApiResult<unknown>> {
  return patch<unknown>(`${BASE}/sales/${saleId}/layaway-term`, {
    layaway_term_id: layawayTermId,
  });
}

export interface AddSaleItemPayload {
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
}

export async function addSaleItem(
  saleId: number,
  payload: AddSaleItemPayload,
): Promise<ApiResult<unknown>> {
  return post<unknown>(`${BASE}/sales/${saleId}/items`, payload);
}

export interface UpdateSaleItemPayload {
  quantity?: number;
  unit_price?: number;
  discount_amount?: number;
}

export async function updateSaleItem(
  saleId: number,
  itemId: number,
  payload: UpdateSaleItemPayload,
): Promise<ApiResult<unknown>> {
  return patch<unknown>(`${BASE}/sales/${saleId}/items/${itemId}`, payload);
}

export async function removeSaleItem(
  saleId: number,
  itemId: number,
): Promise<ApiResult<unknown>> {
  return del<unknown>(`${BASE}/sales/${saleId}/items/${itemId}`);
}

export interface RequestSaleDiscountPayload {
  reason: DiscountRequestReason;
  notes?: string;
}

export async function requestSaleDiscount(
  saleId: number,
  payload: RequestSaleDiscountPayload,
): Promise<ApiResult<unknown>> {
  return post<unknown>(`${BASE}/sales/${saleId}/discounts`, payload);
}

export async function invalidateSaleDiscount(
  discountRequestId: number,
): Promise<ApiResult<unknown>> {
  return post<unknown>(`${BASE}/discount-requests/${discountRequestId}/invalidate`, {});
}

export interface RegisterPaymentPayload {
  payment_method: "CASH" | "CARD" | "TRANSFER";
  amount: number;
  received_amount?: number;
  change_amount?: number;
  payment_terminal_id?: number;
}

export async function registerSalePayment(
  saleId: number,
  payload: RegisterPaymentPayload,
): Promise<ApiResult<unknown>> {
  return post<unknown>(`${BASE}/sales/${saleId}/payments`, payload);
}

export interface SaleInvoiceBillingPayload {
  rfc?: string;
  business_name?: string;
  tax_regime_id?: string;
  cfdi_use_id?: string;
  neighborhood_code?: string;
  street?: string;
  external_number?: string;
  postal_code?: string;
  email?: string;
}

export async function confirmSalePayment(
  saleId: number,
  payload?: SaleInvoiceBillingPayload,
): Promise<ApiResult<{ id: number; folio: string; status: string }>> {
  return post<{ id: number; folio: string; status: string }>(
    `${BASE}/sales/${saleId}/confirm`,
    payload,
  );
}

export interface ConfirmCreditSalePayload extends SaleInvoiceBillingPayload {
  term_months: number;
  down_payment: number;
  payment_method: "CASH" | "CARD";
  payment_terminal_id?: number;
}

export async function confirmCreditSale(
  saleId: number,
  payload: ConfirmCreditSalePayload,
): Promise<ApiResult<{ id: number; folio: string; status: string }>> {
  return post<{ id: number; folio: string; status: string }>(
    `${BASE}/sales/${saleId}/confirm-credit`,
    payload,
  );
}

export interface VerifySaleIdentityResult {
  id: number;
  identity_verification_selfie_url: string | null;
  identity_verification_execution_id: string | null;
  identity_verified_at: string | null;
}

export async function verifySaleIdentity(
  saleId: number,
  faceDataUrl: string,
  executionId?: string,
): Promise<ApiResult<VerifySaleIdentityResult>> {
  const formData = new FormData();
  formData.append("faceCapture", dataUrlToFile(faceDataUrl, "face-capture"));
  if (executionId) {
    formData.append("executionId", executionId);
  }

  return post<VerifySaleIdentityResult>(
    `${BASE}/sales/${saleId}/identity-verification`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
}

export interface ValidateSupervisorResult {
  userId: number;
  firstName: string;
  lastName: string;
}

export async function validateSupervisor(
  username: string,
  password: string,
): Promise<ApiResult<ValidateSupervisorResult>> {
  return post<ValidateSupervisorResult>("/auth/validate-supervisor", {
    username,
    password,
  });
}

export async function skipSaleIdentityVerification(
  saleId: number,
  reason: string,
  supervisorUserId: number,
): Promise<ApiResult<VerifySaleIdentityResult>> {
  return post<VerifySaleIdentityResult>(
    `${BASE}/sales/${saleId}/identity-verification/skip`,
    { reason, supervisorUserId },
  );
}

export async function registerSale(
  saleId: number,
): Promise<ApiResult<{ id: number; folio: string; status: string }>> {
  return post<{ id: number; folio: string; status: string }>(
    `${BASE}/sales/${saleId}/register`,
  );
}

export async function cancelSale(saleId: number): Promise<ApiResult<unknown>> {
  return del<unknown>(`${BASE}/sales/${saleId}`);
}

export async function getSaleDetail(
  saleId: number,
): Promise<ApiResult<SaleDetail>> {
  return get<SaleDetail>(`${BASE}/sales/${saleId}`);
}

export async function getDeliveryAvailability(
  month: number,
  year: number,
  branchId?: number,
): Promise<DeliveryAvailabilityItem[]> {
  const params = new URLSearchParams({
    month: String(month),
    year: String(year),
  });
  if (branchId) params.append("branch_id", String(branchId));
  return unwrapOrThrow(
    await get<DeliveryAvailabilityItem[]>(
      `${BASE}/delivery-availability?${params.toString()}`,
    ),
  );
}

export async function setDeliveryDate(
  saleId: number,
  payload: SetDeliveryDatePayload,
): Promise<{ id: number; delivery_date: string }> {
  return unwrapOrThrow(
    await post<{ id: number; delivery_date: string }>(
      `${BASE}/sales/${saleId}/delivery-date`,
      payload,
    ),
  );
}

export async function removeDeliveryDate(saleId: number): Promise<void> {
  return unwrapOrThrow(
    await del<void>(`${BASE}/sales/${saleId}/delivery-date`),
  );
}

export interface SaleInvoiceStatusInfo {
  hasInvoice: boolean;
  uuid: string | null;
  hasXml: boolean;
  hasPdf: boolean;
  status: string;
}

export async function getSaleInvoiceStatus(
  saleId: number,
): Promise<SaleInvoiceStatusInfo> {
  const res = await get<SaleInvoiceStatusInfo>(`${BASE}/sales/${saleId}/invoice/status`);
  if (res.error || !res.data) {
    return { hasInvoice: false, uuid: null, hasXml: false, hasPdf: false, status: "NOT_FOUND" };
  }
  return res.data;
}

export async function downloadSaleInvoiceFile(
  saleId: number,
  type: "xml" | "pdf" | "zip",
): Promise<void> {
  const statusInfo = await getSaleInvoiceStatus(saleId);
  const defaultUuid = statusInfo?.uuid || String(saleId);

  const response = await api.get(`${BASE}/sales/${saleId}/invoice/${type}`, {
    responseType: "blob",
  });

  const contentType = (response.headers["content-type"] as string | undefined) ?? undefined;
  const contentDisposition = (response.headers["content-disposition"] as string | undefined) ?? undefined;
  let filename = `${defaultUuid}.${type}`;

  if (contentDisposition && typeof contentDisposition === "string") {
    const match = contentDisposition.match(/filename="?([^";]+)"?/);
    if (match && match[1]) {
      filename = match[1];
    }
  }

  const blob = new Blob([response.data], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function printAndDownloadSaleInvoicePdf(
  saleId: number,
): Promise<void> {
  const statusInfo = await getSaleInvoiceStatus(saleId);
  const defaultUuid = statusInfo?.uuid || String(saleId);

  const response = await api.get(`${BASE}/sales/${saleId}/invoice/pdf`, {
    responseType: "blob",
  });

  const contentType =
    (response.headers["content-type"] as string | undefined) ?? "application/pdf";
  const contentDisposition =
    (response.headers["content-disposition"] as string | undefined) ?? undefined;
  let filename = `${defaultUuid}.pdf`;

  if (contentDisposition && typeof contentDisposition === "string") {
    const match = contentDisposition.match(/filename="?([^";]+)"?/);
    if (match && match[1]) {
      filename = match[1];
    }
  }

  const blob = new Blob([response.data], { type: contentType });

  downloadBlob(blob, filename);
  await printPdfBlob(blob);
}

export async function printSaleInvoicePdfOnly(
  saleId: number,
): Promise<void> {
  const response = await api.get(`${BASE}/sales/${saleId}/invoice/pdf`, {
    responseType: "blob",
  });

  const contentType =
    (response.headers["content-type"] as string | undefined) ?? "application/pdf";

  const blob = new Blob([response.data], { type: contentType });
  await printPdfBlob(blob);
}

export type GetRedDeliveriesResponse = PaginatedRowsResponse<RedDeliveryListItem>;

export async function getRedDeliveries(
  params: GetRedDeliveriesParams,
): Promise<ApiResult<GetRedDeliveriesResponse>> {
  return get<GetRedDeliveriesResponse>(
    buildListUrl(`${BASE}/sales/red-deliveries`, params),
  );
}

export async function cancelRedDelivery(
  saleId: number,
  payload: CancelRedDeliveryPayload,
): Promise<ApiResult<unknown>> {
  return post<unknown>(
    `${BASE}/sales/${saleId}/delivery-review/cancel`,
    payload,
  );
}

export async function getInvoicingConfig(): Promise<{ facturacionConfirmacionVentaEnabled: boolean }> {
  const res: ApiResult<{ facturacionConfirmacionVentaEnabled: boolean }> = await get(`${BASE}/invoicing-config`);
  return unwrapOrThrow(res);
}
