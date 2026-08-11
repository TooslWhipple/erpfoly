import {
  Button,
  Grid,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { Plus } from "lucide-react";
import numeral from "numeral";
import type {
  MerchandiseReceptionBillingSummary,
  MerchandiseReceptionInvoice,
} from "@/types/merchandise-reception-discrepancies.types";
import {
  BillingWarningBox,
  ContentCard,
  InvoiceCard,
  LinearProgress as SuccessProgress,
} from "@/styles/costeos/detail.styles";
import { DISCREPANCY_INVOICE_TYPE_LABELS } from "./invoiceAdapter";

export interface DiscrepancyInvoicesSectionProps {
  invoices: MerchandiseReceptionInvoice[];
  summary: MerchandiseReceptionBillingSummary;
  onAddInvoice: () => void;
  canAddInvoice?: boolean;
}

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export function DiscrepancyInvoicesSection({
  invoices,
  summary,
  onAddInvoice,
  canAddInvoice = true,
}: DiscrepancyInvoicesSectionProps) {
  const theme = useTheme();
  const hasDiscrepancy = Math.abs(summary.discrepancy) > 0.01;
  const hasCreditNotes = Math.abs(summary.totalCreditNotes) > 0.01;

  const progressValue = Math.min(
    100,
    (Math.abs(summary.totalInvoiced + summary.totalCreditNotes) /
      Math.max(summary.totalArticles, 1)) *
      100,
  );

  return (
    <Stack spacing={{ xs: 2, md: 2.5 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        gap={1.5}
      >
        <Typography variant="h6">Facturas</Typography>
        {canAddInvoice && (
          <Button
            variant="option"
            color="inherit"
            startIcon={<Plus size={16} color={theme.palette.text.primary} />}
            onClick={onAddInvoice}
            sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}
          >
            Agregar factura
          </Button>
        )}
      </Stack>

      <Grid container spacing={{ xs: 2, md: 2.5 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
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
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                    spacing={{ xs: 1, sm: 2 }}
                    width="100%"
                  >
                    <Stack spacing={0.5} flex={1} minWidth={0}>
                      <Typography variant="body2" fontWeight={600}>
                        ID: {invoice.externalId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {invoice.date}
                      </Typography>
                    </Stack>

                    <Typography
                      variant="body2"
                      flex={{ sm: 1 }}
                      sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                      Tipo: {DISCREPANCY_INVOICE_TYPE_LABELS[invoice.type]}
                    </Typography>

                    <Typography
                      variant="body1"
                      fontWeight={700}
                      sx={{
                        width: { xs: "100%", sm: "auto" },
                        textAlign: { xs: "left", sm: "right" },
                      }}
                    >
                      {formatCurrency(invoice.amount)}
                    </Typography>
                  </Stack>
                </InvoiceCard>
              ))
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <ContentCard>
            <Stack spacing={1.5}>
              <Typography variant="body1" fontWeight={600}>
                Detalles de facturación
              </Typography>

              {hasDiscrepancy && (
                <BillingWarningBox>
                  <Typography variant="body2">
                    El monto total de las facturas es mayor al costo total de
                    los artículos.
                  </Typography>
                </BillingWarningBox>
              )}

              {hasDiscrepancy ? (
                <LinearProgress
                  variant="determinate"
                  color="warning"
                  value={Math.min(progressValue, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: theme.palette.app.border,
                  }}
                />
              ) : (
                <SuccessProgress
                  variant="determinate"
                  value={Math.min(progressValue, 100)}
                />
              )}

              <Stack
                direction="row"
                justifyContent="space-between"
                gap={1}
                flexWrap="wrap"
              >
                <Typography variant="body2" color="text.secondary">
                  Total facturado
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color={hasDiscrepancy ? "text.primary" : "success.main"}
                >
                  {formatCurrency(summary.totalInvoiced)}
                </Typography>
              </Stack>

              {!hasDiscrepancy && hasCreditNotes && (
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  gap={1}
                  flexWrap="wrap"
                >
                  <Typography variant="body2" color="text.secondary">
                    Total Notas de crédito
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(summary.totalCreditNotes)}
                  </Typography>
                </Stack>
              )}

              <Stack
                direction="row"
                justifyContent="space-between"
                gap={1}
                flexWrap="wrap"
              >
                <Typography variant="body2" color="text.secondary">
                  Total artículos
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatCurrency(summary.totalArticles)}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                justifyContent="space-between"
                gap={1}
                flexWrap="wrap"
              >
                <Typography variant="body2" color="text.secondary">
                  Discrepancia
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatCurrency(summary.discrepancy)}
                </Typography>
              </Stack>
            </Stack>
          </ContentCard>
        </Grid>
      </Grid>
    </Stack>
  );
}
