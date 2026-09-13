import type { ApiResult } from "@/lib/axios";
import { get, post } from "@/lib/axios";
import type {
  PaginatedListParams,
  PaginatedListPayload,
} from "@/hooks/usePaginatedList";
import type {
  SchedulePaymentPayload,
  SupplierPayableDiscrepancy,
  SupplierPayableListItem,
  SupplierPayableStatement,
  SupplierPayableStatusTab,
  SupplierPayableSummary,
} from "@/types/supplier-payables.types";

const BASE = "/supplier-account-statements";

export type GetSupplierPayablesResponse =
  PaginatedListPayload<SupplierPayableListItem>;

export async function getSupplierPayables(
  params: PaginatedListParams,
): Promise<ApiResult<GetSupplierPayablesResponse>> {
  const statusTab =
    typeof params.statusTab === "string"
      ? (params.statusTab as SupplierPayableStatusTab)
      : undefined;

  return get<GetSupplierPayablesResponse>(BASE, {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
      statusTab: statusTab && statusTab !== "all" ? statusTab : undefined,
    },
  });
}

export async function getSupplierPayablesSummary(): Promise<
  ApiResult<SupplierPayableSummary>
> {
  return get<SupplierPayableSummary>(`${BASE}/summary`);
}

export async function getSupplierPayableStatement(
  id: string,
): Promise<ApiResult<SupplierPayableStatement>> {
  return get<SupplierPayableStatement>(`${BASE}/${id}`);
}

export async function getSupplierPayableDiscrepancies(): Promise<
  ApiResult<SupplierPayableDiscrepancy[]>
> {
  return get<SupplierPayableDiscrepancy[]>(`${BASE}/discrepancies`);
}

export async function getSupplierPayableDiscrepancyCount(): Promise<
  ApiResult<{ count: number }>
> {
  const result = await getSupplierPayableDiscrepancies();
  if (result.error || !result.data) {
    return { data: null, error: result.error ?? { message: "Error" } };
  }
  return { data: { count: result.data.length }, error: null };
}

export async function scheduleSupplierPayablePayment(
  statementId: string,
  payload: SchedulePaymentPayload,
): Promise<ApiResult<SupplierPayableStatement>> {
  return post<SupplierPayableStatement>(
    `${BASE}/${statementId}/payments/schedule`,
    {
      amount: payload.amount,
      scheduledDate: payload.scheduledDate,
      notes: payload.notes,
    },
  );
}
