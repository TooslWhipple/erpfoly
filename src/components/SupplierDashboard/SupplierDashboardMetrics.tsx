import { Grid, Stack, Typography } from "@mui/material";
import numeral from "numeral";
import { Calculator, DollarSign, Wrench } from "lucide-react";
import type { SupplierDashboardSummary } from "@/types/supplierDashboard.types";
import { MetricCard, MetricIconWrapper } from "@/styles/catalogos/proveedores-detail.styles";

interface MetricConfig {
  id: string;
  label: string;
  value: number;
  icon: React.ReactNode;
}

interface SupplierDashboardMetricsProps {
  summary: SupplierDashboardSummary;
}

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export function SupplierDashboardMetrics({ summary }: SupplierDashboardMetricsProps) {
  const metrics: MetricConfig[] = [
    {
      id: "pending-payments",
      label: "Pagos pendientes",
      value: summary.pendingPayments,
      icon: <Calculator size={22} />,
    },
    {
      id: "supplier-charges",
      label: "Cargos a proveedor",
      value: summary.supplierCharges,
      icon: <Wrench size={22} />,
    },
    {
      id: "total-to-pay",
      label: "Total a pagar",
      value: summary.totalToPay,
      icon: <DollarSign size={22} />,
    },
  ];

  return (
    <Grid container spacing={2} alignItems="stretch">
      {
        metrics.map((metric) => (
          <Grid key={metric.id} size={{ xs: 12, md: 4 }}>
            <MetricCard>
              <MetricIconWrapper>{metric.icon}</MetricIconWrapper>
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">{metric.label}</Typography>
                <Typography variant="h3" fontWeight={700}>{formatCurrency(metric.value)}</Typography>
              </Stack>
            </MetricCard>
          </Grid>
        ))
      }
    </Grid>
  );
}
