import { DataTable } from "@/components";
import type { DataTableColumn } from "@/components";
import type { ChipStyleConfig } from "@/components";
import type { ClientMovement } from "@/types/clientes.types";

const MOVEMENT_TYPE_CHIP_CONFIG: Record<string, ChipStyleConfig> = {
  payment: { label: "Abono", bgColor: "#dcfce7", textColor: "#16a34a" },
  purchase: { label: "Compra", bgColor: "#dbeafe", textColor: "#2563eb" },
};

const COLUMNS: DataTableColumn<ClientMovement>[] = [
  {
    id: "type",
    label: "TIPO",
    type: "chip",
    chipConfig: MOVEMENT_TYPE_CHIP_CONFIG,
  },
  { id: "description", label: "DESCRIPCIÓN" },
  { id: "invoice", label: "FACTURA" },
  { id: "reference", label: "REFERENCIA" },
  { id: "date", label: "FECHA" },
  { id: "amount", label: "MONTO", type: "currency", align: "right" },
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
