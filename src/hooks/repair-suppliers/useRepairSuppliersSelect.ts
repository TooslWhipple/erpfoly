import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SelectOption } from "@/components/Form";
import {
  getRepairSuppliers,
  type RepairSupplier,
} from "@/services/repair-suppliers.service";

const SELECT_STALE_TIME_MS = 5 * 60 * 1000;
const SELECT_LIMIT = 100;

export const REPAIR_SUPPLIERS_SELECT_QUERY_KEY = [
  "repair-suppliers",
  "select",
] as const;

export function toRepairSupplierSelectOptions(
  suppliers: RepairSupplier[],
): SelectOption[] {
  return suppliers.map((supplier) => ({
    value: String(supplier.id),
    label: supplier.name,
  }));
}

/**
 * Cached repair-supplier list for FormAutocomplete selects.
 */
export function useRepairSuppliersSelect(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: REPAIR_SUPPLIERS_SELECT_QUERY_KEY,
    queryFn: async (): Promise<RepairSupplier[]> => {
      const result = await getRepairSuppliers({ page: 1, limit: SELECT_LIMIT });
      if (result.error != null) throw new Error(result.error.message);
      return result.data?.rows ?? [];
    },
    staleTime: SELECT_STALE_TIME_MS,
    enabled,
  });

  const selectOptions = useMemo(
    () => toRepairSupplierSelectOptions(query.data ?? []),
    [query.data],
  );

  return { ...query, selectOptions };
}
