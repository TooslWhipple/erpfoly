import { get, post, type ApiResult } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type { PaginatedRowsResponse } from "@/lib/axios";
import type {
  ApproveDiscountRequestPayload,
  DiscountRequest,
  DiscountRequestDetail,
  DiscountRequestStatus,
  GetDiscountRequestsParams,
  RejectDiscountRequestPayload,
} from "@/types/discount-requests.types";

const BASE = "/pos/discount-requests";

const STATUS_TO_API: Record<DiscountRequestStatus, string> = {
  pending: "PENDING",
  approved: "APPROVED",
  rejected: "REJECTED",
  invalidated: "INVALIDATED",
};

export type GetDiscountRequestsResponse = PaginatedRowsResponse<DiscountRequest>;

export async function getDiscountRequests(
  params: GetDiscountRequestsParams
): Promise<ApiResult<GetDiscountRequestsResponse>> {
  const queryParams: Record<string, unknown> = {
    page: params.page,
    limit: params.limit,
    search: params.search,
  };

  if (params.status) {
    queryParams.status = STATUS_TO_API[params.status];
  }

  return get<GetDiscountRequestsResponse>(buildListUrl(BASE, queryParams));
}

export async function getDiscountRequestDetail(
  id: number
): Promise<ApiResult<DiscountRequestDetail>> {
  return get<DiscountRequestDetail>(`${BASE}/${id}`);
}

export async function approveDiscountRequest(
  id: number,
  payload: ApproveDiscountRequestPayload
): Promise<ApiResult<unknown>> {
  return post<unknown>(`${BASE}/${id}/approve`, payload);
}

export async function rejectDiscountRequest(
  id: number,
  payload: RejectDiscountRequestPayload
): Promise<ApiResult<unknown>> {
  return post<unknown>(`${BASE}/${id}/reject`, payload);
}
