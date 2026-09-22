import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSales } from "@/services/ventas.service";
import { unwrapOrThrow } from "@/lib/axios";
import { CASHIER_SALES_KEY } from "@/lib/cashRegisterQueries";
import type {
  CashierSalesTab,
  CashierSalesTabCounts,
  SaleListItem,
  SaleStatusTab,
} from "@/types/ventas.types";

export type { CashierSalesTab, CashierSalesTabCounts };

const CASHIER_SALES_LIMIT = 50;
const REFETCH_INTERVAL_MS = 10_000;
const EMPTY_TAB_COUNTS: CashierSalesTabCounts = {
  all: 0,
  pending: 0,
  processed: 0,
};

const TAB_TO_STATUS: Record<CashierSalesTab, SaleStatusTab> = {
  all: "cashierAll",
  pending: "pendingCashier",
  processed: "processedCashier",
};

export function useCashierSales(options: {
  enabled: boolean;
  search?: string;
}) {
  const [activeTab, setActiveTab] = useState<CashierSalesTab>("pending");
  const search = options.search?.trim() || undefined;
  const statusTab = TAB_TO_STATUS[activeTab];

  const listQuery = useQuery({
    queryKey: [...CASHIER_SALES_KEY, "list", activeTab, search ?? ""],
    enabled: options.enabled,
    refetchInterval: (query) =>
      query.state.status === "error" ? false : REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    queryFn: async () => {
      const data = unwrapOrThrow(
        await getSales({
          page: 1,
          limit: CASHIER_SALES_LIMIT,
          statusTab,
          search,
        }),
      );
      return {
        rows: data.rows ?? [],
        total: data.total ?? 0,
        tabCounts: data.cashierTabCounts ?? EMPTY_TAB_COUNTS,
      };
    },
  });

  const tabCounts = useMemo<CashierSalesTabCounts>(
    () => listQuery.data?.tabCounts ?? EMPTY_TAB_COUNTS,
    [listQuery.data?.tabCounts],
  );
  const rows: SaleListItem[] = listQuery.data?.rows ?? [];

  return {
    activeTab,
    setActiveTab,
    rows,
    loading: listQuery.isLoading,
    tabCounts,
  };
}
