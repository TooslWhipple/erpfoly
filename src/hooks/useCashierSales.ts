import { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { getSales } from "@/services/ventas.service";
import { CASHIER_SALES_KEY } from "@/lib/cashRegisterQueries";
import type { SaleListItem, SaleStatusTab } from "@/types/ventas.types";

const CASHIER_SALES_LIMIT = 50;
const REFETCH_INTERVAL_MS = 5_000;

export type CashierSalesTab = "all" | "pending" | "processed";

const TAB_TO_STATUS: Record<CashierSalesTab, SaleStatusTab> = {
  all: "cashierAll",
  pending: "pendingCashier",
  processed: "processedCashier",
};

const COUNT_TABS: CashierSalesTab[] = ["all", "pending", "processed"];

export type CashierSalesTabCounts = Record<CashierSalesTab, number>;

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
    refetchInterval: REFETCH_INTERVAL_MS,
    queryFn: async () => {
      const res = await getSales({
        page: 1,
        limit: CASHIER_SALES_LIMIT,
        statusTab,
        search,
      });
      if (res.error) throw new Error(res.error.message);
      return {
        rows: res.data?.rows ?? [],
        total: res.data?.total ?? 0,
      };
    },
  });

  const countQueries = useQueries({
    queries: COUNT_TABS.map((tab) => ({
      queryKey: [...CASHIER_SALES_KEY, "count", tab, search ?? ""],
      enabled: options.enabled,
      refetchInterval: REFETCH_INTERVAL_MS,
      queryFn: async () => {
        const res = await getSales({
          page: 1,
          limit: 1,
          statusTab: TAB_TO_STATUS[tab],
          search,
        });
        if (res.error) throw new Error(res.error.message);
        return res.data?.total ?? 0;
      },
    })),
  });

  const allCount = countQueries[0]?.data ?? 0;
  const pendingCount = countQueries[1]?.data ?? 0;
  const processedCount = countQueries[2]?.data ?? 0;

  const tabCounts = useMemo<CashierSalesTabCounts>(
    () => ({
      all: allCount,
      pending: pendingCount,
      processed: processedCount,
    }),
    [allCount, pendingCount, processedCount],
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
