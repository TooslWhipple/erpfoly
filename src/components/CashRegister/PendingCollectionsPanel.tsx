import { useMemo } from "react";
import { Button } from "@mui/material";
import { TableCrud } from "@/components";
import type { Column } from "@/components/TableCrud";
import type { SaleListItem } from "@/types/ventas.types";
import { isSaleCollectableByCashier } from "@/utils/saleStatus";
import type { CashierSalesTab } from "@/hooks/useCashierSales";

export interface PendingCollectionsPanelProps {
  rows: SaleListItem[];
  loading?: boolean;
  activeTab: CashierSalesTab;
  onProcess: (sale: SaleListItem) => void;
}

const EMPTY_MESSAGES: Record<CashierSalesTab, string> = {
  pending: "No se encontraron ventas pendientes de cobro",
  processed: "No has procesado cobros en este turno",
  all: "No hay cobros en este turno",
};

export function PendingCollectionsPanel({
  rows,
  loading = false,
  activeTab,
  onProcess,
}: PendingCollectionsPanelProps) {
  const showProcessColumn = activeTab !== "processed";

  const columns: Column<SaleListItem>[] = useMemo(() => {
    const base: Column<SaleListItem>[] = [
      {
        id: "folio",
        label: "Folio",
        size: "sm",
        format: (_value, row) => (
          <Button
            variant="text"
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              onProcess(row);
            }}
            sx={{ minWidth: 0, px: 0, textTransform: "none" }}
          >
            {row.folio}
          </Button>
        ),
      },
      {
        id: "clientName",
        label: "Cliente",
        size: "md",
        format: (value) =>
          value == null || value === "" ? "—" : String(value),
      },
      {
        id: "sellerName",
        label: "Vendedor",
        size: "sm",
        format: (value) =>
          value == null || value === "" ? "—" : String(value),
      },
      {
        id: "totalAmount",
        label: "Monto",
        type: "currency",
        size: "sm",
        align: "right",
      },
    ];

    if (showProcessColumn) {
      base.push({
        id: "process",
        label: "",
        size: "sm",
        align: "right",
        sticky: true,
        stickyPosition: "right",
        format: (_value, row) =>
          isSaleCollectableByCashier(row) ? (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onProcess(row);
              }}
            >
              Procesar
            </Button>
          ) : null,
      });
    }

    return base;
  }, [onProcess, showProcessColumn]);

  return (
    <TableCrud
      columns={columns}
      rows={rows}
      rowKey="id"
      loading={loading}
      hidePagination
      minTableWidth={0}
      emptyMessage={EMPTY_MESSAGES[activeTab]}
    />
  );
}
