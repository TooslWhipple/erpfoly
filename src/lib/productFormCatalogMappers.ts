import type { BranchCatalogItem } from "@/services/branches.service";
import type { DepartmentCatalogItem } from "@/services/departments.service";
import type { ProductLineCatalogItem } from "@/services/product-lines.service";
import type { ProductBranch, WarrantyType } from "@/types/productos.types";

export function departmentCatalogToSelectOptions(
    items: DepartmentCatalogItem[]
): Array<{ value: string; label: string }> {
    return items.map((d) => ({
        value: String(d.id),
        label: d.code?.trim() ? `${d.code} — ${d.name}` : d.name,
    }));
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
