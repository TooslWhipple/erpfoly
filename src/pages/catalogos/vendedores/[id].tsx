import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import numeral from "numeral";
import {
  ArrowUpNarrowWide,
  BadgeDollarSign,
  LayoutList,
  ScanSearch,
} from "lucide-react";
import {
  Breadcrumbs,
  TableCrud,
  StatusChip,
  OptionFilterButton,
  InlineBranchSelect,
  ConfirmModal,
  ItemNameHighlight,
  SellerPeriodSelect,
} from "@/components";
import {
  SalesMonthGoalCard,
  CreditsMonthGoalCard,
  NewCreditsMonthGoalCard,
  MonthlySalesComposedChartCard,
} from "@/components/SalesDashboard";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { Column } from "@/components/TableCrud";
import { MonthlySalesGoalsModal } from "@/components/Sellers";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import {
  SELLER_DETAIL_QUERY_KEY,
  useSellerDetail,
} from "@/hooks/useSellerDetail";
import { updateSellerBranch } from "@/services/sellers.service";
import {
  getBranchesCatalog,
  type BranchCatalogItem,
} from "@/services/branches.service";
import type {
  SellerSaleHistoryRow,
  SellerSaleType,
} from "@/types/sellers.types";
import {
  buildSellerPeriodOptions,
  periodCardLabel,
  toPeriodValue,
  type SellerPeriodOption,
  type SellerPeriodValue,
  splitDailyProgress,
} from "@/utils/sellerPeriods";
import {
  ChartCard,
} from "@/styles/catalogos/vendedores.styles";
import { theme } from "@/styles/theme";
import { formatDate } from "@/utils/date";
import { formatPercent } from "@/utils/number";
import { useSnackbarStore } from "@/store/useSnackbarStore";

const CHART_PRIMARY = "#2663EB";

const SALE_TYPE_OPTIONS = [
  { id: "cash", label: "Contado" },
  { id: "credit", label: "Crédito" },
];

const historyColumns: Column<SellerSaleHistoryRow>[] = [
  {
    id: "code",
    label: "Código",
    size: "sm",
  },
  {
    id: "createdAt",
    label: "Fecha y hora",
    size: "md",
    format: (value) => formatDate(value, "dateMonthTime12h"),
  },
  {
    id: "type",
    label: "Tipo",
    type: "chip",
    size: "sm",
    chipLabelMap: {
      cash: "Contado",
      credit: "Crédito",
    },
    chipVariantMap: {
      cash: "infoAlt",
      credit: "info",
    },
  },
  {
    id: "articleName",
    label: "Artículo",
    size: "xl",
    truncate: true,
  },
  {
    id: "department",
    label: "Departamento",
    size: "md",
    truncate: true,
  },
  {
    id: "line",
    label: "Línea",
    size: "sm",
  },
  {
    id: "amount",
    label: "Monto",
    type: "currency",
    size: "sm",
  },
];

