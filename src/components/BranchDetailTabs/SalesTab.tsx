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
import { ArrowDownFromLine, ListFilter, BadgeDollarSign, CircleArrowDown, CircleArrowUp } from "lucide-react";
import numeral from "numeral";
import { Card } from "@/styles/catalogos/goals.styles";
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
import { SalesMonthGoalCard, MonthlySalesComposedChartCard } from "@/components/SalesDashboard";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

interface SalesTabProps {
  branchId: number;
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
          <Button variant="outlined" size="small" startIcon={<ArrowDownFromLine strokeWidth={2} size={16} />}>
            Descargar reporte
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, md: 6 }}>
          <SalesMonthGoalCard thisMonth={kpis?.thisMonth ?? 0} goal={kpis?.goal ?? 0} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card padding="8px 16px">
            <Grid width="100%" height="100%" container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={0.5}>
                  <BadgeDollarSign strokeWidth={2} size={16} color={colors.text.secondary} />
                  <Typography variant="h4" fontWeight={600}>
                    {numeral(kpis?.performancePercent ?? 0).format("0,0%")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rendimiento
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={0.5}>
                  <BadgeDollarSign strokeWidth={2} size={16} color={colors.text.secondary} />
                  <Typography variant="h4" fontWeight={600}>
                    {numeral(kpis?.closeRatePercent ?? 0).format("0,0%")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tasa de cierre
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={0.5}>
                  <BadgeDollarSign strokeWidth={2} size={16} color={colors.text.secondary} />
                  <Typography variant="h4" fontWeight={600}>
                    {numeral(kpis?.avgTicket ?? 0).format("$0,0.00")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ticket promedio
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <MonthlySalesComposedChartCard data={monthlyData} title="Ventas por mes" />
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
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }} src={row.avatarUrl}>
                          {row.name.slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2">{row.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">{numeral(row.previousMonth).format("$0,0.00")}</TableCell>
                    <TableCell align="right">{numeral(row.thisMonth).format("$0,0.00")}</TableCell>
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
