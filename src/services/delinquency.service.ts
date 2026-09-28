import { get, type ApiResult } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  DelinquencySummary,
  DelinquentCustomersResponse,
  GetDelinquentCustomersParams,
} from "@/types/delinquency.types";

const DELINQUENCY_BASE = "/clients/delinquency";

export type {
  DelinquencyPeriod,
  DelinquencySummary,
  DelinquentCustomersResponse,
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
): Promise<ApiResult<DelinquentCustomersResponse>> {
  return get<DelinquentCustomersResponse>(
    buildListUrl(DELINQUENCY_BASE, params),
  );
}
