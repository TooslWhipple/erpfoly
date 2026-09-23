import { DataTable } from "@/components";
import type { DataTableColumn } from "@/components";
import type { StatusChipVariant } from "@/components/TableCrud";
import type { ClientMovementItem } from "@/services/client-movements.service";
import { formatDate } from "@/utils/date";

const MOVEMENT_TYPE_CHIP_LABELS: Record<string, string> = {
  payment: "Abono",
  purchase: "Compra",
};
const MOVEMENT_TYPE_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
  payment: "success",
  purchase: "default",
};

const BASE_COLUMNS: DataTableColumn<ClientMovementItem>[] = [
  {
    id: "type",
    label: "Tipo",
    type: "chip",
    chipLabelMap: MOVEMENT_TYPE_CHIP_LABELS,
    chipVariantMap: MOVEMENT_TYPE_CHIP_VARIANTS,
  },
  { id: "description", label: "Descripción" },
  { id: "invoice", label: "Factura" },
  { id: "reference", label: "Referencia" },
  {
    id: "date",
    label: "Fecha",
    format: (value) => formatDate(value, "D [de] MMM, YYYY"),
  },
  { id: "amount", label: "Monto", type: "currency", align: "right" },
];

const RECEIPT_COLUMN: DataTableColumn<ClientMovementItem> = {
  id: "receipt_folio",
  label: "Comprobante",
  format: (value) => (value ? String(value) : "—"),
};

export interface MovementsTableProps {
  movements: ClientMovementItem[];
  loading?: boolean;
  showReceiptColumn?: boolean;
  onRowClick?: (movement: ClientMovementItem) => void;
}

export function MovementsTable({
  movements,
  loading,
  showReceiptColumn = false,
  onRowClick,
}: MovementsTableProps) {
  const columns = showReceiptColumn
    ? [
        ...BASE_COLUMNS.slice(0, 4),
        RECEIPT_COLUMN,
        ...BASE_COLUMNS.slice(4),
      ]
    : BASE_COLUMNS;

  return (
    <DataTable<ClientMovementItem>
      columns={columns}
      rows={movements}
      rowKey="id"
      emptyMessage="No hay registros"
      loading={loading}
      onRowClick={onRowClick}
    />
  );
}

const MovementsTablePage = () => null;

export default MovementsTablePage;
