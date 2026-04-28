import { useCallback, useEffect, useState } from "react";
import { getBranchesCatalog, type BranchCatalogItem } from "@/services/branches.service";
import { getDepartmentsCatalog, type DepartmentCatalogItem } from "@/services/departments.service";
import {
    getProductLinesCatalog,
    type ProductLineCatalogItem,
} from "@/services/product-lines.service";
import { getProductsCatalog } from "@/services/productos.service";
import { getSuppliersCatalog, type SupplierCatalogItem } from "@/services/suppliers.service";
import {
    departmentCatalogToSelectOptions,
    productLineCatalogToSelectOptions,
    warrantyCatalogToFormOptions,
} from "@/lib/productFormCatalogMappers";
import type { WarrantyType } from "@/types/productos.types";

export interface ProductFormCatalogSelectOption {
    value: string;
    label: string;
}

export interface UseProductFormCatalogsResult {
    catalogsLoading: boolean;
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
    const [catalogsLoading, setCatalogsLoading] = useState(true);
    const [departmentOptions, setDepartmentOptions] = useState<ProductFormCatalogSelectOption[]>(
        []
    );
    const [lineOptions, setLineOptions] = useState<ProductFormCatalogSelectOption[]>([]);
    const [suppliersCatalog, setSuppliersCatalog] = useState<SupplierCatalogItem[]>([]);
    const [branchCatalogItems, setBranchCatalogItems] = useState<BranchCatalogItem[]>([]);
    const [warrantyOptions, setWarrantyOptions] = useState<
        Array<{ value: WarrantyType; label: string }>
    >([
        { value: "months", label: "Meses" },
        { value: "policy", label: "Póliza anexa" },
    ]);

    const applyLineResult = useCallback((items: ProductLineCatalogItem[]) => {
        setLineOptions(productLineCatalogToSelectOptions(items));
    }, []);

    const refreshDepartmentOptions = useCallback(async () => {
        const deptRes = await getDepartmentsCatalog();
        setDepartmentOptions(
            departmentCatalogToSelectOptions(deptRes.data ?? ([] as DepartmentCatalogItem[]))
        );
    }, []);

    const refreshLineOptions = useCallback(async () => {
        const idNum = Number(selectedDepartmentId);
        if (!selectedDepartmentId.trim() || !Number.isFinite(idNum)) {
            applyLineResult([]);
            return;
        }
        const result = await getProductLinesCatalog({ departmentId: idNum });
        if (result.error) {
            applyLineResult([]);
            return;
        }
        applyLineResult(result.data ?? []);
    }, [selectedDepartmentId, applyLineResult]);

    useEffect(() => {
        let cancelled = false;

        async function loadBaseCatalogs() {
            setCatalogsLoading(true);
            const [deptRes, supRes, branchRes, prodRes] = await Promise.all([
                getDepartmentsCatalog(),
                getSuppliersCatalog(),
                getBranchesCatalog(),
                getProductsCatalog(),
            ]);

            if (cancelled) return;

            setDepartmentOptions(
                departmentCatalogToSelectOptions(deptRes.data ?? ([] as DepartmentCatalogItem[]))
            );
            setSuppliersCatalog(supRes.data ?? []);
            setBranchCatalogItems(branchRes.data ?? []);
            const warrantyFromApi = prodRes.data?.warrantyTypes ?? [];
            const currenciesFromApi = prodRes.data?.currencies ?? [];
            setWarrantyOptions(warrantyCatalogToFormOptions(warrantyFromApi));

            setCatalogsLoading(false);
        }

        loadBaseCatalogs();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function syncLines() {
            const idNum = Number(selectedDepartmentId);
            if (!selectedDepartmentId.trim() || !Number.isFinite(idNum)) {
                applyLineResult([]);
                return;
            }
            const result = await getProductLinesCatalog({ departmentId: idNum });
            if (cancelled) return;
            if (result.error) {
                applyLineResult([]);
                return;
            }
            applyLineResult(result.data ?? []);
        }

        syncLines();
        return () => {
            cancelled = true;
        };
    }, [selectedDepartmentId, applyLineResult]);

    return {
        catalogsLoading,
        departmentOptions,
        lineOptions,
        suppliersCatalog,
        branchCatalogItems,
        warrantyOptions,
        refreshDepartmentOptions,
        refreshLineOptions,
    };
}
