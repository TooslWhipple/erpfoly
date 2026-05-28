import { DataTable } from "@/components";
import type { DataTableColumn } from "@/components";
import type { StatusChipVariant } from "@/components/StatusChip";
import type { ClientPurchasePayment } from "@/types/clientPurchase.types";

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PAID: "Pagado",
  PENDING: "Pendiente",
};

const PAYMENT_STATUS_VARIANTS: Record<string, StatusChipVariant> = {
  PAID: "success",
  PENDING: "default",
};

const COLUMNS: DataTableColumn<ClientPurchasePayment>[] = [
  {
    id: "status",
    label: "Estatus",
    type: "chip",
    chipLabelMap: PAYMENT_STATUS_LABELS,
    chipVariantMap: PAYMENT_STATUS_VARIANTS,
  },
  { id: "installmentLabel", label: "Pago" },
  { id: "dueDate", label: "Fecha" },
  { id: "amount", label: "Monto", type: "currency", align: "right" },
];

export interface PaymentHistoryTabProps {
  payments: ClientPurchasePayment[];
}

export function PaymentHistoryTab({ payments }: PaymentHistoryTabProps) {
  return (
    <DataTable<ClientPurchasePayment>
      columns={COLUMNS}
      rows={payments}
      rowKey="id"
      emptyMessage="No hay pagos registrados"
    />
  );
}

const PaymentHistoryTabPage = () => null;

export default PaymentHistoryTabPage;
