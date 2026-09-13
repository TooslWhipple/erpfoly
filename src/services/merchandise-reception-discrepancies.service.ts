import type { ApiResult } from "@/lib/axios";
import { get, post } from "@/lib/axios";
import type {
  PaginatedListParams,
  PaginatedListPayload,
} from "@/hooks/usePaginatedList";
import type {
  MerchandiseReceptionDiscrepancyDetail,
  MerchandiseReceptionDiscrepancyListItem,
} from "@/types/merchandise-reception-discrepancies.types";

const BASE = "/merchandise-reception-discrepancies";

export type GetMerchandiseReceptionDiscrepanciesResponse =
  PaginatedListPayload<MerchandiseReceptionDiscrepancyListItem>;

export async function getMerchandiseReceptionDiscrepancies(
  params: PaginatedListParams,
): Promise<ApiResult<GetMerchandiseReceptionDiscrepanciesResponse>> {
  return get<GetMerchandiseReceptionDiscrepanciesResponse>(BASE, {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
    },
  });
}

export async function getMerchandiseReceptionDiscrepancyDetail(
  id: string,
): Promise<ApiResult<MerchandiseReceptionDiscrepancyDetail>> {
  return get<MerchandiseReceptionDiscrepancyDetail>(`${BASE}/${id}`);
}

export async function addInvoicesToMerchandiseReceptionDiscrepancy(
  id: string,
  invoiceIds: string[],
): Promise<ApiResult<MerchandiseReceptionDiscrepancyDetail>> {
  return post<MerchandiseReceptionDiscrepancyDetail>(`${BASE}/${id}/invoices`, {
    invoiceIds: invoiceIds.map((invoiceId) => Number(invoiceId)),
  });
}
