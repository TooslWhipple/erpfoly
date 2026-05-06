import { useQuery } from "@tanstack/react-query";
import { getDepartmentsCatalog } from "@/services/departments.service";

const STALE_MS = 5 * 60 * 1000;

export function usePromotionDepartmentsCatalog(enabled = true) {
  return useQuery({
    queryKey: ["catalog", "departments", "promotions"],
    queryFn: () => getDepartmentsCatalog(),
    staleTime: STALE_MS,
    enabled,
  });
}
