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
  ExpenseRequestDetail,
  ExpenseRequestListItem,
  ListExpenseRequestsParams,
  ReviewExpenseVoucherPayload,
  UpdateExpenseRequestPayload,
} from "@/types/expense-requests.types";
import type {
  FundPettyCashPayload,
  FundPettyCashResponse,
  PettyCashBranchOverview,
  PettyCashMovementItem,
  PettyCashMovementsResponse,
  PettyCashOpenRegister,
} from "@/types/petty-cash.types";

const BASE = "/petty-cash";

export async function getPettyCashOverview(): Promise<
  ApiResult<PettyCashBranchOverview[]>
> {
  return get<PettyCashBranchOverview[]>(BASE);
}

export async function getPettyCashOpenRegisters(
  branchId: number | string,
): Promise<ApiResult<PettyCashOpenRegister[]>> {
  return get<PettyCashOpenRegister[]>(`${BASE}/${branchId}/open-registers`);
}

export async function getPettyCashMovements(
  branchId: number | string,
  params: { page?: number; limit?: number },
): Promise<ApiResult<PaginatedRowsResponse<PettyCashMovementItem>>> {
  const result = await get<PettyCashMovementsResponse>(
    buildListUrl(`${BASE}/${branchId}/movements`, params),
  );
  if (result.data) {
    return {
      ...result,
      data: {
        rows: result.data.rows,
        total: result.data.total,
        totalPages: result.data.totalPages,
        page: result.data.page,
        limit: result.data.limit,
      },
    };
  }
  return result as ApiResult<PaginatedRowsResponse<PettyCashMovementItem>>;
}

export async function fundPettyCash(
  branchId: number | string,
  payload: FundPettyCashPayload,
): Promise<ApiResult<FundPettyCashResponse>> {
  return post<FundPettyCashResponse>(`${BASE}/${branchId}/fund`, payload);
}

export async function getPettyCashRequests(
  params: ListExpenseRequestsParams,
): Promise<ApiResult<PaginatedRowsResponse<ExpenseRequestListItem>>> {
  const result = await get<any>(buildListUrl(`${BASE}/requests`, params));
  if (result.data) {
    const raw = result.data;
    const rows: ExpenseRequestListItem[] =
      raw.rows ?? raw.data ?? (Array.isArray(raw) ? raw : []);
    const total = raw.total ?? rows.length;
    const limit = raw.limit ?? params.limit ?? 10;
    const page = raw.page ?? params.page ?? 1;
    const totalPages = raw.totalPages ?? Math.max(1, Math.ceil(total / limit));
    return {
      ...result,
      data: { rows, total, totalPages, page, limit },
    };
  }
  return result;
}

export async function getPettyCashRequestById(
  id: number | string,
): Promise<ApiResult<ExpenseRequestDetail>> {
  return get<ExpenseRequestDetail>(`${BASE}/requests/${id}`);
}

export async function createPettyCashRequest(
  payload: CreateExpenseRequestPayload,
): Promise<ApiResult<ExpenseRequestDetail>> {
  return post<ExpenseRequestDetail>(`${BASE}/requests`, payload);
}

export async function updatePettyCashRequest(
  id: number | string,
  payload: UpdateExpenseRequestPayload,
): Promise<ApiResult<ExpenseRequestDetail>> {
  return patch<ExpenseRequestDetail>(`${BASE}/requests/${id}`, payload);
}

export async function sendToAuthorizePettyCashRequest(
  id: number | string,
): Promise<ApiResult<ExpenseRequestDetail>> {
  return post<ExpenseRequestDetail>(`${BASE}/requests/${id}/submit`);
}

export async function authorizePettyCashRequest(
  id: number | string,
): Promise<ApiResult<ExpenseRequestDetail>> {
  return post<ExpenseRequestDetail>(`${BASE}/requests/${id}/authorize`);
}

export async function rejectPettyCashRequest(
  id: number | string,
  reason: string,
): Promise<ApiResult<ExpenseRequestDetail>> {
  return post<ExpenseRequestDetail>(`${BASE}/requests/${id}/reject`, { reason });
}

export async function addPettyCashVoucher(
  id: number | string,
  payload: CreateExpenseVoucherPayload,
): Promise<ApiResult<ExpenseRequestDetail>> {
  const formData = new FormData();
  if (payload.date) formData.append("date", payload.date);
  if (payload.concept) formData.append("concept", payload.concept);
  if (
    payload.amount !== undefined &&
    payload.amount !== null &&
    !Number.isNaN(payload.amount)
  ) {
    formData.append("amount", String(payload.amount));
  }
  if (payload.supplierName) formData.append("supplierName", payload.supplierName);
  if (payload.supplierRfc) formData.append("supplierRfc", payload.supplierRfc);
  if (payload.fiscalUuid) formData.append("fiscalUuid", payload.fiscalUuid);
  if (payload.paymentForm) formData.append("paymentForm", payload.paymentForm);
  if (payload.paymentMethod) formData.append("paymentMethod", payload.paymentMethod);
  if (payload.cfdiUsage) formData.append("cfdiUsage", payload.cfdiUsage);
  if (payload.xmlFile) formData.append("xml", payload.xmlFile);
  if (payload.pdfFile) formData.append("pdf", payload.pdfFile);
  if (payload.imageFile) formData.append("image", payload.imageFile);

  return post<ExpenseRequestDetail>(`${BASE}/requests/${id}/vouchers`, formData, {
    transformRequest: (data, headers) => {
      if (data instanceof FormData && headers) {
        delete headers["Content-Type"];
      }
      return data;
    },
  });
}

export async function reviewPettyCashVoucher(
  id: number | string,
  voucherId: number | string,
  payload: ReviewExpenseVoucherPayload,
): Promise<ApiResult<ExpenseRequestDetail>> {
  return patch<ExpenseRequestDetail>(
    `${BASE}/requests/${id}/vouchers/${voucherId}/review`,
    payload,
  );
}

export async function deletePettyCashVoucher(
  id: number | string,
  voucherId: number | string,
): Promise<ApiResult<ExpenseRequestDetail>> {
  return del<ExpenseRequestDetail>(`${BASE}/requests/${id}/vouchers/${voucherId}`);
}

export async function concludePettyCashRequest(
  id: number | string,
  payload?: CompleteExpenseVerificationPayload,
): Promise<ApiResult<ExpenseRequestDetail>> {
  return post<ExpenseRequestDetail>(
    `${BASE}/requests/${id}/conclude`,
    payload ?? {},
  );
}

export async function returnPettyCashDifference(
  id: number | string,
  payload: { bank: string; checkNumber: string; cashRegisterId?: number },
): Promise<
  ApiResult<{
    requestId: number;
    branchId: number;
    cashMovementId: number;
    returnedAmount: number;
    newBalance: number;
  }>
> {
  return post(`${BASE}/requests/${id}/return-to-fund`, payload);
}

export async function returnAllPettyCashDifferences(
  branchId: number | string,
  payload: { bank: string; checkNumber: string; cashRegisterId?: number },
): Promise<
  ApiResult<{
    branchId: number;
    count: number;
    cashMovementId: number;
    returnedAmount: number;
    newBalance: number;
  }>
> {
  return post(`${BASE}/${branchId}/return-all-pending`, payload);
}
