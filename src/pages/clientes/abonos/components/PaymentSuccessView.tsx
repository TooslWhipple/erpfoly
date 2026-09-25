import { CircularProgress, Divider, Stack, Typography } from "@mui/material";
import { Check, Download, Printer } from "lucide-react";
import numeral from "numeral";
import type { ClientPaymentResult } from "@/types/clientPayment.types";
import {
  PaymentDot,
  ReceiptDetailsCard,
  SuccessCard,
  SuccessCardBody,
  SuccessCardFooter,
  SuccessCardFooterAction,
  SuccessIconWrapper,
} from "@/styles/clientes/abonos.styles";

export interface PaymentSuccessViewProps {
  result: ClientPaymentResult;
  onDownloadReceipt: () => void;
  onPrintReceipt: () => void;
  isDownloadingReceipt?: boolean;
  isPrintingReceipt?: boolean;
}

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export function PaymentSuccessView({
  result,
  onDownloadReceipt,
  onPrintReceipt,
  isDownloadingReceipt = false,
  isPrintingReceipt = false,
}: PaymentSuccessViewProps) {
  const receiptUnavailable = !result.receiptId && result.paymentIds.length === 0;
  const receiptBusy = isDownloadingReceipt || isPrintingReceipt;

  return (
    <SuccessCard>
      <SuccessCardBody>
        <SuccessIconWrapper>
          <Check size={36} />
        </SuccessIconWrapper>

        <Stack spacing={0.5} alignItems="center">
          <Typography variant="h5" fontWeight={700}>¡Pago registrado!</Typography>
          {result.folio ? (
            <Typography variant="body2" color="text.secondary">
              Folio {result.folio}
            </Typography>
          ) : null}
          <Typography variant="h3" fontWeight={700}>{formatCurrency(result.totalAmount)}</Typography>
        </Stack>

        <ReceiptDetailsCard>
          <Typography variant="subtitle2" fontWeight={700}>Detalles del pago</Typography>

          <Stack spacing={0.5} alignItems="flex-end">
            {
              result.creditsAffectedCount > 1 ? (
                <Typography variant="caption" color="text.secondary">
                  {result.creditsAffectedCount} créditos abonados en este pago
                </Typography>
              ) : (
                <>
                  <Typography variant="caption" color="text.secondary">
                    {result.paidInstallments} de {result.totalInstallments} pagos
                  </Typography>
                  <Stack direction="row" spacing={0.25}>
                    {
                      Array.from({ length: result.totalInstallments }).map((_, index) => (
                        <PaymentDot key={index} active={index < result.paidInstallments} />
                      ))
                    }
                  </Stack>
                </>
              )
            }
          </Stack>

          <Stack spacing={1}>
            {result.clientName ? (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Cliente</Typography>
                <Typography variant="body2">{result.clientName}</Typography>
              </Stack>
            ) : null}

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Fecha</Typography>
              <Typography variant="body2">{result.dateLabel}</Typography>
            </Stack>

            {
              result.allocations.map((allocation, index) => (
                <Stack key={`${allocation.label}-${index}`} direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">{allocation.label}</Typography>
                  <Typography variant="body2">{formatCurrency(allocation.amount)}</Typography>
                </Stack>
              ))
            }

            <Divider sx={{ borderStyle: "dashed" }} />

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2" fontWeight={700}>Total</Typography>
              <Typography variant="subtitle2" fontWeight={700}>{formatCurrency(result.totalAmount)}</Typography>
            </Stack>
          </Stack>
        </ReceiptDetailsCard>

        <Typography variant="caption" color="text.secondary" textAlign="center">
          Conserve este comprobante. Puede volver a abrirlo desde el historial de abonos.
        </Typography>
      </SuccessCardBody>

      <SuccessCardFooter>
        <SuccessCardFooterAction
          type="button"
          onClick={onDownloadReceipt}
          disabled={receiptBusy || receiptUnavailable}
        >
          {isDownloadingReceipt ? <CircularProgress size={16} color="inherit" /> : <Download size={16} />}
          {isDownloadingReceipt ? "Generando PDF..." : "Descargar comprobante"}
        </SuccessCardFooterAction>
        <SuccessCardFooterAction
          type="button"
          onClick={onPrintReceipt}
          disabled={receiptBusy || receiptUnavailable}>
          {isPrintingReceipt ? <CircularProgress size={16} color="inherit" /> : <Printer size={16} />}
          {isPrintingReceipt ? "Generando PDF..." : "Imprimir"}
        </SuccessCardFooterAction>
      </SuccessCardFooter>
    </SuccessCard>
  );
}

const PaymentSuccessViewPage = () => null;

export default PaymentSuccessViewPage;
