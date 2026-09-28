import { useCallback, useState } from "react";
import { getApiErrorMessage } from "@/lib/axios";
import { printPdfBlob } from "@/lib/printing";
import { usePermissions } from "@/hooks/usePermissions";
import { CASH_REGISTERS_UPDATE } from "@/lib/permissions";
import {
  downloadClientPaymentReceiptById,
  downloadClientPaymentReceiptPdf,
} from "@/services/sale-credit.service";
import type { ClientMovementItem } from "@/services/client-movements.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";

export function useReprintClientPaymentReceipt(clientId: number) {
  const { hasPermission } = usePermissions();
  const showError = useSnackbarStore((s) => s.showError);
  const [printingPaymentId, setPrintingPaymentId] = useState<number | null>(null);

  const canPrintReceipt = hasPermission(CASH_REGISTERS_UPDATE);

  const reprintReceipt = useCallback(
    async (payment: ClientMovementItem) => {
      if (!canPrintReceipt) {
        showError("No tienes permiso para imprimir comprobantes de abono");
        return;
      }

      setPrintingPaymentId(payment.id);
      try {
        let blob: Blob;
        if (payment.receipt_id) {
          blob = await downloadClientPaymentReceiptById(
            clientId,
            payment.receipt_id,
          );
        } else {
          const paymentIds =
            payment.receipt_payment_ids && payment.receipt_payment_ids.length > 0
              ? payment.receipt_payment_ids
              : [payment.id];
          blob = await downloadClientPaymentReceiptPdf(clientId, paymentIds);
        }
        await printPdfBlob(blob);
      } catch (error) {
        showError(
          getApiErrorMessage(error) || "No se pudo imprimir el comprobante",
        );
      } finally {
        setPrintingPaymentId(null);
      }
    },
    [canPrintReceipt, clientId, showError],
  );

  return {
    canPrintReceipt,
    printingPaymentId,
    reprintReceipt,
  };
}
