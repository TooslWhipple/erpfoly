import { get, type ApiResult, type PaginatedRowsResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  DelinquencySummary,
  DelinquentCustomer,
  GetDelinquentCustomersParams,
} from "@/types/delinquency.types";

const DELINQUENCY_BASE = "/clients/delinquency";

export type {
  DelinquencyPeriod,
  DelinquencySummary,
  DelinquentCustomer,
  GetDelinquentCustomersParams,
} from "@/types/delinquency.types";

export async function getDelinquencySummary(): Promise<
  ApiResult<DelinquencySummary>
> {
  return get<DelinquencySummary>(`${DELINQUENCY_BASE}/summary`);
}

export async function getDelinquentCustomers(
  params: GetDelinquentCustomersParams,
): Promise<ApiResult<PaginatedRowsResponse<DelinquentCustomer>>> {
  return get<PaginatedRowsResponse<DelinquentCustomer>>(
    buildListUrl(DELINQUENCY_BASE, params),
  );
}
