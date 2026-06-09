import { DataTable } from "@/components";
import type { DataTableColumn } from "@/components";
import type { StatusChipVariant } from "@/components/TableCrud";
import type { ClientMovementItem } from "@/services/client-movements.service";

const MOVEMENT_TYPE_CHIP_LABELS: Record<string, string> = {
  payment: "Abono",
  purchase: "Compra",
};
const MOVEMENT_TYPE_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
  payment: "success",
  purchase: "default",
};

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function formatDate(value: unknown): string {
  if (!value) return "";
  try {
    const date = new Date(value as string);
    return `${date.getDate()} de ${MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
  } catch {
    return String(value);
  }
}

const COLUMNS: DataTableColumn<ClientMovementItem>[] = [
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
    format: (value) => formatDate(value),
  },
  { id: "amount", label: "Monto", type: "currency", align: "right" },
];

export interface MovementsTableProps {
  movements: ClientMovementItem[];
  loading?: boolean;
  onRowClick?: (movement: ClientMovementItem) => void;
}

export function MovementsTable({ movements, loading, onRowClick }: MovementsTableProps) {
  return (
    <DataTable<ClientMovementItem>
      columns={COLUMNS}
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
