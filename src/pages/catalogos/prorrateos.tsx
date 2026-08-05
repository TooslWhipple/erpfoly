import { useMemo, useState, useEffect } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  Banknote,
  ShoppingBag,
  Calendar,
  Store,
  MapPin,
  History,
  Play,
  Clock,
} from "lucide-react";
import { Title, TabFilters } from "@/components";
import {
  getApportionments,
  getApportionmentConfigs,
  updateApportionmentConfig,
  getApportionmentSnapshots,
  getApportionmentSnapshotById,
  triggerApportionmentSnapshot,
} from "@/services/apportionments.service";
import type {
  ApportionmentCalculationType,
  ApportionmentResponse,
} from "@/types/apportionments.types";
import { theme } from "@/styles/theme";
import { useSnackbarStore } from "@/store/useSnackbarStore";

const CALCULATION_TYPES: {
  value: ApportionmentCalculationType;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    value: "CONFIRMED_SALES",
    label: "Por Ventas Confirmadas",
    icon: <ShoppingBag size={18} />,
    description: "Cálculo basado en el monto total acumulado de ventas confirmadas.",
  },
  {
    value: "CASH",
    label: "Por Efectivo",
    icon: <Banknote size={18} />,
    description: "Cálculo basado en pagos recibidos en efectivo en caja.",
  },
];

type GroupingViewTab = "branches" | "zones";

