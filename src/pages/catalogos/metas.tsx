import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import numeral from "numeral";
import {
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, Check as CheckIcon } from "@mui/icons-material";
import { Title, BranchMonthlyGoalsTable } from "@/components";
import type { BranchMonthlyGoalField } from "@/components";
import type { BranchMonthlyGoal } from "@/types/goals.types";
import {
  Card,
  ChartWrapper,
} from "@/styles/catalogos/goals.styles";
import { getGoalsPageData, saveBranchGoals } from "@/services/goals.service";
import type { ChartMetricType, SalesHistoryPoint } from "@/types/goals.types";
import { theme } from "@/styles/theme";
import { useSnackbarStore } from "@/store/useSnackbarStore";

// ============================================================================
// CHART METRIC OPTIONS
// ============================================================================

const CHART_METRIC_OPTIONS: { value: ChartMetricType; label: string }[] = [
  { value: "sales", label: "Ventas" },
  { value: "quotes", label: "Cotizaciones" },
  { value: "credits", label: "Créditos" },
];

// ============================================================================
// CUSTOM TOOLTIP
// ============================================================================

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div
      style={{
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.app.border}`,
        borderRadius: 4,
        padding: theme.spacing(1.5),
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        minWidth: 140,
      }}
    >
      <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: "block" }}>
        {label}
      </Typography>
      {payload.map((entry) => (
        <Typography key={entry.name} variant="caption" sx={{ color: entry.color, display: "block" }}>
          {entry.name}: {numeral(entry.value).format("$0,0.00")}
        </Typography>
      ))}
    </div>
  );
}

function XAxisTick({
  x,
  y,
  payload,
  index,
  data,
}: {
  x: number;
  y: number;
  payload?: unknown;
  index?: number;
  data: SalesHistoryPoint[];
}) {
  const payloadArr = Array.isArray(payload) ? payload : payload ? [payload] : [];
  const first = payloadArr[0];
  const label = first && typeof first === "object" && "value" in first
    ? String((first as { value: string }).value)
    : "";
  const point = index !== undefined ? data[index] : undefined;
  const salesFormatted = point ? numeral(point.sales).format("$0,0.00") : "";

  const labelOffset = 10;
  return (
    <g transform={`translate(${x},${y + labelOffset})`}>
      <text textAnchor="middle" dy={0} fontSize={12} fill="#71717A">
        {label}
      </text>
      <text textAnchor="middle" dy={16} fontSize={12} fill="#71717A">
        {salesFormatted}
      </text>
    </g>
  );
}

export default function MetasPage() {
  const router = useRouter();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartMetric, setChartMetric] = useState<ChartMetricType>("sales");
  const [chartAnchorEl, setChartAnchorEl] = useState<null | HTMLElement>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return { month: d.getMonth() + 1, year: d.getFullYear() };
  });
  const [salesHistory, setSalesHistory] = useState<SalesHistoryPoint[]>([]);
  const [monthLabel, setMonthLabel] = useState("");
  const [totalGoal, setTotalGoal] = useState(0);
  const [branchGoals, setBranchGoals] = useState<BranchMonthlyGoal[]>([]);
  const [originalGoals, setOriginalGoals] = useState<BranchMonthlyGoal[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGoalsPageData(
        currentMonth.month,
        currentMonth.year,
        chartMetric
      );
      setSalesHistory(data.salesHistory);
      setMonthLabel(data.monthlySummary.monthLabel);
      setBranchGoals(data.branchGoals);
      setOriginalGoals(data.branchGoals.map((g) => ({ ...g })));
      setTotalGoal(
        data.branchGoals.reduce((sum, branch) => sum + branch.monthlyGoal, 0)
      );
    } catch (err) {
      console.error("[Metas] Error fetching data:", err);
      setError("Error al cargar las metas");
    } finally {
      setLoading(false);
    }
  }, [currentMonth.month, currentMonth.year, chartMetric]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 1) return { month: 12, year: prev.year - 1 };
      return { month: prev.month - 1, year: prev.year };
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 12) return { month: 1, year: prev.year + 1 };
      return { month: prev.month + 1, year: prev.year };
    });
  };

  const handleChartFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setChartAnchorEl(event.currentTarget);
  };

  const handleChartFilterClose = () => {
    setChartAnchorEl(null);
  };

  const handleChartFilterSelect = (metric: ChartMetricType) => {
    setChartMetric(metric);
    handleChartFilterClose();
  };

  const currentMetricLabel = CHART_METRIC_OPTIONS.find((o) => o.value === chartMetric)?.label ?? "Ventas";

  const handleBranchGoalChange = useCallback(
    (rowId: string, field: BranchMonthlyGoalField, value: number) => {
      setBranchGoals((prev) => {
        const next = prev.map((row) =>
          row.id === rowId ? { ...row, [field]: value } : row
        );
        if (field === "monthlyGoal") {
          setTotalGoal(next.reduce((sum, row) => sum + row.monthlyGoal, 0));
        }
        return next;
      });
    },
    []
  );

  const handleBranchNavigate = useCallback(
    (row: BranchMonthlyGoal) => {
      void router.push(`/catalogos/sucursales/${row.id}`);
    },
    [router]
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await saveBranchGoals(currentMonth.month, currentMonth.year, branchGoals);
      setOriginalGoals(branchGoals.map((g) => ({ ...g })));
      showSuccess("Metas guardadas correctamente");
    } catch (err) {
      console.error("[Metas] Error saving goals:", err);
      showError("No se pudieron guardar las metas");
    } finally {
      setSaving(false);
    }
  }, [branchGoals, currentMonth.month, currentMonth.year, showSuccess, showError]);

  const breadcrumbs = [
    { label: "Catálogos", href: "/catalogos/productos" },
    { label: "Metas" },
  ];

  if (loading && !salesHistory.length) {
    return (
      <>
        <Stack direction="row" justifyContent="center" alignItems="center" sx={{ minHeight: 400 }}>
          <CircularProgress />
        </Stack>
      </>
    );
  }

  return (
    <>
      <Stack direction="column" spacing={3}>
        <Title
          title="Metas"
          description="Configura las metas por sucursal"
        />

        <Card>
          <Typography variant="h6">Historial de ventas</Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleChartFilterOpen}
          >
            {currentMetricLabel}
          </Button>
          <Menu
            id="chart-metric-menu"
            anchorEl={chartAnchorEl}
            open={Boolean(chartAnchorEl)}
            onClose={handleChartFilterClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {CHART_METRIC_OPTIONS.map((opt) => (
              <MenuItem
                key={opt.value}
                onClick={() => handleChartFilterSelect(opt.value)}
                selected={chartMetric === opt.value}
              >
                {chartMetric === opt.value && <CheckIcon sx={{ mr: 1, fontSize: 18 }} />}
                {opt.label}
              </MenuItem>
            ))}
          </Menu>

          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={salesHistory}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                barCategoryGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.app.border} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: theme.palette.app.border }}
                  tick={(props) => (
                    <XAxisTick
                      x={Number(props.x)}
                      y={Number(props.y)}
                      payload={props.payload}
                      index={props.index}
                      data={salesHistory}
                    />
                  )}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => numeral(v).format("0a")}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 8 }}
                  formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>}
                  iconType="rect"
                  iconSize={10}
                />
                <Bar
                  dataKey="sales"
                  name="Ventas"
                  fill="#C0DBFE"
                  radius={[4, 4, 0, 0]}
                  barSize={80}
                />
                <Line
                  type="monotone"
                  dataKey="goal"
                  name="Metas"
                  stroke="#DC2626"
                  strokeWidth={3}
                  dot={{ r: 0 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Card>

        <Card>
          <Stack width="100%" direction="row" justifyContent="space-between" alignItems="center">
            <Stack spacing={0.5} flex={6}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h4">{monthLabel}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton
                    onClick={handlePrevMonth}
                    size="small">
                    <ChevronLeftIcon />
                  </IconButton>
                  <IconButton
                    onClick={handleNextMonth}
                    size="small">
                    <ChevronRightIcon />
                  </IconButton>
                </Stack>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                El monto total de la meta mensual para esta sucursal está conformado por la meta individual de cada vendedor asignado.
              </Typography>
            </Stack>
            <Typography variant="h4" align="right" flex={1}>{numeral(totalGoal).format("$0,0.00")}</Typography>
          </Stack>
        </Card>

        <Card>
          <Typography variant="h6">Meta mensual por sucursal</Typography>
          <BranchMonthlyGoalsTable
            rows={branchGoals}
            originalRows={originalGoals}
            onRowChange={handleBranchGoalChange}
            onSave={handleSave}
            saving={saving}
            onBranchNavigate={handleBranchNavigate}
            emptyMessage="No hay metas configuradas para este mes."
          />
        </Card>
      </Stack>
    </>
  );
}
