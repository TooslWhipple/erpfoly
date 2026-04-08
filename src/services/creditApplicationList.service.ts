import { get } from "@/lib/axios";
import type { ApiResult, PaginatedRowsResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";

export type CreditApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type CreditApplicationListStatusTab =
  | "all"
  | "in_review"
  | "approved"
  | "rejected";

export interface CreditApplicationListItem {
  id: number;
  folio: string;
  status: CreditApplicationStatus;
  fullName: string;
  phone: string | null;
  requestedAt: string;
  formattedAddress: string | null;
  applicationTypeCode: string | null;
  applicationTypeName: string | null;
}

export interface GetCreditApplicationsParams {
  page: number;
  limit: number;
  search?: string;
  statusTab?: CreditApplicationListStatusTab;
}

export type GetCreditApplicationsResponse =
  PaginatedRowsResponse<CreditApplicationListItem>;

const BASE = "/credit-applications";

export async function getCreditApplications(
  params: GetCreditApplicationsParams
): Promise<ApiResult<GetCreditApplicationsResponse>> {
  return get<GetCreditApplicationsResponse>(buildListUrl(BASE, params));
}
