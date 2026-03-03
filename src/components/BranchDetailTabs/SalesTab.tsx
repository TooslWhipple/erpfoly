import { useState, useEffect, useCallback } from "react";
import {
  Stack,
  Typography,
  Button,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Menu,
  MenuItem,
  Grid,
} from "@mui/material";
import {
  ArrowDownFromLine,
  ListFilter,
  BadgeDollarSign,
  CircleArrowDown,
  CircleArrowUp
} from "lucide-react";
import {
  Area,
  AreaChart,
  ComposedChart,
  Bar,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import numeral from "numeral";
import {
  Card,
  ChartWrapper
} from "@/styles/catalogos/goals.styles";
import { colors } from "@/styles/theme";
import {
  getSalesDashboard,
  getMonthlySales,
  getSalesBySeller,
} from "@/services/branchDetail.service";
import type {
  SalesDashboardKpis,
  MonthlySalesPoint,
  SellerSalesRow,
} from "@/types/sucursales.types";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/** Build synthetic cumulative progress data for the month (0 → thisMonth over ~15 points). */
function buildProgressData(thisMonth: number, goal: number): Array<{ day: number; cumulative: number; goal: number }> {
  const points = 15;
  const data: Array<{ day: number; cumulative: number; goal: number }> = [];
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const cumulative = Math.round(thisMonth * (1 - Math.pow(1 - t, 1.2)));
    data.push({ day: i + 1, cumulative, goal });
  }
  return data;
}

interface SalesTabProps {
  branchId: number;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  return (
    <Stack
      sx={{
        backgroundColor: colors.background.sidebar,
        border: `1px solid ${colors.border}`,
        borderRadius: 1,
        p: 1.5,
        boxShadow: 1,
        minWidth: 140,
      }}
    >
      <Typography variant="caption" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      {payload.map((entry) => (
        <Typography key={entry.name} variant="caption" display="block" sx={{ color: entry.color }}>
          {entry.name}: {numeral(entry.value).format("$0,0.00")}
        </Typography>
      ))}
    </Stack>
  );
}

