import { useState, useEffect, useCallback } from "react";
import {
  Stack,
  Typography,
  Button,
  Paper,
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
} from "@mui/material";
import { Download, ChevronDown, TrendingUp, TrendingDown, ExternalLink, DollarSign } from "lucide-react";
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
  Card,
  CardTitle,
  ChartHeader,
  ChartFilterButton,
  ChartWrapper,
  TableCardTitle,
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
    <Paper
      elevation={2}
      sx={{
        p: 1.5,
        minWidth: 140,
        border: `1px solid ${colors.border}`,
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
    </Paper>
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
      <Card>
        <ChartHeader>
          <CardTitle>Dashboard de ventas</CardTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <ChartFilterButton
              variant="outlined"
              size="small"
              onClick={handleMonthOpen}
              endIcon={<ChevronDown size={16} />}
            >
              Mes actual [{currentMonthLabel}]
            </ChartFilterButton>
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
            <Button variant="outlined" size="small" startIcon={<Download size={16} />}>
              Descargar reporte
            </Button>
          </Stack>
        </ChartHeader>
        {kpis && (
          <Stack direction="row" flexWrap="wrap" gap={2} useFlexGap>
            <Stack flex="1" minWidth={120} spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Este mes
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <DollarSign size={18} color={colors.text.primary} />
                <Typography variant="h6" fontWeight={700}>
                  {numeral(kpis.thisMonth).format("$0,0.00")}
                </Typography>
              </Stack>
            </Stack>
            <Stack flex="1" minWidth={120} spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Meta
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <DollarSign size={18} color={colors.text.primary} />
                <Typography variant="h6" fontWeight={700}>
                  {numeral(kpis.goal).format("$0,0.00")}
                </Typography>
              </Stack>
            </Stack>
            <Stack flex="1" minWidth={100} spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Rendimiento
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {kpis.performancePercent}%
              </Typography>
            </Stack>
            <Stack flex="1" minWidth={100} spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Tasa de cierre
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {kpis.closeRatePercent}%
              </Typography>
            </Stack>
            <Stack flex="1" minWidth={140} spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Ticket promedio
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <DollarSign size={18} color={colors.text.primary} />
                <Typography variant="h6" fontWeight={700}>
                  {numeral(kpis.avgTicket).format("$0,0.00")}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        )}
      </Card>

      <Card>
        <ChartHeader>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              Ventas por mes
            </Typography>
            <Typography variant="caption" color="text.secondary">
              — Ventas
            </Typography>
            <Typography variant="caption" color="text.secondary">
              — Metas
            </Typography>
          </Stack>
          <Button variant="text" size="small" endIcon={<ExternalLink size={14} />}>
            Ver detalles
          </Button>
        </ChartHeader>
        <ChartWrapper>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={monthlyData}
              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
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
                fill="#2663EB"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
              <Line
                type="monotone"
                dataKey="goal"
                name="Metas"
                stroke="#DC2626"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 4"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </Card>

      <Card>
        <TableCardTitle>Ventas por vendedor</TableCardTitle>
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
                        <TrendingUp size={18} color="#16a34a" />
                      ) : (
                        <TrendingDown size={18} color="#dc2626" />
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
