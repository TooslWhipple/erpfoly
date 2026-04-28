import { useQuery } from "@tanstack/react-query";
import { getNeighborhoodsByPostalCode } from "@/services/address.service";
import { isValidMxPostalCode } from "@/forms/validation/schemas";

const STALE_TIME_MS = 5 * 60 * 1000;

export function useNeighborhoodsByPostalCode(postalCode: string) {
  const trimmed = postalCode.trim();
  const enabled = isValidMxPostalCode(trimmed);

  return useQuery({
    queryKey: ["addresses", "neighborhoods", trimmed],
    queryFn: () => getNeighborhoodsByPostalCode(trimmed),
    enabled,
    staleTime: STALE_TIME_MS,
  });
}
