import { useQuery } from "@tanstack/react-query";
import { getSuppliersCatalog } from "@/services/suppliers.service";

const STALE_MS = 10 * 60 * 1000;

export function usePromotionSuppliersCatalog(enabled = true) {
  return useQuery({
    queryKey: ["catalog", "suppliers", "promotions"],
    queryFn: async () => {
      const rows = await getSuppliersCatalog();
      return Array.isArray(rows) ? rows : [];
    },
    staleTime: STALE_MS,
    enabled,
    refetchOnMount: "always",
    retry: 2,
  });
}
