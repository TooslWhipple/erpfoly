import { DataTable } from "@/components";
import type { DataTableColumn } from "@/components";
import type { StatusChipVariant } from "@/components/TableCrud";
import type { ClientMovement } from "@/types/clientes.types";

const MOVEMENT_TYPE_CHIP_LABELS: Record<string, string> = {
  payment: "Abono",
  purchase: "Compra",
};
const MOVEMENT_TYPE_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
  payment: "success",
  purchase: "default",
};

const COLUMNS: DataTableColumn<ClientMovement>[] = [
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
  { id: "date", label: "Fecha" },
  { id: "amount", label: "Monto", type: "currency", align: "right" },
];

export interface MovementsTableProps {
  movements: ClientMovement[];
}

export function MovementsTable({ movements }: MovementsTableProps) {
  return (
    <DataTable<ClientMovement>
      columns={COLUMNS}
      rows={movements}
      rowKey="id"
      emptyMessage="No hay registros"
    />
  );
}

const MovementsTablePage = () => null;

export default MovementsTablePage;