export default function VendedorDetailPage() {
  const router = useRouter();
  const rawId = router.query.id;
  const sellerId =
    typeof rawId === "string" && rawId.length > 0
      ? Number.parseInt(rawId, 10)
      : null;
  const validId = sellerId != null && !Number.isNaN(sellerId) ? sellerId : null;
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const queryClient = useQueryClient();
  // Period chosen for one seller; another seller starts on the current month.
  const [periodSelection, setPeriodSelection] = useState<{
    sellerId: number | null;
    period: SellerPeriodValue | null;
  }>({ sellerId: null, period: null });
  const selectedPeriod =
    periodSelection.sellerId === validId ? periodSelection.period : null;

  const detailQuery = useSellerDetail(validId, selectedPeriod);
  const detail = detailQuery.data ?? null;
  const error = detailQuery.error?.message ?? null;

  const [modalOpen, setModalOpen] = useState(false);
  const [typeFilterIds, setTypeFilterIds] = useState<(string | number)[]>([]);
  const [branches, setBranches] = useState<BranchCatalogItem[]>([]);
  const [branchSaving, setBranchSaving] = useState(false);
  const [branchConfirmOpen, setBranchConfirmOpen] = useState(false);
  const [pendingBranchId, setPendingBranchId] = useState<number | null>(null);

  const reloadDetail = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: [...SELLER_DETAIL_QUERY_KEY, validId],
    });
  }, [queryClient, validId]);

  const periodOptions = useMemo(
    () => buildSellerPeriodOptions(detail?.sellerSince),
    [detail?.sellerSince],
  );
  const selectedPeriodValue = selectedPeriod
    ? toPeriodValue(selectedPeriod)
    : (periodOptions[0]?.value ?? "");

  const handlePeriodChange = (option: SellerPeriodOption) => {
    const isCurrent = option.value === periodOptions[0]?.value;
    setPeriodSelection({
      sellerId: validId,
      period: isCurrent ? null : { year: option.year, month: option.month },
    });
  };

  useAsyncEffect(
    async (isCancelled) => {
      await Promise.resolve();
      if (isCancelled()) return;
      try {
        const catalog = await getBranchesCatalog();
        if (!isCancelled()) {
          setBranches(catalog.filter((b) => !b.is_main_warehouse));
        }
      } catch {
        if (!isCancelled()) {
          setBranches([]);
        }
      }
    },
    [],
  );

  const handleBranchSelection = (branchId: number) => {
    if (validId === null || branchSaving) return;
    if (detail != null && branchId === detail.branchId) return;
    setPendingBranchId(branchId);
    setBranchConfirmOpen(true);
  };

  const handleCancelBranchChange = () => {
    if (branchSaving) return;
    setBranchConfirmOpen(false);
  };

  const handleBranchConfirmExited = () => {
    setPendingBranchId(null);
  };

  const handleConfirmBranchChange = async () => {
    if (validId === null || pendingBranchId == null || branchSaving) return;
    setBranchSaving(true);
    const result = await updateSellerBranch(validId, pendingBranchId);
    setBranchSaving(false);
    if (result.error) {
      showError(result.error.message || "No se pudo actualizar la sucursal");
      return;
    }
    setBranchConfirmOpen(false);
    showSuccess("Sucursal del vendedor actualizada correctamente.");
    reloadDetail();
  };

  const breadcrumbItems: BreadcrumbItem[] =
    detail != null
      ? [
          {
            label: "Ventas",
            href: "/catalogos/vendedores",
          },
          {
            label: detail.fullName,
          },
        ]
      : [
          {
            label: "Ventas",
            href: "/catalogos/vendedores",
          },
          {
            label: "Detalle",
          },
        ];

  if (!router.isReady) {
    return (
      <Stack alignItems="center" py={6}>
        <CircularProgress />
      </Stack>
    );
  }

  if (validId === null) {
    return (
      <Stack spacing={2}>
        <Breadcrumbs items={breadcrumbItems} />
        <Alert severity="warning">Identificador de vendedor no válido.</Alert>
      </Stack>
    );
  }

  const showLoading = detailQuery.isPending && validId !== null;

  // Without daily points (an API that predates them) the cards fall back to their synthetic curve.
  const dailySeries = detail?.dailyProgress?.length
    ? splitDailyProgress(detail.dailyProgress)
    : undefined;

  const donutData =
    detail != null
      ? [
          {
            name: "progress",
            value: detail.goalProgressPercent,
          },
          {
            name: "remaining",
            value: Math.max(0, 100 - detail.goalProgressPercent),
          },
        ]
      : [];

  const monthlyComposedData =
    detail?.monthlyChart.map((point) => ({
      month: point.monthLabel,
      sales: point.sales,
      goal: point.goal,
    })) ?? [];

  const selectedTypes = typeFilterIds.filter(
    (id): id is SellerSaleType => id === "cash" || id === "credit",
  );
  const filteredHistory =
    detail == null
      ? []
      : selectedTypes.length === 0 || selectedTypes.length === SALE_TYPE_OPTIONS.length
        ? detail.salesHistory
        : detail.salesHistory.filter((row) => selectedTypes.includes(row.type));

  const branchOptions =
    branches.length > 0
      ? branches
      : detail?.branchId != null && detail.branchName
        ? [{ id: detail.branchId, name: detail.branchName, is_main_warehouse: false }]
        : [];

  return (
    <Stack spacing={3}>
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        justifyContent={{
          xs: "flex-start",
          md: "space-between",
        }}
        alignItems="center"
        spacing={2}
      >
        <Breadcrumbs items={breadcrumbItems} />

        {detail != null && (
          <StatusChip
            label={detail.status === "ACTIVE" ? "Activo" : "Inactivo"}
            variant={detail.status === "ACTIVE" ? "success" : "default"}
            size="small"
          />
        )}
      </Stack>

      {showLoading && <CircularProgress />}

      {error && <Alert severity="error">{error}</Alert>}

      {detail != null && detail.id === validId && (
        <Stack spacing={3}>
          <Stack spacing={0.5}>
            <Typography variant="h2">{detail.fullName}</Typography>
            <InlineBranchSelect
              value={detail.branchId}
              options={branchOptions}
              onChange={handleBranchSelection}
              loading={branchSaving}
              disabled={branchOptions.length === 0}
            />
          </Stack>
          <Divider />
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Typography variant="subtitle1">Dashboard de ventas</Typography>
            <SellerPeriodSelect
              options={periodOptions}
              value={selectedPeriodValue}
              onChange={handlePeriodChange}
            />
          </Stack>

          <Stack
            spacing={3}
            sx={{
              opacity: detailQuery.isPlaceholderData ? 0.6 : 1,
              transition: "opacity 150ms",
            }}
            aria-busy={detailQuery.isPlaceholderData}
          >
            <Grid container spacing={2} alignItems="stretch">
              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <SalesMonthGoalCard
                  thisMonth={detail.currentMonthSales}
                  goal={detail.currentMonthGoal}
                  periodLabel={periodCardLabel(detail.period)}
                  series={dailySeries?.sales}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <ChartCard>
                  <Grid
                    container
                    width="100%"
                    height="100%"
                    spacing={2}
                    alignItems="center"
                  >
                    <Grid
                      size={{
                        xs: 12,
                        md: 6,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <div
                          style={{
                            width: "88px",
                            height: "88px",
                          }}
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={donutData}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                                stroke="none"
                              >
                                <Cell fill={CHART_PRIMARY} />
                                <Cell fill={theme.palette.app.chip.background} />
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <Stack spacing={0.5}>
                          <ArrowUpNarrowWide
                            strokeWidth={2}
                            size={16}
                            color={theme.palette.text.secondary}
                          />
                          <Typography variant="h4">
                            {formatPercent(detail.goalProgressPercent)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Meta alcanzada
                          </Typography>
                        </Stack>
                      </Stack>
                    </Grid>
                    <Grid
                      size={{
                        xs: 12,
                        md: 6,
                      }}
                    >
                      <Stack spacing={0.5}>
                        <BadgeDollarSign
                          strokeWidth={2}
                          size={16}
                          color={theme.palette.text.secondary}
                        />
                        <Typography variant="h4">
                          {numeral(detail.commissionAmount).format("$0,0.00")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Comisión ({detail.commissionRatePercent}%)
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ChartCard>
              </Grid>
            </Grid>

            <Grid container spacing={2} alignItems="stretch">
              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <CreditsMonthGoalCard
                  thisMonth={detail.currentMonthApprovedCredits}
                  goal={detail.currentMonthCreditGoal}
                  series={dailySeries?.approvedCredits}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <NewCreditsMonthGoalCard
                  thisMonth={detail.currentMonthApprovedNewCreditsAmount}
                  goal={detail.currentMonthNewCreditsGoal}
                  series={dailySeries?.newCreditsAmount}
                />
              </Grid>
            </Grid>

            <MonthlySalesComposedChartCard
              data={monthlyComposedData}
              title={`Ventas por mes ${detail.period.year}`}
              headerEnd={
                <Button
                  variant="text"
                  color="primary"
                  size="small"
                  startIcon={<LayoutList size={16} />}
                  onClick={() => setModalOpen(true)}
                >
                  Ver detalles
                </Button>
              }
            />

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
              flexWrap="nowrap"
            >
              <Typography variant="h6">
                Historial de ventas · {detail.period.label} {detail.period.year}
              </Typography>
              <OptionFilterButton
                label="Tipo"
                title="Tipo de venta"
                options={SALE_TYPE_OPTIONS}
                selectedIds={typeFilterIds}
                onChange={setTypeFilterIds}
                icon={<ScanSearch size={16} />}
              />
            </Stack>
            <TableCrud
              columns={historyColumns}
              rows={filteredHistory}
              rowKey="id"
              emptyMessage={`No hay ventas registradas en ${detail.period.label.toLowerCase()} ${detail.period.year}`}
            />
          </Stack>

          <MonthlySalesGoalsModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            rows={detail.monthlyBreakdown}
          />
        </Stack>
      )}

      <ConfirmModal
        open={branchConfirmOpen && pendingBranchId != null}
        onClose={handleCancelBranchChange}
        onConfirm={handleConfirmBranchChange}
        onExited={handleBranchConfirmExited}
        loading={branchSaving}
        type="warning"
        title="Confirmar cambio de sucursal"
        description={
          <>
            ¿Estás seguro que deseas cambiar la asignación de sucursal para este
            vendedor a{" "}
            <ItemNameHighlight>
              {branchOptions.find((b) => b.id === pendingBranchId)?.name ??
                "la sucursal seleccionada"}
            </ItemNameHighlight>
            ?
          </>
        }
        cancelLabel="Cancelar"
        confirmLabel="Confirmar"
      />
    </Stack>
  );
}
