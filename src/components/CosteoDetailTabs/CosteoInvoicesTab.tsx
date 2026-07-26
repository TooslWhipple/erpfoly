import { Grid, Stack, Typography } from "@mui/material";
import numeral from "numeral";
import type {
  CosteoBillingSummary,
  CosteoInvoice,
  CosteoInvoiceType,
} from "@/types/costeos.types";
import {
  ContentCard,
  LinearProgress,
  InvoiceCard,
} from "@/styles/costeos/detail.styles";
import { theme } from "@/styles/theme";

interface CosteoInvoicesTabProps {
  invoices: CosteoInvoice[];
  summary: CosteoBillingSummary;
}

const INVOICE_TYPE_LABELS: Record<CosteoInvoiceType, string> = {
  PUE: "PUE",
  PPD: "PPD",
  CREDIT_NOTE: "Nota de crédito",
};

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export function CosteoInvoicesTab({
  invoices,
  summary,
}: CosteoInvoicesTabProps) {
  const hasDiscrepancy = Math.abs(summary.discrepancy) > 0.01;
  const progressValue = Math.min(
    100,
    Math.abs(summary.totalInvoiced + summary.totalCreditNotes) /
    Math.max(summary.totalArticles, 1) *
    100,
  );

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 9 }}>
        <Stack spacing={1.5}>
          {invoices.length === 0 ? (
            <InvoiceCard>
              <Typography variant="body2" color="text.secondary">
                No hay facturas asociadas
              </Typography>
            </InvoiceCard>
          ) : (
            invoices.map((invoice) => (
              <InvoiceCard key={invoice.id}>
                <Stack spacing={0.5} flex={1}>
                  <Typography variant="body2" fontWeight={600}>
                    ID: {invoice.externalId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {invoice.date}
                  </Typography>
                </Stack>
                <Typography variant="body2" flex={1}>
                  Tipo: {INVOICE_TYPE_LABELS[invoice.type]}
                </Typography>
                <Typography variant="body1" fontWeight={700}>
                  {formatCurrency(invoice.amount)}
                </Typography>
              </InvoiceCard>
            ))
          )}
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, lg: 3 }}>
        <ContentCard>
          <Stack spacing={1.5}>
            <Typography variant="body1" fontWeight={600}>Detalles de facturación</Typography>

            <LinearProgress
              variant="determinate"
              value={Math.min(progressValue, 100)}
            />

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Total facturado</Typography>
              <Typography variant="body2" fontWeight={600}>{formatCurrency(summary.totalInvoiced)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Total Notas de crédito</Typography>
              <Typography variant="body2" fontWeight={600}>{formatCurrency(summary.totalCreditNotes)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Total artículos</Typography>
              <Typography variant="body2" fontWeight={600}>{formatCurrency(summary.totalArticles)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Discrepancia</Typography>
              <Typography variant="body2" fontWeight={600}>{formatCurrency(summary.discrepancy)}</Typography>
            </Stack>
          </Stack>
        </ContentCard>
      </Grid>
    </Grid>
  );
}
