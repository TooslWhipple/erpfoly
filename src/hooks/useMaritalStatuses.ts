import { useQuery } from "@tanstack/react-query";
import { getMaritalStatuses } from "@/services/catalog.service";

const STALE_TIME_MS = 60 * 60 * 1000;

export function useMaritalStatuses() {
  return useQuery({
    queryKey: ["catalog", "marital-statuses"],
    queryFn: () => getMaritalStatuses(),
    staleTime: STALE_TIME_MS,
  });
}
