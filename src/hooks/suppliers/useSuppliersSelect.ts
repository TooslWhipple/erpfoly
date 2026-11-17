import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SelectOption } from "@/components/Form";
import {
  getSuppliersCatalog,
  type SupplierCatalogItem,
} from "@/services/suppliers.service";

const SELECT_STALE_TIME_MS = 5 * 60 * 1000;

export const SUPPLIERS_SELECT_QUERY_KEY = ["suppliers", "select"] as const;

export interface SupplierSelectOption extends SelectOption {
  rfc?: string | null;
}

export function toSupplierSelectOptions(
  suppliers: SupplierCatalogItem[],
): SupplierSelectOption[] {
  return suppliers.map((supplier) => ({
    value: String(supplier.id),
    label: supplier.businessName?.trim() || supplier.name,
    rfc: supplier.rfc ?? null,
  }));
}

export function useSuppliersSelect(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: SUPPLIERS_SELECT_QUERY_KEY,
    queryFn: () => getSuppliersCatalog(),
    staleTime: SELECT_STALE_TIME_MS,
    enabled,
  });

  const selectOptions = useMemo(
    () => toSupplierSelectOptions(query.data ?? []),
    [query.data],
  );

  return { ...query, selectOptions };
}
