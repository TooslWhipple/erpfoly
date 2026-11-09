import {
  del,
  get,
  patch,
  post,
  type ApiResult,
  type PaginatedRowsResponse,
} from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  CompleteExpenseVerificationPayload,
  CreateExpenseRequestPayload,
  CreateExpenseVoucherPayload,
  DisperseExpenseRequestsPayload,
  ExpenseRequestClassification,
  ExpenseRequestDetail,
  ExpenseRequestListItem,
  ExpenseRequestStatus,
  ExpenseRequestsSummary,
  ListExpenseRequestsParams,
  PaymentScheduleResponse,
  RejectExpenseRequestPayload,
  ReviewExpenseVoucherPayload,
  ScheduledPaymentCategory,
  ScheduledPaymentStatus,
  UpdateExpenseRequestPayload,
} from "@/types/expense-requests.types";

const BASE = "/expense-requests";

export type GetExpenseRequestsResponse =
  PaginatedRowsResponse<ExpenseRequestListItem>;

export async function getExpenseRequests(
  params: ListExpenseRequestsParams,
): Promise<ApiResult<GetExpenseRequestsResponse>> {
  const result = await get<any>(buildListUrl(BASE, params));
  if (result.data) {
    const raw = result.data;
    const rows: ExpenseRequestListItem[] =
      raw.rows ??
      raw.data ??
      (Array.isArray(raw) ? raw : []);
    const total = raw.total ?? rows.length;
    const limit = raw.limit ?? params.limit ?? 10;
    const page = raw.page ?? params.page ?? 1;
    const totalPages = raw.totalPages ?? Math.max(1, Math.ceil(total / limit));

    return {
      ...result,
      data: {
        rows,
        total,
        totalPages,
        page,
        limit,
      },
    };
  }
  return result;
}

import type { DiverseDebtorListItem } from "@/types/diverse-debtors.types";

export interface MyExpenseRequestContext {
  userId: number | null;
  diverseDebtorId: number | null;
  debtor: DiverseDebtorListItem | null;
  branches?: Array<{ id: number; name: string }>;
  categories?: Array<{
    id: string;
    code: string;
    name: string;
    description: string | null;
    configuration: "VIATICOS" | "SOLICITUD_GASTOS";
    status: "ACTIVE" | "INACTIVE";
  }>;
}

export async function getMyExpenseRequestContext(): Promise<
  ApiResult<MyExpenseRequestContext>
> {
  return get<MyExpenseRequestContext>(`${BASE}/my-context`);
}

export async function getExpenseRequestsSummary(params?: {
  classification?: ExpenseRequestClassification;
  status?: ExpenseRequestStatus;
}): Promise<ApiResult<ExpenseRequestsSummary>> {
  const url = params ? buildListUrl(`${BASE}/summary`, params) : `${BASE}/summary`;
  return get<ExpenseRequestsSummary>(url);
}

export async function getExpenseRequestById(
  id: number | string,
): Promise<ApiResult<ExpenseRequestDetail>> {
  return get<ExpenseRequestDetail>(`${BASE}/${id}`);
}

export async function createExpenseRequest(
  payload: CreateExpenseRequestPayload,
): Promise<ApiResult<ExpenseRequestDetail>> {
  return post<ExpenseRequestDetail>(BASE, payload);
}

export async function updateExpenseRequest(
  id: number | string,
  payload: UpdateExpenseRequestPayload,
): Promise<ApiResult<ExpenseRequestDetail>> {
  return patch<ExpenseRequestDetail>(`${BASE}/${id}`, payload);
}

export async function sendToAuthorizeExpenseRequest(
  id: number | string,
): Promise<ApiResult<ExpenseRequestDetail>> {
  return post<ExpenseRequestDetail>(`${BASE}/${id}/submit`);
}

export async function authorizeExpenseRequest(
  id: number | string,
): Promise<ApiResult<ExpenseRequestDetail>> {
  return post<ExpenseRequestDetail>(`${BASE}/${id}/authorize`);
}

export async function rejectExpenseRequest(
  id: number | string,
  payload: RejectExpenseRequestPayload,
): Promise<ApiResult<ExpenseRequestDetail>> {
  return post<ExpenseRequestDetail>(`${BASE}/${id}/reject`, payload);
}

