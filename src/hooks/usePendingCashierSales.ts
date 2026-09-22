import { useQuery } from "@tanstack/react-query";
import { getSales } from "@/services/ventas.service";
import { unwrapOrThrow } from "@/lib/axios";
import { PENDING_CASHIER_SALES_KEY } from "@/lib/cashRegisterQueries";
import type { SaleListItem } from "@/types/ventas.types";

const PENDING_CASHIER_LIMIT = 50;
const REFETCH_INTERVAL_MS = 10_000;

/** Pending cashier queue only. Prefer `useCashierSales` on the main caja screen. */
export function usePendingCashierSales(options: {
  enabled: boolean;
  search?: string;
}) {
  const search = options.search?.trim() || undefined;

  return useQuery<SaleListItem[]>({
    queryKey: [...PENDING_CASHIER_SALES_KEY, search ?? ""],
    enabled: options.enabled,
    refetchInterval: (query) =>
      query.state.status === "error" ? false : REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    queryFn: async () => {
      const data = unwrapOrThrow(
        await getSales({
          page: 1,
          limit: PENDING_CASHIER_LIMIT,
          statusTab: "pendingCashier",
          search,
        }),
      );
      return data.rows ?? [];
    },
  });
}
