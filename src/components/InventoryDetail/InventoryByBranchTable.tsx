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
            id: "physicalTotal",
            label: "Físico Total",
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
            label: "Pendiente de Entrega",
            type: "number",
            size: "lg",
            align: "center",
            headerWrap: true,
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
            id: "damaged",
            label: "Dañado",
            type: "number",
            size: "md",
            align: "center",
        },
        {
            id: "creditPrice",
            label: "Precio crédito",
            type: "currency",
            size: "md",
            align: "center",
        },
        {
            id: "price",
            label: "Precio contado",
            type: "currency",
            size: "md",
            align: "center",
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
