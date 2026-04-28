import { useQuery } from "@tanstack/react-query";
import { getFamilyRelationships } from "@/services/catalog.service";

const STALE_TIME_MS = 60 * 60 * 1000;

export function useFamilyRelationships() {
  return useQuery({
    queryKey: ["catalog", "family-relationships"],
    queryFn: () => getFamilyRelationships(),
    staleTime: STALE_TIME_MS,
  });
}
