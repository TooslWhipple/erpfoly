import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBranchesCatalog, type BranchCatalogItem } from "@/services/branches.service";
import { getDepartmentsCatalog } from "@/services/departments.service";
import {
    getProductLinesCatalog,
    type ProductLineCatalogItem,
} from "@/services/product-lines.service";
import { getProductsCatalog } from "@/services/productos.service";
import { getSuppliersCatalog, type SupplierCatalogItem } from "@/services/suppliers.service";
import { unwrapOrThrow } from "@/lib/axios";
import {
    departmentCatalogToSelectOptions,
    productLineCatalogToSelectOptions,
    warrantyCatalogToFormOptions,
} from "@/lib/productFormCatalogMappers";
import type { DepartmentCatalogItem } from "@/services/departments.service";
import type { WarrantyType } from "@/types/productos.types";

export interface ProductFormCatalogSelectOption {
    value: string;
    label: string;
}

export interface UseProductFormCatalogsResult {
    /** Initial load of catalogs that do not depend on the selected department. */
    catalogsLoading: boolean;
    /** Product lines fetch for the currently selected department. */
    linesLoading: boolean;
    departmentCatalogItems: DepartmentCatalogItem[];
    departmentOptions: ProductFormCatalogSelectOption[];
    lineOptions: ProductFormCatalogSelectOption[];
    suppliersCatalog: SupplierCatalogItem[];
    branchCatalogItems: BranchCatalogItem[];
    warrantyOptions: Array<{ value: WarrantyType; label: string }>;
    /** Reloads department select options from the API (e.g. after creating a department). */
    refreshDepartmentOptions: () => Promise<void>;
    /** Reloads line options for the currently selected department. */
    refreshLineOptions: () => Promise<void>;
}

export function useProductFormCatalogs(
    selectedDepartmentId: string
): UseProductFormCatalogsResult {
    const queryClient = useQueryClient();
    const selectedDepartmentNumericId = Number(selectedDepartmentId);
    const hasDepartmentSelection =
        selectedDepartmentId.trim().length > 0 &&
        Number.isFinite(selectedDepartmentNumericId);

    const departmentsQuery = useQuery({
        queryKey: ["catalog", "departments", "products-form"],
        queryFn: getDepartmentsCatalog,
        staleTime: 5 * 60 * 1000,
    });

    const suppliersQuery = useQuery({
        queryKey: ["catalog", "suppliers", "products-form"],
        queryFn: getSuppliersCatalog,
        staleTime: 5 * 60 * 1000,
    });

    const branchesQuery = useQuery({
        queryKey: ["catalog", "branches", "products-form"],
        queryFn: () => getBranchesCatalog(),
        staleTime: 5 * 60 * 1000,
    });

    const productsCatalogQuery = useQuery({
        queryKey: ["catalog", "products", "products-form"],
        queryFn: async () => unwrapOrThrow(await getProductsCatalog()),
        staleTime: 5 * 60 * 1000,
    });

    const linesQuery = useQuery({
        queryKey: ["catalog", "product-lines", "products-form", selectedDepartmentNumericId],
        queryFn: async (): Promise<ProductLineCatalogItem[]> => {
            if (!hasDepartmentSelection) {
                return [];
            }
            const result = await getProductLinesCatalog({
                departmentId: selectedDepartmentNumericId,
            });
            return result.error ? [] : (result.data ?? []);
        },
        enabled: hasDepartmentSelection,
        staleTime: 5 * 60 * 1000,
    });

    const refreshDepartmentOptions = useCallback(async () => {
        await queryClient.invalidateQueries({
            queryKey: ["catalog", "departments", "products-form"],
        });
    }, [queryClient]);

    const refreshLineOptions = useCallback(async () => {
        if (!hasDepartmentSelection) {
            return;
        }
        await queryClient.invalidateQueries({
            queryKey: ["catalog", "product-lines", "products-form", selectedDepartmentNumericId],
        });
    }, [hasDepartmentSelection, queryClient, selectedDepartmentNumericId]);

    const departmentOptions = useMemo<ProductFormCatalogSelectOption[]>(
        () =>
            departmentsQuery.data
                ? departmentCatalogToSelectOptions(departmentsQuery.data)
                : [],
        [departmentsQuery.data]
    );

    const lineOptions = useMemo<ProductFormCatalogSelectOption[]>(
        () =>
            linesQuery.data
                ? productLineCatalogToSelectOptions(linesQuery.data)
                : [],
        [linesQuery.data]
    );

    const suppliersCatalog = suppliersQuery.data ?? [];
    const branchCatalogItems = branchesQuery.data ?? [];

    const warrantyOptions = useMemo<Array<{ value: WarrantyType; label: string }>>(
        () => {
            const warrantyFromApi = productsCatalogQuery.data?.warrantyTypes ?? [];
            const mapped = warrantyCatalogToFormOptions(warrantyFromApi);
            return mapped.length > 0
                ? mapped
                : [
                    { value: "months", label: "Meses" },
                    { value: "policy", label: "Póliza anexa" },
                ];
        },
        [productsCatalogQuery.data]
    );

    const catalogsLoading =
        departmentsQuery.isLoading ||
        suppliersQuery.isLoading ||
        branchesQuery.isLoading ||
        productsCatalogQuery.isLoading;

    const linesLoading = hasDepartmentSelection && linesQuery.isLoading;

    const departmentCatalogItems = departmentsQuery.data ?? [];

    return {
        catalogsLoading,
        linesLoading,
        departmentCatalogItems,
        departmentOptions,
        lineOptions,
        suppliersCatalog,
        branchCatalogItems,
        warrantyOptions,
        refreshDepartmentOptions,
        refreshLineOptions,
    };
}
