import { Button } from "@mui/material";
import { TableCrud } from "@/components";
import type { Column } from "@/components/TableCrud";
import type { SaleListItem } from "@/types/ventas.types";

export interface PendingCollectionsPanelProps {
  rows: SaleListItem[];
  loading?: boolean;
  onProcess: (sale: SaleListItem) => void;
}

export function PendingCollectionsPanel({
  rows,
  loading = false,
  onProcess,
}: PendingCollectionsPanelProps) {
  const columns: Column<SaleListItem>[] = [
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
      format: (value) => (value == null || value === "" ? "—" : String(value)),
    },
    {
      id: "sellerName",
      label: "Vendedor",
      size: "sm",
      format: (value) => (value == null || value === "" ? "—" : String(value)),
    },
    {
      id: "totalAmount",
      label: "Monto",
      type: "currency",
      size: "sm",
      align: "right",
    },
    {
      id: "process",
      label: "",
      type: "button",
      size: "sm",
      align: "right",
      sticky: true,
      stickyPosition: "right",
      buttonLabel: "Procesar",
      buttonVariant: "contained",
      buttonColor: "primary",
      onButtonClick: onProcess,
    },
  ];

  return (
    <TableCrud
      columns={columns}
      rows={rows}
      rowKey="id"
      loading={loading}
      hidePagination
      minTableWidth={0}
      emptyMessage="No se encontraron ventas pendientes de cobro"
    />
  );
}