const GROUPING_TABS: { value: GroupingViewTab; label: string }[] = [
  { value: "branches", label: "Sucursales" },
  { value: "zones", label: "Zonas (sus sucursales)" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProrrateosPage() {
  const queryClient = useQueryClient();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const getThirtyDaysAgoStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  };

  const getTodayStr = () => {
    return new Date().toISOString().split("T")[0];
  };

  const [calcType, setCalcType] = useState<ApportionmentCalculationType>("CONFIRMED_SALES");
  const [groupTab, setGroupTab] = useState<GroupingViewTab>("branches");
  const [startDate, setStartDate] = useState<string>(getThirtyDaysAgoStr);
  const [endDate, setEndDate] = useState<string>(getTodayStr);

  // Selected historical snapshot state
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(null);

  // Fetch configurations from DB (independent per calculation type)
  const { data: configsData = [] } = useQuery({
    queryKey: ["apportionmentConfigs"],
    queryFn: getApportionmentConfigs,
  });

  const configMap = useMemo(() => {
    const map = new Map<ApportionmentCalculationType, number>();
    configsData.forEach((c) => {
      map.set(c.calculationType, c.calculationDay);
    });
    return map;
  }, [configsData]);

  // Fetch historical snapshots list filtered by active calculation type
  const { data: snapshots = [] } = useQuery({
    queryKey: ["apportionmentSnapshots", calcType],
    queryFn: () => getApportionmentSnapshots(calcType),
  });

  // Fetch snapshot detail if a historical snapshot is selected
  const { data: snapshotDetail, isLoading: isLoadingSnapshot } = useQuery({
    queryKey: ["apportionmentSnapshot", selectedSnapshotId],
    queryFn: () => getApportionmentSnapshotById(selectedSnapshotId!),
    enabled: selectedSnapshotId !== null,
  });

  // Live calculation query
  const { data: liveData, isLoading: isLoadingLive, isError: isErrorLive } = useQuery({
    queryKey: ["apportionments", calcType, startDate, endDate],
    queryFn: () =>
      getApportionments({
        calculationType: calcType,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
    enabled: selectedSnapshotId === null,
  });

  // Active data to display (either historical snapshot detail or live data)
  const displayData: ApportionmentResponse | undefined = useMemo(() => {
    if (selectedSnapshotId !== null && snapshotDetail) {
      const rawData = snapshotDetail.data as any;
      if (rawData?.branches && rawData?.zones) {
        return rawData as ApportionmentResponse;
      }
      if (rawData?.confirmedSales || rawData?.cash) {
        if (calcType === "CASH" && rawData.cash) return rawData.cash;
        if (rawData.confirmedSales) return rawData.confirmedSales;
      }
      return snapshotDetail.data as any;
    }
    return liveData;
  }, [selectedSnapshotId, snapshotDetail, liveData, calcType]);

  const isLoading = selectedSnapshotId !== null ? isLoadingSnapshot : isLoadingLive;
  const isError = selectedSnapshotId === null && isErrorLive;

  // Save config mutation
  const saveConfigMutation = useMutation({
    mutationFn: updateApportionmentConfig,
    onSuccess: (updated) => {
      showSuccess(
        `Configuración guardada: ${updated.calculationType === "CONFIRMED_SALES" ? "Ventas Confirmadas" : "Efectivo"} se recalculará los días ${updated.calculationDay} de cada mes.`
      );
      queryClient.invalidateQueries({ queryKey: ["apportionmentConfigs"] });
    },
    onError: (err: any) => {
      showError(err?.message || "Error al guardar la configuración de recálculo.");
    },
  });

  // Trigger manual snapshot recalculation (30-day window computing BOTH sales & cash)
  const triggerSnapshotMutation = useMutation({
    mutationFn: triggerApportionmentSnapshot,
    onSuccess: () => {
      showSuccess(
        `Recálculo de los últimos 30 días ejecutado exitosamente y guardado como histórico.`
      );
      queryClient.invalidateQueries({ queryKey: ["apportionmentSnapshots"] });
    },
    onError: (err: any) => {
      showError(err?.message || "Error al ejecutar el recálculo manual.");
    },
  });

  const handleSelectCalcType = (type: ApportionmentCalculationType) => {
    setCalcType(type);
    setSelectedSnapshotId(null);
  };

  const totalGlobalAmount = displayData?.totalGlobalAmount ?? 0;
  const branches = useMemo(() => displayData?.branches ?? [], [displayData?.branches]);
  const zones = useMemo(() => displayData?.zones ?? [], [displayData?.zones]);

  // Top metric calculations
  const leaderBranch = useMemo(() => {
    if (!branches.length) return null;
    return [...branches].sort((a, b) => b.baseAmount - a.baseAmount)[0];
  }, [branches]);

  const leaderZone = useMemo(() => {
    if (!zones.length) return null;
    return [...zones].sort((a, b) => b.totalBaseAmount - a.totalBaseAmount)[0];
  }, [zones]);

  const activeCalcObj = CALCULATION_TYPES.find((c) => c.value === (displayData?.calculationType ?? calcType));

  const salesDayConfig = configMap.get("CONFIRMED_SALES") ?? 1;
  const cashDayConfig = configMap.get("CASH") ?? 1;

  return (
    <Stack spacing={3}>
      {/* Header with Title */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Title
          title="Catálogo de Prorrateos"
          description="Configuración de recálculo automático mensual independiente por tipo de prorrateo (3:00 AM, últimos 30 días) e histórico."
        />
      </Stack>

      {/* Recalculation Schedule Info Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          backgroundColor: "#f4f8ff",
          border: "1px solid #d0e1fd",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box
            sx={{
              p: 1.25,
              borderRadius: 2,
              backgroundColor: "#e1edfe",
              color: theme.palette.primary.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Clock size={22} />
          </Box>
          <Box flex={1}>
            <Typography variant="subtitle2" fontWeight={700} color="primary.main">
              Programación Independiente de Recálculos Automáticos (03:00 AM)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              • <strong>Ventas Confirmadas:</strong> Se recalcula los días <strong>{salesDayConfig} de cada mes</strong> (últimos 30 días).<br />
              • <strong>Efectivo:</strong> Se recalcula los días <strong>{cashDayConfig} de cada mes</strong> (últimos 30 días).
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Historical Selector & Mode Bar */}
      <Card sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.app.border}` }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <History size={20} color={theme.palette.primary.main} />
              <Typography variant="subtitle2" fontWeight={700}>
                Histórico ({calcType === "CONFIRMED_SALES" ? "Ventas Confirmadas" : "Efectivo"}):
              </Typography>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <FormControl fullWidth size="small">
              <Select
                value={selectedSnapshotId ?? "live"}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "live") {
                    setSelectedSnapshotId(null);
                  } else {
                    setSelectedSnapshotId(Number(val));
                  }
                }}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                <MenuItem value="live">
                  🟢 Cálculo Actual (En Vivo / Tiempo Real)
                </MenuItem>
                {snapshots.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    📜 Histórico #{s.id} ({formatDateDisplay(s.calculationDate)}) — 30 días ({s.periodStartDate} al {s.periodEndDate}) — {formatCurrency(s.totalGlobalAmount)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Top Metrics Cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.app.border}` }}>
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                TOTAL GLOBAL BASE
              </Typography>
              <Typography variant="h5" fontWeight={700} color="primary.main">
                {formatCurrency(totalGlobalAmount)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {branches.length} sucursales activas
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.app.border}` }}>
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                FORMA DE CÁLCULO
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {activeCalcObj?.label.replace("Por ", "") ?? "Ventas"}
              </Typography>
              <Chip
                label={calcType}
                size="small"
                variant="outlined"
                sx={{ width: "fit-content", fontSize: "0.7rem", height: 20 }}
              />
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.app.border}` }}>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Store size={16} color={theme.palette.primary.main} />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  SUCURSAL LÍDER
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={700} noWrap>
                {leaderBranch?.branchName ?? "N/A"}
              </Typography>
              <Typography variant="caption" color="success.main" fontWeight={700}>
                {leaderBranch ? `${leaderBranch.globalPercentage}% del total` : "0%"}
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.app.border}` }}>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <MapPin size={16} color={theme.palette.secondary.main} />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  ZONA LÍDER
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={700} noWrap>
                {leaderZone?.zoneName ?? "N/A"}
              </Typography>
              <Typography variant="caption" color="success.main" fontWeight={700}>
                {leaderZone ? `${leaderZone.globalPercentage}% del total` : "0%"}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Calculation Method & Per-Type Configuration Card */}
      <Card sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.app.border}` }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              FORMA DE CÁLCULO DE PRORRATEO Y CONFIGURACIÓN POR TIPO
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cada tipo de prorrateo guarda su propia fecha del mes e historial de cálculos de 30 días.
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {CALCULATION_TYPES.map((item) => {
              const selected = calcType === item.value;
              const typeDay = configMap.get(item.value) ?? 1;

              return (
                <Grid size={{ xs: 12, sm: 6 }} key={item.value}>
                  <Paper
                    onClick={() => handleSelectCalcType(item.value)}
                    elevation={selected ? 2 : 0}
                    sx={{
                      p: 2.5,
                      cursor: "pointer",
                      borderRadius: 2.5,
                      border: `2px solid ${
                        selected ? theme.palette.primary.main : theme.palette.app.border
                      }`,
                      backgroundColor: selected
                        ? theme.palette.action.hover
                        : "transparent",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            backgroundColor: selected
                              ? theme.palette.primary.main
                              : theme.palette.action.selected,
                            color: selected ? "#fff" : theme.palette.text.secondary,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {item.label}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.825rem", mb: 2 }}>
                      {item.description}
                    </Typography>

                    {/* Independent Day Config for this specific Calculation Type */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        pt: 1.5,
                        borderTop: `1px solid ${theme.palette.app.border}`,
                      }}
                    >
                      <Typography variant="caption" fontWeight={700} color="text.secondary">
                        Día del mes para recálculo:
                      </Typography>
                      <Select
                        size="small"
                        value={typeDay}
                        onChange={(e) => {
                          const newDay = Number(e.target.value);
                          saveConfigMutation.mutate({
                            calculationType: item.value,
                            calculationDay: newDay,
                          });
                        }}
                        sx={{
                          height: 32,
                          fontSize: "0.8rem",
                          borderRadius: 2,
                          fontWeight: 700,
                          backgroundColor: theme.palette.background.paper,
                        }}
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                          <MenuItem key={d} value={d} sx={{ fontSize: "0.8rem" }}>
                            Día {d}
                          </MenuItem>
                        ))}
                      </Select>
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {/* Date range inputs for live mode */}
          {selectedSnapshotId === null && (
            <Stack direction="row" alignItems="center" spacing={2} sx={{ pt: 1 }} flexWrap="wrap">
              <Stack direction="row" alignItems="center" spacing={1}>
                <Calendar size={18} color={theme.palette.text.secondary} />
                <Typography variant="body2" fontWeight={500}>
                  Período (En vivo):
                </Typography>
              </Stack>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.palette.app.border}`,
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  fontFamily: "inherit",
                }}
              />
              <Typography variant="body2" color="text.secondary">
                hasta
              </Typography>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.palette.app.border}`,
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  fontFamily: "inherit",
                }}
              />
              <Chip
                label="Restablecer a últimos 30 días"
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => {
                  setStartDate(getThirtyDaysAgoStr());
                  setEndDate(getTodayStr());
                }}
              />
            </Stack>
          )}
        </Stack>
      </Card>

      {/* Main View Tabs (Sucursales / Zonas) */}
      <Stack spacing={2}>
        <TabFilters
          tabs={GROUPING_TABS}
          activeTab={groupTab}
          onTabChange={(val) => setGroupTab(val as GroupingViewTab)}
        />

        {isLoading ? (
          <Box sx={{ width: "100%", py: 4 }}>
            <LinearProgress />
          </Box>
        ) : isError ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography color="error">Ocurrió un error al consultar el catálogo de prorrateos.</Typography>
          </Paper>
        ) : groupTab === "branches" ? (
          /* TAB 1: SUCURSALES */
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.app.border}`,
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: theme.palette.action.hover }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Sucursal</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Zona</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Monto Base ($)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 220 }}>
                    Participación (%)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {branches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      No hay registros disponibles para esta consulta.
                    </TableCell>
                  </TableRow>
                ) : (
                  branches.map((b) => (
                    <TableRow key={b.branchId} hover>
                      <TableCell>{b.branchId}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{b.branchName}</TableCell>
                      <TableCell>
                        <Chip
                          label={b.zoneName ?? "Sin zona"}
                          size="small"
                          variant={b.zoneName ? "filled" : "outlined"}
                          color={b.zoneName ? "primary" : "default"}
                          sx={{ fontSize: "0.75rem" }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {formatCurrency(b.baseAmount)}
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" fontWeight={700}>
                              {b.globalPercentage}%
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(b.globalPercentage, 100)}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: theme.palette.action.selected,
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 4,
                                backgroundColor: theme.palette.primary.main,
                              },
                            }}
                          />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          /* TAB 2: ZONAS (SUS SUCURSALES) */
          <Stack spacing={2}>
            {zones.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <Typography color="text.secondary">No hay zonas configuradas o datos disponibles.</Typography>
              </Paper>
            ) : (
              zones.map((z) => (
                <Accordion
                  key={z.zoneId ?? "no-zone"}
                  defaultExpanded
                  sx={{
                    borderRadius: "12px !important",
                    border: `1px solid ${theme.palette.app.border}`,
                    boxShadow: "none",
                    "&:before": { display: "none" },
                    overflow: "hidden",
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ChevronDown />}
                    sx={{
                      backgroundColor: theme.palette.action.hover,
                      px: 3,
                      py: 1,
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      width="100%"
                      spacing={2}
                      pr={2}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Typography variant="h6" fontWeight={700}>
                          {z.zoneName}
                        </Typography>
                        <Chip
                          label={`${z.branches.length} sucursales`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={3}>
                        <Box textAlign="right">
                          <Typography variant="caption" color="text.secondary">
                            Total Zona Base
                          </Typography>
                          <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                            {formatCurrency(z.totalBaseAmount)}
                          </Typography>
                        </Box>
                        <Box textAlign="right" sx={{ minWidth: 100 }}>
                          <Typography variant="caption" color="text.secondary">
                            % Global
                          </Typography>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {z.globalPercentage}%
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <TableContainer>
                      <Table size="small">
                        <TableHead sx={{ backgroundColor: theme.palette.action.selected }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Sucursal</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                              Monto Base ($)
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>% Global</TableCell>
                            <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>
                              % Relativo en Zona
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {z.branches.map((b) => (
                            <TableRow key={b.branchId} hover>
                              <TableCell>{b.branchId}</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>{b.branchName}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700 }}>
                                {formatCurrency(b.baseAmount)}
                              </TableCell>
                              <TableCell>{b.globalPercentage}%</TableCell>
                              <TableCell>
                                <Stack spacing={0.5}>
                                  <Typography variant="body2" fontWeight={700}>
                                    {b.relativeZonePercentage}%
                                  </Typography>
                                  <LinearProgress
                                    variant="determinate"
                                    value={Math.min(b.relativeZonePercentage, 100)}
                                    sx={{
                                      height: 6,
                                      borderRadius: 3,
                                      backgroundColor: theme.palette.action.selected,
                                      "& .MuiLinearProgress-bar": {
                                        borderRadius: 3,
                                        backgroundColor: theme.palette.secondary.main,
                                      },
                                    }}
                                  />
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
