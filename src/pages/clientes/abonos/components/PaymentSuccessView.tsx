import { Button, Divider, Stack, Typography } from "@mui/material";
import { Check, Download } from "lucide-react";
import numeral from "numeral";
import type { ClientPaymentResult } from "@/types/clientPayment.types";
import {
  PaymentDot,
  ReceiptDetailsCard,
  SuccessCard,
  SuccessIconWrapper,
} from "@/styles/clientes/abonos.styles";

export interface PaymentSuccessViewProps {
  result: ClientPaymentResult;
  onDownloadReceipt: () => void;
}

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export function PaymentSuccessView({ result, onDownloadReceipt }: PaymentSuccessViewProps) {
  return (
    <SuccessCard>
      <SuccessIconWrapper>
        <Check size={36} />
      </SuccessIconWrapper>

      <Stack spacing={0.5} alignItems="center">
        <Typography variant="h5" fontWeight={700}>¡Pago registrado!</Typography>
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
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Fecha</Typography>
            <Typography variant="body2">{result.dateLabel}</Typography>
          </Stack>

          {
            result.allocations.map((allocation) => (
              <Stack key={allocation.label} direction="row" justifyContent="space-between">
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
        Un comprobante de pago digital fue enviado a {result.clientPhone}
      </Typography>

      <Button
        variant="outlined"
        startIcon={<Download size={16} />}
        onClick={onDownloadReceipt}
        sx={{ textTransform: "none" }}
      >
        Descargar comprobante
      </Button>
    </SuccessCard>
  );
}

const PaymentSuccessViewPage = () => null;

export default PaymentSuccessViewPage;
