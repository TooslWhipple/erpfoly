import { useState } from "react";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { getCosteos } from "@/services/costeos.service";
import type { CosteoListFilter, CosteoListItem } from "@/types/costeos.types";

export function useCosteosList() {
  const [activeTab, setActiveTab] = useState<CosteoListFilter>("all");

  const {
    data: items,
    total,
    page,
    setPage,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = usePaginatedList<CosteoListItem>({
    queryKey: ["costeos", activeTab],
    queryFn: getCosteos,
    initialPage: 0,
    initialRowsPerPage: 10,
    extraParams: { filter: activeTab },
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value as CosteoListFilter);
    setPage(0);
  };

  return {
    items,
    loading,
    error: isError ? (error?.message ?? "Error al cargar costeos") : null,
    activeTab,
    page,
    total,
    setPage,
    isEmpty: !loading && !isError && items.length === 0,
    handleTabChange,
    refetch,
  };
}
