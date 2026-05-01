import { useQuery } from "@tanstack/react-query";
import { getBranchesCatalog } from "@/services/branches.service";

const STALE_MS = 5 * 60 * 1000;

export function usePromotionBranchesCatalog(enabled = true) {
  return useQuery({
    queryKey: ["catalog", "branches", "promotions"],
    queryFn: () => getBranchesCatalog(),
    staleTime: STALE_MS,
    enabled,
  });
}
