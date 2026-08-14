import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SelectOption } from "@/components/Form";
import { getExpenseCategories } from "@/services/general-expenses.service";

const SELECT_STALE_TIME_MS = 10 * 60 * 1000;

export const INTERNAL_PAYABLE_CATEGORIES_QUERY_KEY = [
  "internal-payable-categories",
] as const;

export function useInternalPayableCategoriesSelect(
  options: { enabled?: boolean } = {},
) {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: INTERNAL_PAYABLE_CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const result = await getExpenseCategories();
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    staleTime: SELECT_STALE_TIME_MS,
    enabled,
  });

  const selectOptions = useMemo<SelectOption[]>(
    () =>
      (query.data ?? []).map((item) => ({
        value: item.id,
        label: item.label,
      })),
    [query.data],
  );

  return { ...query, selectOptions };
}
