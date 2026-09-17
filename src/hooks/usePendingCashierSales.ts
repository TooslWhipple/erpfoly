import { useQuery } from "@tanstack/react-query";
import { getSales } from "@/services/ventas.service";
import { PENDING_CASHIER_SALES_KEY } from "@/lib/cashRegisterQueries";
import type { SaleListItem } from "@/types/ventas.types";

const PENDING_CASHIER_LIMIT = 50;
const REFETCH_INTERVAL_MS = 5_000;

/** Pending cashier queue only. Prefer `useCashierSales` on the main caja screen. */
export function usePendingCashierSales(options: {
  enabled: boolean;
  search?: string;
}) {
  const search = options.search?.trim() || undefined;

  return useQuery<SaleListItem[]>({
    queryKey: [...PENDING_CASHIER_SALES_KEY, search ?? ""],
    enabled: options.enabled,
    refetchInterval: REFETCH_INTERVAL_MS,
    queryFn: async () => {
      const res = await getSales({
        page: 1,
        limit: PENDING_CASHIER_LIMIT,
        statusTab: "pendingCashier",
        search,
      });
      if (res.error) throw new Error(res.error.message);
      return res.data?.rows ?? [];
    },
  });
}