export function SalesTab({ branchId }: SalesTabProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<SalesDashboardKpis | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlySalesPoint[]>([]);
  const [sellers, setSellers] = useState<SellerSalesRow[]>([]);
  const [monthAnchor, setMonthAnchor] = useState<null | HTMLElement>(null);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(() => new Date().getMonth());

  const fetchData = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError(null);
    try {
      const [kpisRes, monthlyRes, sellersRes] = await Promise.all([
        getSalesDashboard(branchId),
        getMonthlySales(branchId),
        getSalesBySeller(branchId),
      ]);
      setKpis(kpisRes);
      setMonthlyData(monthlyRes);
      setSellers(sellersRes);
    } catch (err) {
      console.error("[SalesTab] Error:", err);
      setError("Error al cargar datos de ventas");
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMonthOpen = (e: React.MouseEvent<HTMLElement>) => {
    setMonthAnchor(e.currentTarget);
  };
  const handleMonthClose = () => setMonthAnchor(null);
  const handleMonthSelect = (index: number) => {
    setSelectedMonthIndex(index);
    handleMonthClose();
  };

  const currentMonthLabel = MONTH_NAMES[selectedMonthIndex];

  if (loading && !kpis) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight={320} spacing={2}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Cargando dashboard de ventas...
        </Typography>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack spacing={2}>
        <Typography color="error">{error}</Typography>
        <Button variant="outlined" onClick={fetchData}>
          Reintentar
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">Dashboard de ventas</Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Menu
            anchorEl={monthAnchor}
            open={Boolean(monthAnchor)}
            onClose={handleMonthClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          >
            {MONTH_NAMES.map((name, index) => (
              <MenuItem
                key={name}
                onClick={() => handleMonthSelect(index)}
                selected={selectedMonthIndex === index}
              >
                {name}
              </MenuItem>
            ))}
          </Menu>
          <Button
            variant="outlined"
            size="small"
            onClick={handleMonthOpen}
            startIcon={<ListFilter strokeWidth={2} size={16} />}
          >
            Mes actual [{currentMonthLabel}]
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowDownFromLine strokeWidth={2} size={16} />}>
            Descargar reporte
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, md: 6 }}>
          <Card padding="8px 16px">
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 3 }}>
                <Stack spacing={0.5}>
                  <BadgeDollarSign strokeWidth={2} size={16} color={colors.text.secondary} />
                  <Typography variant="h4" fontWeight={600}>{numeral(kpis?.thisMonth ?? 0).format("$0,0.00")}</Typography>
                  <Typography variant="body2" color="text.secondary">Este mes</Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Stack spacing={0.5}>
                  <BadgeDollarSign strokeWidth={2} size={16} color={colors.text.secondary} />
                  <Typography variant="h4" fontWeight={600}>{numeral(kpis?.goal ?? 0).format("$0,0.00")}</Typography>
                  <Typography variant="body2" color="text.secondary">Meta</Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack height="100%" minHeight={104} justifyContent="flex-end">
                  <ResponsiveContainer width="100%" height={104}>
                    <AreaChart
                      data={buildProgressData(kpis?.thisMonth ?? 0, kpis?.goal ?? 0)}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2663EB" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#C0DBFE" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                      <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={{ stroke: colors.border }}
                        tick={{ fontSize: 10, fill: colors.text.secondary }}
                        tickFormatter={(v) => `D${v}`}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => numeral(v).format("0a")}
                        domain={[0, Math.max((kpis?.thisMonth ?? 0), (kpis?.goal ?? 0), 1) * 1.15]}
                      />
                      <ReferenceLine
                        y={kpis?.goal ?? 0}
                        stroke="#DC2626"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                      />
                      <Area
                        type="monotone"
                        dataKey="cumulative"
                        stroke="#2663EB"
                        strokeWidth={2}
                        fill="url(#progressFill)"
                        isAnimationActive={true}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Stack>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card padding="8px 16px">
            <Grid container spacing={2} alignItems="center" height="100%">
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={0.5}>
                  <BadgeDollarSign strokeWidth={2} size={16} color={colors.text.secondary} />
                  <Typography variant="h4" fontWeight={600}>{numeral(kpis?.performancePercent ?? 0).format("0,0%")}</Typography>
                  <Typography variant="body2" color="text.secondary">Rendimiento</Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={0.5}>
                  <BadgeDollarSign strokeWidth={2} size={16} color={colors.text.secondary} />
                  <Typography variant="h4" fontWeight={600}>{numeral(kpis?.closeRatePercent ?? 0).format("0,0%")}</Typography>
                  <Typography variant="body2" color="text.secondary">Tasa de cierre</Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={0.5}>
                  <BadgeDollarSign strokeWidth={2} size={16} color={colors.text.secondary} />
                  <Typography variant="h4" fontWeight={600}>{numeral(kpis?.avgTicket ?? 0).format("$0,0.00")}</Typography>
                  <Typography variant="body2" color="text.secondary">Ticket promedio</Typography>
                </Stack>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card>
            <Stack spacing={2}>
              <Typography variant="h6">Ventas por mes</Typography>
              <ChartWrapper>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={monthlyData}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    barCategoryGap={4}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={{ stroke: colors.border }}
                      tick={{ fontSize: 12, fill: colors.text.secondary }}
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
            </Stack>
          </Card>

        </Grid>
      </Grid>


      <Card>
        <Typography variant="h6">Ventas por vendedor</Typography>
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Vendedor</TableCell>
                <TableCell align="right">Mes anterior</TableCell>
                <TableCell align="right">Este mes</TableCell>
                <TableCell align="center" width={48} />
              </TableRow>
            </TableHead>
            <TableBody>
              {sellers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No hay datos de vendedores
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sellers.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar
                          sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                          src={row.avatarUrl}
                        >
                          {row.name.slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2">{row.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      {numeral(row.previousMonth).format("$0,0.00")}
                    </TableCell>
                    <TableCell align="right">
                      {numeral(row.thisMonth).format("$0,0.00")}
                    </TableCell>
                    <TableCell align="center">
                      {row.trend === "up" ? (
                        <CircleArrowUp size={18} color="#16a34a" />
                      ) : (
                        <CircleArrowDown size={18} color="#dc2626" />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Stack>
  );
}
