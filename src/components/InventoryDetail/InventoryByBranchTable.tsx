import { Box, Chip } from "@mui/material";
import { TableCrud } from "@/components/TableCrud";
import type { Column } from "@/components/TableCrud";
import type { BranchInventory } from "@/types/inventario.types";
import numeral from "numeral";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface InventoryByBranchTableProps {
    data: BranchInventory[];
    loading?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function InventoryByBranchTable({
    data,
    loading = false,
}: InventoryByBranchTableProps) {
    const columns: Column<BranchInventory>[] = [
        {
            id: "branchName",
            label: "SUCURSAL",
            size: "xl",
        },
        {
            id: "stock",
            label: "EXISTENCIAS",
            type: "number",
            size: "md",
            align: "left",
        },
        {
            id: "lastPrice",
            label: "ÚLTIMO PRECIO",
            type: "currency",
            size: "md",
            align: "left",
            format: (value, row) => (
                <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                    <span>{numeral(value as number).format("$0,0.00")}</span>
                    {row.tags && row.tags.length > 0 && (
                        <Chip
                            label={row.tags[0]}
                            size="small"
                            sx={{
                                height: 20,
                                fontSize: "11px",
                                backgroundColor: "#FEF3C7",
                                color: "#92400E",
                            }}
                        />
                    )}
                </Box>
            ),
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
