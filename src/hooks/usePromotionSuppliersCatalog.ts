import { useQuery } from "@tanstack/react-query";
import { getSuppliersCatalog } from "@/services/suppliers.service";

const STALE_MS = 10 * 60 * 1000;

export function usePromotionSuppliersCatalog(enabled = true) {
  return useQuery({
    queryKey: ["catalog", "suppliers", "promotions"],
    queryFn: () => getSuppliersCatalog(),
    staleTime: STALE_MS,
    enabled,
  });
}
