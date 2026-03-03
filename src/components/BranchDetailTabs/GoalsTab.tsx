import { useState, useEffect, useCallback } from "react";
import {
  Stack,
  Typography,
  IconButton,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
import { DataTable } from "@/components";
import type { DataTableColumn } from "@/components";
import {
  Card,
  ChartWrapper
} from "@/styles/catalogos/goals.styles";
import { colors } from "@/styles/theme";
import { getSalesHistory, getSellerGoals } from "@/services/branchDetail.service";
import type { SalesHistoryPoint, SellerGoalRow } from "@/types/sucursales.types";

interface GoalsTabProps {
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

export function GoalsTab({ branchId }: GoalsTabProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesHistory, setSalesHistory] = useState<SalesHistoryPoint[]>([]);
  const [monthLabel, setMonthLabel] = useState("");
  const [totalGoal, setTotalGoal] = useState(0);
  const [sellers, setSellers] = useState<SellerGoalRow[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return { month: d.getMonth() + 1, year: d.getFullYear() };
  });

  const fetchData = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError(null);
    try {
      const [historyRes, goalsRes] = await Promise.all([
        getSalesHistory(branchId),
        getSellerGoals(branchId, currentMonth.month, currentMonth.year),
      ]);
      setSalesHistory(historyRes);
      setMonthLabel(goalsRes.monthLabel);
      setTotalGoal(goalsRes.totalGoal);
      setSellers(goalsRes.sellers);
    } catch (err) {
      console.error("[GoalsTab] Error:", err);
      setError("Error al cargar metas");
    } finally {
      setLoading(false);
    }
  }, [branchId, currentMonth.month, currentMonth.year]);

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

  const columns: DataTableColumn<SellerGoalRow>[] = [
    {
      id: "name",
      label: "Vendedor",
      format: (_, row) => (
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar
            sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
            src={row.avatarUrl}
          >
            {row.name.slice(0, 2).toUpperCase()}
          </Avatar>
          <Typography variant="body2">{row.name}</Typography>
        </Stack>
      ),
    },
    {
      id: "numCredits",
      label: "Num. Créditos",
      align: "right",
      format: (v) => numeral(v).format("0,0"),
    },
    {
      id: "newCredits",
      label: "Nuevos créditos",
      align: "right",
      format: (v) => numeral(v).format("$0,0"),
    },
    {
      id: "quoteGoal",
      label: "Meta cotizaciones",
      align: "right",
      format: (v) => numeral(v).format("$0,0"),
    },
    {
      id: "monthlyGoal",
      label: "Meta mensual",
      align: "right",
      type: "currency",
    },
  ];

  if (loading && !salesHistory.length) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight={320} spacing={2}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Cargando metas...
        </Typography>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack spacing={2}>
        <Typography color="error">{error}</Typography>
        <Typography variant="body2" onClick={fetchData} sx={{ cursor: "pointer", textDecoration: "underline" }}>
          Reintentar
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Card>
        <Typography variant="h6">Configura la meta para esta sucursal</Typography>
        <Typography variant="body2" color="text.secondary">
          El monto total de la meta mensual para esta sucursal está conformado por la meta individual de cada vendedor asignado.
        </Typography>
      </Card>

      <Card>
        <Typography variant="h6">Historial de ventas</Typography>
        <ChartWrapper>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={salesHistory}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              barCategoryGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis
                dataKey="label"
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
      </Card>

      <Card>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h5" fontWeight={600}>{monthLabel}</Typography>
            <IconButton onClick={handlePrevMonth} size="small">
              <ChevronLeft size={20} />
            </IconButton>
            <IconButton onClick={handleNextMonth} size="small">
              <ChevronRight size={20} />
            </IconButton>
          </Stack>
          <Typography variant="h4" fontWeight={600}>{numeral(totalGoal).format("$0,0.00")}</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          El monto total de la meta mensual para esta sucursal está conformado por la meta individual de cada vendedor asignado.
        </Typography>
      </Card>

      <Card>
        <Typography variant="h6">Meta mensual por vendedor</Typography>
        <DataTable
          columns={columns}
          rows={sellers}
          rowKey="id"
          emptyMessage="No hay vendedores con meta asignada."
        />
      </Card>
    </Stack>
  );
}
