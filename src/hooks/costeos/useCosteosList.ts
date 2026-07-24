import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage, unwrapOrThrow } from "@/lib/axios";
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
      const result = await getCosteos({ filter, page: 1, limit: 50 });
      const data = unwrapOrThrow(result);
      setItems(data.rows);
    } catch (err) {
      setError(getApiErrorMessage(err));
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
