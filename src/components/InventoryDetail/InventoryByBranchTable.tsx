import { TableCrud } from "@/components/TableCrud";
import type { Column } from "@/components/TableCrud";
import type { BranchInventory } from "@/types/inventario.types";

export interface InventoryByBranchTableProps {
    data: BranchInventory[];
    loading?: boolean;
}

export function InventoryByBranchTable({
    data,
    loading = false,
}: InventoryByBranchTableProps) {
    const columns: Column<BranchInventory>[] = [
        {
            id: "branchName",
            label: "Sucursal",
            size: "xl",
        },
        {
            id: "stock",
            label: "Existencias",
            type: "number",
            size: "md",
            align: "left",
        },
        {
            id: "creditPrice",
            label: "Precio crédito",
            type: "currency",
            size: "md",
            align: "left",
        },
        {
            id: "price",
            label: "Precio contado",
            type: "currency",
            size: "md",
            align: "left",
        },
    ];

    return (
        <TableCrud
            columns={columns}
            rows={data}
            loading={loading}
            rowKey="id"
            emptyMessage="No hay inventario disponible por sucursal"
        />
    );
}
