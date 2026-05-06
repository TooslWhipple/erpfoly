import { useState } from "react";
import { useRouter } from "next/router";
import { Alert, Button, CircularProgress, Divider, Grid, Stack, Typography } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import numeral from "numeral";
import { ArrowDownFromLine, ArrowUpNarrowWide, BadgeDollarSign, Filter, LayoutList, ListFilter, ScanSearch } from "lucide-react";
import { MainLayout, Breadcrumbs, TableCrud, StatusChip } from "@/components";
import { SalesMonthGoalCard, MonthlySalesComposedChartCard } from "@/components/SalesDashboard";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { Column } from "@/components/TableCrud";
import { MonthlySalesGoalsModal } from "@/components/Sellers";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { fetchSellerDetailMock } from "@/services/sellers.service";
import type { SellerDetail, SellerSaleHistoryRow } from "@/types/sellers.types";
import { ChartCard, MetricCard, SectionCard, SectionCardHeader } from "@/styles/catalogos/vendedores.styles";
import { theme } from "@/styles/theme";

const CHART_PRIMARY = "#2663EB";

const historyColumns: Column<SellerSaleHistoryRow>[] = [
  { id: "code", label: "Código", size: "sm" },
  { id: "dateLabel", label: "Fecha y hora", size: "md" },
  {
    id: "type",
    label: "Tipo",
    type: "chip",
    size: "sm",
    chipLabelMap: { cash: "Contado", credit: "Crédito" },
    chipVariantMap: { cash: "infoAlt", credit: "info" },
  },
  { id: "articleName", label: "Artículo", size: "xl", truncate: true },
  { id: "department", label: "Departamento", size: "md", truncate: true },
  { id: "line", label: "Línea", size: "sm" },
  { id: "amount", label: "Monto", type: "currency", size: "sm" },
];

function formatCurrencyShort(value: number): string {
  return numeral(value).format("$0,0.00");
}

export default function VendedorDetailPage() {
  const router = useRouter();
  const rawId = router.query.id;
  const sellerId =
    typeof rawId === "string" && rawId.length > 0 ? Number.parseInt(rawId, 10) : null;
  const validId = sellerId != null && !Number.isNaN(sellerId) ? sellerId : null;

  const [detail, setDetail] = useState<SellerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useAsyncEffect(
    async (isCancelled) => {
      await Promise.resolve();
      if (isCancelled()) return;
      if (validId === null) {
        setDetail(null);
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const result = await fetchSellerDetailMock(validId);
      if (isCancelled()) return;
      if (result.error) {
        setDetail(null);
        setError(result.error.message);
      } else {
        setDetail(result.data);
      }
      if (!isCancelled()) {
        setLoading(false);
      }
    },
    [validId]
  );

  const breadcrumbItems: BreadcrumbItem[] =
    detail != null
      ? [
        { label: "Ventas", href: "/catalogos/vendedores" },
        { label: detail.fullName },
      ]
      : [{ label: "Ventas", href: "/catalogos/vendedores" }, { label: "Detalle" }];

  if (!router.isReady) {
    return (
      <MainLayout>
        <Stack alignItems="center" py={6}>
          <CircularProgress />
        </Stack>
      </MainLayout>
    );
  }

  if (validId === null) {
    return (
      <MainLayout>
        <Stack spacing={2}>
          <Breadcrumbs items={breadcrumbItems} />
          <Alert severity="warning">Identificador de vendedor no válido.</Alert>
        </Stack>
      </MainLayout>
    );
  }

  const showLoading = loading || (detail == null && !error);

  const donutData =
    detail != null
      ? [
        { name: "progress", value: detail.goalProgressPercent },
        { name: "remaining", value: Math.max(0, 100 - detail.goalProgressPercent) },
      ]
      : [];

  const monthlyComposedData =
    detail?.monthlyChart.map((point) => ({
      month: point.monthLabel,
      sales: point.sales,
      goal: point.goal,
    })) ?? [];

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent={{ xs: "flex-start", md: "space-between" }}
          alignItems="center"
          spacing={2}>
          <Breadcrumbs items={breadcrumbItems} />

          {
            detail != null &&
            <StatusChip
              label={detail.status === "ACTIVE" ? "Activo" : "Inactivo"}
              variant={detail.status === "ACTIVE" ? "success" : "default"}
              size="small"
            />
          }
        </Stack>

        {
          showLoading && <CircularProgress />
        }

        {
          error && <Alert severity="error">{error}</Alert>
        }

        {
          detail != null &&
          <Stack spacing={3}>
            <Typography variant="h2">{detail.fullName}</Typography>
            <Divider />
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent={{ xs: "flex-start", md: "space-between" }}
              alignItems="center"
              spacing={2}>
              <Typography variant="subtitle1">Dashboard de ventas</Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ListFilter size={16} />}
                  onClick={() => { }}>
                  Mes actual · {detail.currentMonthLabel}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ArrowDownFromLine size={16} />}
                  onClick={() => { }}>
                  Descargar reporte
                </Button>
              </Stack>
            </Stack>

            <Grid container spacing={2} alignItems="stretch">
              <Grid size={{ xs: 12, md: 6 }}>
                <SalesMonthGoalCard thisMonth={detail.currentMonthSales} goal={detail.currentMonthGoal} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <ChartCard>
                  <Grid container width="100%" height="100%" spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <div style={{ width: "88px", height: "88px" }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={donutData}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                                stroke="none">
                                <Cell fill={CHART_PRIMARY} />
                                <Cell fill={theme.palette.app.chip.background} />
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <Stack spacing={0.5}>
                          <ArrowUpNarrowWide strokeWidth={2} size={16} color={theme.palette.text.secondary} />
                          <Typography variant="h4">{detail.goalProgressPercent}%</Typography>
                          <Typography variant="body2" color="text.secondary">Meta alcanzada</Typography>
                        </Stack>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack spacing={0.5}>
                        <BadgeDollarSign strokeWidth={2} size={16} color={theme.palette.text.secondary} />
                        <Typography variant="h4">{numeral(detail.commissionAmount).format("$0,0.00")}</Typography>
                        <Typography variant="body2" color="text.secondary">Comisión ({detail.commissionRatePercent}%)</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ChartCard>
              </Grid>
            </Grid>

            <MonthlySalesComposedChartCard
              data={monthlyComposedData}
              title="Ventas por mes"
              headerEnd={
                <Button
                  variant="text"
                  color="primary"
                  size="small"
                  startIcon={<LayoutList size={16} />}
                  onClick={() => setModalOpen(true)}>
                  Ver detalles
                </Button>
              }
            />

            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} flexWrap="nowrap">
              <Typography variant="h6">Historial de ventas</Typography>
              <Button
                variant="outlined"
                size="small" startIcon={<ScanSearch size={16} />}
                onClick={() => { }}>
                Tipo
              </Button>
            </Stack>
            <TableCrud
              columns={historyColumns}
              rows={detail.salesHistory}
              rowKey="id"
              emptyMessage="No hay ventas registradas"
            />

            <MonthlySalesGoalsModal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              rows={detail.monthlyBreakdown}
            />
          </Stack>
        }
      </Stack>
    </MainLayout>
  );
}