export async function addExpenseVoucher(
  id: number | string,
  payload: CreateExpenseVoucherPayload,
): Promise<ApiResult<ExpenseRequestDetail>> {
  const formData = new FormData();
  formData.append("date", payload.date);
  formData.append("concept", payload.concept);
  formData.append("amount", String(payload.amount));
  if (payload.supplierName) formData.append("supplierName", payload.supplierName);
  if (payload.supplierRfc) formData.append("supplierRfc", payload.supplierRfc);
  if (payload.fiscalUuid) formData.append("fiscalUuid", payload.fiscalUuid);

  if (payload.xmlFile) formData.append("xml", payload.xmlFile);
  if (payload.pdfFile) formData.append("pdf", payload.pdfFile);
  if (payload.imageFile) formData.append("image", payload.imageFile);

  return post<ExpenseRequestDetail>(`${BASE}/${id}/vouchers`, formData);
}

export async function reviewExpenseVoucher(
  requestId: number | string,
  voucherId: number | string,
  payload: ReviewExpenseVoucherPayload,
): Promise<ApiResult<ExpenseRequestDetail>> {
  return patch<ExpenseRequestDetail>(
    `${BASE}/${requestId}/vouchers/${voucherId}/review`,
    payload,
  );
}

export async function deleteExpenseVoucher(
  requestId: number | string,
  voucherId: number | string,
): Promise<ApiResult<ExpenseRequestDetail>> {
  return del<ExpenseRequestDetail>(
    `${BASE}/${requestId}/vouchers/${voucherId}`,
  );
}

export async function concludeExpenseRequest(
  id: number | string,
  payload?: CompleteExpenseVerificationPayload,
): Promise<ApiResult<ExpenseRequestDetail>> {
  return post<ExpenseRequestDetail>(`${BASE}/${id}/conclude`, payload ?? {});
}

export async function getPaymentSchedule(params?: {
  scheduledDate?: string;
  category?: ScheduledPaymentCategory;
  status?: ScheduledPaymentStatus;
  dispersionStatus?: "PENDING" | "DISPERSED" | "ALL";
  search?: string;
}): Promise<ApiResult<PaymentScheduleResponse>> {
  const url = params
    ? buildListUrl(`${BASE}/payment-schedule`, params)
    : `${BASE}/payment-schedule`;
  return get<PaymentScheduleResponse>(url);
}

export async function updateScheduledPaymentSelection(
  id: number | string,
  payload: {
    selectedForDispersion?: boolean;
    scheduledDate?: string;
  },
): Promise<
  ApiResult<{
    id: number;
    selectedForDispersion: boolean;
    scheduledDate: string;
  }>
> {
  return patch(`${BASE}/payment-schedule/${id}`, payload);
}

export async function updateExpenseRequestDispersionDate(
  id: number | string,
  dispersionDate: string,
): Promise<ApiResult<ExpenseRequestDetail>> {
  return patch<ExpenseRequestDetail>(`${BASE}/${id}/dispersion-date`, {
    dispersionDate,
  });
}

export async function disperseExpenseRequests(
  payload: DisperseExpenseRequestsPayload,
): Promise<
  ApiResult<{
    batchId: number;
    batchCode: string;
    dispersedCount: number;
    totalAmount: number;
    ids: number[];
    dispersedAt: string;
  }>
> {
  return post(`${BASE}/disperse`, payload);
}

export async function rescheduleScheduledPayments(payload: {
  ids: number[];
  scheduledDate: string;
}): Promise<
  ApiResult<{
    rescheduledCount: number;
    scheduledDate: string;
    ids: number[];
  }>
> {
  return post(`${BASE}/payment-schedule/reschedule`, payload);
}

export async function instantDisperseScheduledPayment(
  id: number | string,
): Promise<
  ApiResult<{
    id: number;
    folio: string;
    beneficiary: string;
    amount: number;
    status: ScheduledPaymentStatus;
    dispersionMethod: string;
    paymentReference: string;
    dispersedAt: string;
  }>
> {
  return post(`${BASE}/payment-schedule/${id}/instant-stp`);
}



