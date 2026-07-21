import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SelectOption } from "@/components/Form";
import {
  getBranchesCatalog,
  type BranchCatalogItem,
} from "@/services/branches.service";

const SELECT_STALE_TIME_MS = 5 * 60 * 1000;

export const BRANCHES_SELECT_QUERY_KEY = ["branches", "select"] as const;

export function toBranchSelectOptions(
  branches: BranchCatalogItem[],
): SelectOption[] {
  return branches.map((branch) => ({
    value: String(branch.id),
    label: branch.name,
  }));
}

/**
 * Cached branch catalog for FormAutocomplete selects.
 */
export function useBranchesSelect(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: BRANCHES_SELECT_QUERY_KEY,
    queryFn: () => getBranchesCatalog(),
    staleTime: SELECT_STALE_TIME_MS,
    enabled,
  });

  const selectOptions = useMemo(
    () => toBranchSelectOptions(query.data ?? []),
    [query.data],
  );

  return { ...query, selectOptions };
}
