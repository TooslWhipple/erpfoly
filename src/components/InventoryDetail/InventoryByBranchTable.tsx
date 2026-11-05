import type { ReactNode } from "react";
import { TableCrud } from "@/components/TableCrud";
import type { Column } from "@/components/TableCrud";
import type { BranchInventory } from "@/types/inventario.types";
import {
    INVENTORY_COLORS,
    inventoryQuantityColor,
} from "@/styles/inventario/styles";

export interface InventoryByBranchTableProps {
    data: BranchInventory[];
    loading?: boolean;
}

function formatQuantity(value: unknown, positiveColor: string): ReactNode {
    const n = Number(value);
    return (
        <span
            style={{
                color: inventoryQuantityColor(n, positiveColor),
                fontWeight: 500,
            }}>
            {String(value)}
        </span>
    );
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
            format: (value) => formatQuantity(value, INVENTORY_COLORS.red),
        },
        {
            id: "inTransit",
            label: "En Tránsito",
            type: "number",
            size: "md",
            align: "center",
            headerWrap: true,
            format: (value) => formatQuantity(value, INVENTORY_COLORS.yellow),
        },
        {
            id: "available",
            label: "Disponible",
            type: "number",
            size: "md",
            align: "center",
            format: (value) => formatQuantity(value, INVENTORY_COLORS.green),
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
            format: (value) => formatQuantity(value, INVENTORY_COLORS.green),
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
