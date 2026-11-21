import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { unwrapOrThrow } from "@/lib/axios";
import { getSellerDetail } from "@/services/sellers.service";
import type { SellerDetail } from "@/types/sellers.types";
import type { SellerPeriodValue } from "@/utils/sellerPeriods";

export const SELLER_DETAIL_QUERY_KEY = ["seller-detail"] as const;

export function sellerDetailQueryKey(
  sellerId: number | null,
  period: SellerPeriodValue | null,
) {
  return [
    ...SELLER_DETAIL_QUERY_KEY,
    sellerId,
    period?.year ?? null,
    period?.month ?? null,
  ] as const;
}

/**
 * Seller dashboard for a month; `period = null` asks the API for the current
 * month. Keeps the previous month on screen while the next one loads.
 */
export function useSellerDetail(
  sellerId: number | null,
  period: SellerPeriodValue | null,
) {
  return useQuery({
    queryKey: sellerDetailQueryKey(sellerId, period),
    queryFn: async (): Promise<SellerDetail> =>
      unwrapOrThrow(await getSellerDetail(sellerId!, period ?? undefined)),
    enabled: sellerId != null,
    placeholderData: keepPreviousData,
  });
}
