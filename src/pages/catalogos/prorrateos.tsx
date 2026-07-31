import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Banknote, CreditCard, ShoppingBag, Eye, Calendar, Store, MapPin } from "lucide-react";
import { Title, TabFilters } from "@/components";
import { getApportionments } from "@/services/apportionments.service";
import type {
  ApportionmentCalculationType,
} from "@/types/apportionments.types";
import { theme } from "@/styles/theme";

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
  {
    value: "CARD",
    label: "Por Pago de Tarjeta",
    icon: <CreditCard size={18} />,
    description: "Cálculo basado en cobros procesados por tarjeta de débito/crédito.",
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

export default function ProrrateosPage() {
  const [calcType, setCalcType] = useState<ApportionmentCalculationType>("CONFIRMED_SALES");
  const [groupTab, setGroupTab] = useState<GroupingViewTab>("branches");

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["apportionments", calcType, startDate, endDate],
    queryFn: () =>
      getApportionments({
        calculationType: calcType,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  const totalGlobalAmount = data?.totalGlobalAmount ?? 0;
  const branches = useMemo(() => data?.branches ?? [], [data?.branches]);
  const zones = useMemo(() => data?.zones ?? [], [data?.zones]);

  // Top metric calculations
  const leaderBranch = useMemo(() => {
    if (!branches.length) return null;
    return [...branches].sort((a, b) => b.baseAmount - a.baseAmount)[0];
  }, [branches]);

  const leaderZone = useMemo(() => {
    if (!zones.length) return null;
    return [...zones].sort((a, b) => b.totalBaseAmount - a.totalBaseAmount)[0];
  }, [zones]);

  const activeCalcObj = CALCULATION_TYPES.find((c) => c.value === calcType);

  return (
    <Stack spacing={3}>
      {/* Header with Title and Read-Only Badge */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Title
          title="Catálogo de Prorrateos"
          description="Cálculo y desglose porcentual de participación por sucursales y por zonas."
        />
        <Chip
          icon={<Eye size={16} />}
          label="Solo Lectura"
          variant="outlined"
          color="info"
          sx={{
            fontWeight: 600,
            px: 1,
            py: 0.5,
            borderColor: theme.palette.info.main,
            color: theme.palette.info.main,
          }}
        />
      </Stack>

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

      {/* Main Calculation Method Controls */}
      <Card sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.app.border}` }}>
        <Stack spacing={2}>
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
            FORMA DE CÁLCULO DE PRORRATEO
          </Typography>
          <Grid container spacing={2}>
            {CALCULATION_TYPES.map((item) => {
              const selected = calcType === item.value;
              return (
                <Grid size={{ xs: 12, sm: 4 }} key={item.value}>
                  <Paper
                    onClick={() => setCalcType(item.value)}
                    elevation={selected ? 2 : 0}
                    sx={{
                      p: 2,
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
                    <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
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
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.825rem" }}>
                      {item.description}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {/* Date range inputs */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ pt: 1 }} flexWrap="wrap">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Calendar size={18} color={theme.palette.text.secondary} />
              <Typography variant="body2" fontWeight={500}>
                Período:
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
            {(startDate || endDate) && (
              <Chip
                label="Limpiar fechas"
                size="small"
                onDelete={() => {
                  setStartDate("");
                  setEndDate("");
                }}
              />
            )}
          </Stack>
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
