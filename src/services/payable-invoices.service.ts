import type { ApiResult } from "@/lib/axios";
import { get } from "@/lib/axios";
import type {
  PaginatedListParams,
  PaginatedListPayload,
} from "@/hooks/usePaginatedList";
import type {
  PayableInvoiceListItem,
  PayableInvoiceStatusTab,
  PayableInvoiceSummary,
} from "@/types/payable-invoices.types";

export type {
  PayableInvoiceListItem,
  PayableInvoiceStatusTab,
  PayableInvoiceSummary,
};

export type GetPayableInvoicesResponse =
  PaginatedListPayload<PayableInvoiceListItem>;

export async function getPayableInvoices(
  params: PaginatedListParams,
): Promise<ApiResult<GetPayableInvoicesResponse>> {
  const statusTab =
    typeof params.statusTab === "string"
      ? (params.statusTab as PayableInvoiceStatusTab)
      : undefined;

  return get<GetPayableInvoicesResponse>("/payable-invoices", {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
      statusTab: statusTab && statusTab !== "all" ? statusTab : undefined,
    },
  });
}

export async function getPayableInvoicesSummary(): Promise<
  ApiResult<PayableInvoiceSummary>
> {
  return get<PayableInvoiceSummary>("/payable-invoices/summary");
}
