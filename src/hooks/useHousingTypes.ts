import { useQuery } from "@tanstack/react-query";
import { getHousingTypes } from "@/services/address.service";

const STALE_TIME_MS = 60 * 60 * 1000;

export function useHousingTypes() {
  return useQuery({
    queryKey: ["addresses", "housing-types"],
    queryFn: () => getHousingTypes(),
    staleTime: STALE_TIME_MS,
  });
}
