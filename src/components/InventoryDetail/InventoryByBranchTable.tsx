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
            align: "left"
        },
        {
            id: "damaged",
            label: "Dañado",
            type: "number",
            size: "md",
            align: "center",
        },
        {
            id: "inTransit",
            label: "En Tránsito",
            type: "number",
            size: "md",
            align: "center",
            headerWrap: true,
        },
        {
            id: "available",
            label: "Disponible",
            type: "number",
            size: "md",
            align: "center",
        },
        {
            id: "pendingDelivery",
            label: "Por entregar",
            type: "number",
            size: "md",
            align: "center",
            headerWrap: true,
        },
        {
            id: "physicalTotal",
            label: "Físico Total",
            type: "number",
            size: "md",
            align: "center",
            headerWrap: true,
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
