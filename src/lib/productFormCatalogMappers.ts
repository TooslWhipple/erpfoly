import type { BranchCatalogItem } from "@/services/branches.service";
import type { DepartmentCatalogItem } from "@/services/departments.service";
import type { ProductLineCatalogItem } from "@/services/product-lines.service";
import type { ProductDetailBranchDto } from "@/services/productos.service";
import type { ProductBasePrice, ProductBranch, SelectableItem, WarrantyType } from "@/types/productos.types";

export function departmentCatalogToSelectOptions(
    items: DepartmentCatalogItem[]
): Array<{ value: string; label: string }> {

    return items.map((d) => ({
        value: String(d.id),
        label: `${String(d.id).padStart(2, "0")} — ${d.name}`
    }));
}

export function resolveDepartmentMarginFromCatalog(
    items: DepartmentCatalogItem[],
    departmentId: string
): number | null {
    const numericId = Number(departmentId);
    if (departmentId.trim().length === 0 || !Number.isFinite(numericId)) {
        return null;
    }
    const match = items.find((d) => d.id === numericId);
    return match != null ? match.margin : null;
}

export function syncDefaultBasePriceDepartmentMargin(
    basePrices: ProductBasePrice[],
    departmentMargin: number | null
): ProductBasePrice[] {
    const marginPercent = departmentMargin ?? 0;
    if (basePrices.length === 0) {
        return [
            {
                id: "bp-default-1",
                name: "Contado",
                marginPercent,
                lastEditedBy: "Gerente",
            },
        ];
    }
    return basePrices.map((bp, index) =>
        index === 0 ? { ...bp, marginPercent } : bp
    );
}

export function productLineCatalogToSelectOptions(
    items: ProductLineCatalogItem[]
): Array<{ value: string; label: string }> {
    return items.map((line) => ({
        value: String(line.id),
        label: line.code?.trim() ? `${line.code} — ${line.name}` : line.name,
    }));
}

const DEFAULT_WARRANTY_FORM_OPTIONS: Array<{ value: WarrantyType; label: string }> = [
    { value: "months", label: "Meses" },
    { value: "policy", label: "Póliza anexa" },
];

export function warrantyCatalogToFormOptions(
    items: { value: string; label: string }[]
): Array<{ value: WarrantyType; label: string }> {
    const mapped: Array<{ value: WarrantyType; label: string }> = [];
    for (const w of items) {
        const formValue: WarrantyType | null =
            w.value === "ANNEX_POLICY"
                ? "policy"
                : w.value === "MONTHS"
                    ? "months"
                    : null;
        if (formValue) {
            mapped.push({ value: formValue, label: w.label });
        }
    }
    return mapped.length > 0 ? mapped : DEFAULT_WARRANTY_FORM_OPTIONS;
}

export function branchCatalogToProductBranches(items: BranchCatalogItem[]): ProductBranch[] {
    return items.map((b) => ({
        id: `branch-${b.id}`,
        branchId: b.id,
        branchName: b.name,
        enabled: false,
        minInventory: 0,
        maxInventory: 20,
    }));
}

/** Maps GET /branches/catalog rows for MultiSelectChips in package modal */
export function branchCatalogToPackageSelectableItems(items: BranchCatalogItem[]): SelectableItem[] {
    return items.map((b) => ({
        id: b.id,
        label: b.name,
    }));
}

/**
 * Build branch rows from the active catalog, overlaying stock/availability from product detail by `branchId`.
 * Catalog defines which branches exist and their display names; unmatched catalog rows keep defaults.
 */
export function mergeBranchCatalogWithProductDetail(
    catalogItems: BranchCatalogItem[],
    detailRows: ProductDetailBranchDto[]
): ProductBranch[] {
    const byBranchId = new Map(detailRows.map((row) => [row.branchId, row]));
    return catalogItems.map((catalog) => {
        const match = byBranchId.get(catalog.id);
        if (match) {
            return {
                id: `branch-${catalog.id}`,
                branchId: catalog.id,
                branchName: catalog.name,
                enabled: Boolean(match.isAvailable),
                minInventory: Number.isFinite(match.minStock) ? match.minStock : 0,
                maxInventory: Number.isFinite(match.maxStock) ? match.maxStock : 0,
            };
        }
        return {
            id: `branch-${catalog.id}`,
            branchId: catalog.id,
            branchName: catalog.name,
            enabled: false,
            minInventory: 0,
            maxInventory: 20,
        };
    });
}
