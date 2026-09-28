import { MovementsTable } from "./MovementsTable";
import { PaymentRowOptionsMenu } from "./PaymentRowOptionsMenu";
import { useReprintClientPaymentReceipt } from "@/hooks/clientes/useReprintClientPaymentReceipt";
import type { ClientMovementItem } from "@/services/client-movements.service";

export interface PaymentsTabProps {
  clientId: number;
  payments: ClientMovementItem[];
  loading: boolean;
}

export function PaymentsTab({ clientId, payments, loading }: PaymentsTabProps) {
  const { canPrintReceipt, printingPaymentId, reprintReceipt } =
    useReprintClientPaymentReceipt(clientId);

  return (
    <MovementsTable
      movements={payments}
      loading={loading}
      renderRowOptions={
        canPrintReceipt
          ? (payment) => (
              <PaymentRowOptionsMenu
                payment={payment}
                canPrintReceipt={canPrintReceipt}
                isPrinting={printingPaymentId === payment.id}
                onPrintReceipt={(row) => void reprintReceipt(row)}
              />
            )
          : undefined
      }
    />
  );
}

const PaymentsTabPage = () => null;

export default PaymentsTabPage;
