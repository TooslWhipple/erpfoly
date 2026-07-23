import { useCallback, useEffect, useState } from "react";
import { getCosteos } from "@/services/costeos.service";
import type { CosteoListFilter, CosteoListItem } from "@/types/costeos.types";

export function useCosteosList() {
  const [items, setItems] = useState<CosteoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CosteoListFilter>("all");

  const fetchCosteos = useCallback(async (filter: CosteoListFilter) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCosteos({ filter });
      setItems(result.data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al cargar costeos";
      setError(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCosteos(activeTab);
  }, [activeTab, fetchCosteos]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as CosteoListFilter);
  };

  const refetch = () => {
    void fetchCosteos(activeTab);
  };

  return {
    items,
    loading,
    error,
    activeTab,
    isEmpty: !loading && !error && items.length === 0,
    handleTabChange,
    refetch,
  };
}
