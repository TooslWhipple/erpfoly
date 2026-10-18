import { useQuery } from "@tanstack/react-query";
import { unwrapOrThrow } from "@/lib/axios";
import { getHandoverBranches } from "@/services/sale-handover.service";

const HANDOVER_BRANCHES_STALE_TIME_MS = 5 * 60 * 1000;

export const HANDOVER_BRANCHES_QUERY_KEY = ["sale-handover", "branches"] as const;

/** Sucursales que el usuario puede operar en entregas (según su alcance). */
export function useHandoverBranches(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: HANDOVER_BRANCHES_QUERY_KEY,
    queryFn: async () => unwrapOrThrow(await getHandoverBranches()),
    staleTime: HANDOVER_BRANCHES_STALE_TIME_MS,
    enabled,
  });
}
