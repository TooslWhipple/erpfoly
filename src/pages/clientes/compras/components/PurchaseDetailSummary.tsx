import { Stack, Typography } from "@mui/material";
import numeral from "numeral";
import type { ClientPurchaseDetail } from "@/types/clientPurchase.types";
import {
  FinancialMetric,
  FinancialSummaryRow,
  PaymentDot,
  PaymentDotsRow,
  PaymentProgressWrapper,
} from "@/styles/clientes/compra-detalle.styles";

export interface PurchaseDetailSummaryProps {
  purchase: ClientPurchaseDetail;
}

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export function PurchaseDetailSummary({ purchase }: PurchaseDetailSummaryProps) {
  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "flex-end" }}
        spacing={2}
      >
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            {purchase.reference}
          </Typography>
          <Typography variant="h5">{purchase.productName}</Typography>
          <Typography variant="body2" color="text.secondary">
            Comprado el {purchase.purchaseDateLabel}
          </Typography>
        </Stack>

        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary" align="right">
            {purchase.paidInstallments} de {purchase.totalInstallments} pagos
          </Typography>
          <Stack direction="row" spacing={0.25}>
            {
              Array.from({ length: purchase.totalInstallments }).map((_, index) => (
                <PaymentDot key={index} active={index < purchase.paidInstallments} />
              ))
            }
          </Stack>
        </Stack>
      </Stack>

      <FinancialSummaryRow>
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">Costo inicial</Typography>
          <Typography variant="body1" fontWeight={700}>{formatCurrency(purchase.initialCost)}</Typography>
        </Stack>

        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">Total abonos</Typography>
          <Typography variant="body1" fontWeight={700}>{formatCurrency(purchase.totalPaid)}</Typography>
        </Stack>

        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">Resta</Typography>
          <Typography variant="body1" fontWeight={700}>{formatCurrency(purchase.remaining)}</Typography>
        </Stack>

        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">Fecha de pago</Typography>
          <Typography variant="body1" fontWeight={700} color={purchase.highlightPaymentDueDate ? "error.main" : "text.primary"}>{purchase.paymentDueDate}</Typography>
        </Stack>

        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">Próx. Pago</Typography>
          <Typography variant="body1" fontWeight={700}>{formatCurrency(purchase.nextPaymentAmount)}</Typography>
        </Stack>
      </FinancialSummaryRow>
    </Stack>
  );
}

const PurchaseDetailSummaryPage = () => null;

export default PurchaseDetailSummaryPage;
