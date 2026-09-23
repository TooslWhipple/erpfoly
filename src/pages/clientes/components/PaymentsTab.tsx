import { useRouter } from "next/router";
import { MovementsTable } from "./MovementsTable";
import type { ClientMovementItem } from "@/services/client-movements.service";

export interface PaymentsTabProps {
  clientId: number;
  payments: ClientMovementItem[];
  loading: boolean;
}

export function PaymentsTab({ clientId, payments, loading }: PaymentsTabProps) {
  const router = useRouter();

  return (
    <MovementsTable
      movements={payments}
      loading={loading}
      showReceiptColumn
      onRowClick={(payment) => {
        if (!payment.receipt_id) return;
        void router.push(
          `/clientes/${clientId}/abonos/comprobantes/${payment.receipt_id}`,
        );
      }}
    />
  );
}

const PaymentsTabPage = () => null;

export default PaymentsTabPage;
