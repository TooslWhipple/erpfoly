import { useState, useMemo, useEffect } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
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
  Tooltip,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  Calendar,
  Filter,
  Send,
  AlertCircle,
  Trash2,
  ListFilter,
  FileText,
  DollarSign,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Title } from "@/components";
import {
  getPolizas,
  enviarPoliza,
  enviarPolizasActivas,
  deletePoliza,
} from "@/services/polizas.service";
import { getPolizasSistema } from "@/services/polizas-sistema.service";
import type { PolizaSistema } from "@/types/contabilidad.types";
import type { Poliza, EstatusPoliza } from "@/types/polizas.types";
import { theme } from "@/styles/theme";
import { useSnackbarStore } from "@/store/useSnackbarStore";

const MESES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function formatCurrency(valor: number | string): string {
  const num = typeof valor === "string" ? parseFloat(valor) : valor;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(isNaN(num) ? 0 : num);
}

function formatearCuenta(codigo: string, mascara: string = "0000-0000-0000"): string {
  if (!codigo) return "—";
  const codigoLimpio = codigo.replace(/[-.\s]/g, "");
  if (!/^\d+$/.test(codigoLimpio)) return codigo;

  const soloDigitos = codigo.replace(/\D/g, "");
  let resultado = "";
  let idx = 0;
  for (let i = 0; i < mascara.length; i++) {
    const m = mascara[i];
    if (m === "0") {
      if (idx < soloDigitos.length) {
        resultado += soloDigitos[idx++];
      } else {
        break;
      }
    } else {
      resultado += m;
    }
  }
  while (idx < soloDigitos.length) {
    resultado += soloDigitos[idx++];
  }
  return resultado || codigo;
}

function totalCargos(movimientos: Poliza["movimientos"] = []): number {
  return movimientos
    .filter((m) => Number(m.escargo) === 1)
    .reduce((sum, m) => sum + Math.abs(Number(m.importe)), 0);
}

function totalAbonos(movimientos: Poliza["movimientos"] = []): number {
  return movimientos
    .filter((m) => Number(m.escargo) === 0)
    .reduce((sum, m) => sum + Math.abs(Number(m.importe)), 0);
}

export default function VisorPolizasPage() {
  const queryClient = useQueryClient();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const today = new Date();
  const firstDayOfMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  const todayStr = today.toISOString().split("T")[0];

  const [fechaInicio, setFechaInicio] = useState<string>(firstDayOfMonth);
  const [fechaFin, setFechaFin] = useState<string>(todayStr);
  const [selectedPolizaSistema, setSelectedPolizaSistema] = useState<string>("TODAS");
  const [selectedEstatus, setSelectedEstatus] = useState<string>("TODOS");

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [enviandoId, setEnviandoId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Fetch System Policies for filter dropdown
  const { data: polizasSistemaList = [] } = useQuery<PolizaSistema[]>({
    queryKey: ["polizasSistemaList"],
    queryFn: getPolizasSistema,
  });

  // Query Generated Polizas
  const {
    data: rawPolizas = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["generatedPolizas", fechaInicio, fechaFin],
    queryFn: () =>
      getPolizas({
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
      }),
  });

  // Client-side filtering by idpolizasistema and estatus
  const polizas = useMemo(() => {
    return rawPolizas.filter((p) => {
      if (
        selectedPolizaSistema !== "TODAS" &&
        p.idpolizasistema !== Number(selectedPolizaSistema)
      ) {
        return false;
      }
      if (selectedEstatus !== "TODOS" && p.estatus !== selectedEstatus) {
        return false;
      }
      return true;
    });
  }, [rawPolizas, selectedPolizaSistema, selectedEstatus]);

  // Expand / Collapse Helpers
  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => setExpandedIds(new Set(polizas.map((p) => p.id)));
  const collapseAll = () => setExpandedIds(new Set());

  // Global metric calculations
  const totalCargosGlobal = useMemo(
    () => polizas.reduce((sum, p) => sum + totalCargos(p.movimientos), 0),
    [polizas]
  );
  const totalAbonosGlobal = useMemo(
    () => polizas.reduce((sum, p) => sum + totalAbonos(p.movimientos), 0),
    [polizas]
  );
  const activasCount = useMemo(
    () => polizas.filter((p) => p.estatus === "ACTIVA" || p.estatus === "REGENERAR").length,
    [polizas]
  );

  // Mutations
  const enviarSingleMutation = useMutation({
    mutationFn: (id: number) => enviarPoliza(id),
    onMutate: (id) => setEnviandoId(id),
    onSuccess: (res, id) => {
      showSuccess(`Póliza #${id} enviada exitosamente.`);
      queryClient.invalidateQueries({ queryKey: ["generatedPolizas"] });
    },
    onError: (err: any) => {
      showError(err?.message || "Error al enviar la póliza.");
    },
    onSettled: () => setEnviandoId(null),
  });

  const enviarActivasMutation = useMutation({
    mutationFn: () =>
      enviarPolizasActivas({
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
      }),
    onSuccess: (res) => {
      showSuccess(
        `Envío completado: ${res.enviadas} enviadas exitosamente ${
          res.errores > 0 ? `, ${res.errores} con error.` : "."
        }`
      );
      queryClient.invalidateQueries({ queryKey: ["generatedPolizas"] });
    },
    onError: (err: any) => {
      showError(err?.message || "Error al enviar las pólizas activas.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePoliza(id),
    onSuccess: () => {
      showSuccess("Póliza eliminada exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["generatedPolizas"] });
      setDeleteId(null);
    },
    onError: (err: any) => {
      showError(err?.message || "Error al eliminar la póliza.");
    },
  });

  return (
    <Stack spacing={3}>
      {/* Header with Title and Global Actions */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Title
          title="Pólizas Generadas"
          description="Visor, consulta de movimientos, filtrado y envío de pólizas contables generadas."
        />
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <Button size="small" variant="text" onClick={expandAll} sx={{ fontWeight: 600 }}>
            Expandir todo
          </Button>
          <Typography variant="body2" color="text.secondary">|</Typography>
          <Button size="small" variant="text" onClick={collapseAll} sx={{ fontWeight: 600 }}>
            Colapsar todo
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Send size={16} />}
            onClick={() => enviarActivasMutation.mutate()}
            disabled={enviarActivasMutation.isPending || activasCount === 0}
            sx={{ fontWeight: 600, borderRadius: 2 }}
          >
            {enviarActivasMutation.isPending
              ? "Enviando..."
              : `Enviar Activas (${activasCount})`}
          </Button>
        </Stack>
      </Stack>

      {/* Filter Controls Card */}
      <Card sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.app.border}` }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Calendar size={18} color={theme.palette.text.secondary} />
              <Typography variant="body2" fontWeight={600}>
                Desde:
              </Typography>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.palette.app.border}`,
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  fontFamily: "inherit",
                }}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" fontWeight={600}>
                Hasta:
              </Typography>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.palette.app.border}`,
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  fontFamily: "inherit",
                }}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Póliza Sistema</InputLabel>
              <Select
                value={selectedPolizaSistema}
                label="Póliza Sistema"
                onChange={(e) => setSelectedPolizaSistema(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="TODAS">Todas las pólizas</MenuItem>
                {polizasSistemaList.map((p: PolizaSistema) => (
                  <MenuItem key={p.id} value={String(p.id)}>
                    {p.clave} - {p.descripcion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stack direction="row" spacing={1}>
              <FormControl fullWidth size="small">
                <InputLabel>Estatus</InputLabel>
                <Select
                  value={selectedEstatus}
                  label="Estatus"
                  onChange={(e) => setSelectedEstatus(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="ACTIVA">ACTIVA</MenuItem>
                  <MenuItem value="ENVIADA">ENVIADA</MenuItem>
                  <MenuItem value="REGENERAR">REGENERAR</MenuItem>
                  <MenuItem value="ERROR">ERROR</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => refetch()}
                sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
              >
                Buscar
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* Top Summary Metrics Cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.app.border}` }}>
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                TOTAL PÓLIZAS
              </Typography>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                {polizas.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activasCount} pendientes por enviar
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.app.border}` }}>
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                TOTAL CARGOS
              </Typography>
              <Typography variant="h5" fontWeight={700} color="primary.main">
                {formatCurrency(totalCargosGlobal)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Suma acumulada de cargos
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.app.border}` }}>
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                TOTAL ABONOS
              </Typography>
              <Typography variant="h5" fontWeight={700} color="success.main">
                {formatCurrency(totalAbonosGlobal)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Suma acumulada de abonos
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.app.border}` }}>
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                DIFERENCIA / BALANCE
              </Typography>
              <Typography
                variant="h5"
                fontWeight={700}
                color={
                  Math.abs(totalCargosGlobal - totalAbonosGlobal) < 0.01
                    ? "success.main"
                    : "error.main"
                }
              >
                {formatCurrency(totalCargosGlobal - totalAbonosGlobal)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.abs(totalCargosGlobal - totalAbonosGlobal) < 0.01
                  ? "Balanceado (Cuadrado)"
                  : "Descuadrado"}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Main List Section */}
      {isLoading ? (
        <Box sx={{ py: 5 }}>
          <LinearProgress />
        </Box>
      ) : isError ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error">Ocurrió un error al cargar las pólizas generadas.</Typography>
        </Paper>
      ) : polizas.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <FileText size={40} color={theme.palette.text.secondary} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
            No hay pólizas disponibles para los filtros seleccionados
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {polizas.map((poliza) => {
            const isOpen = expandedIds.has(poliza.id);
            const cargos = totalCargos(poliza.movimientos);
            const abonos = totalAbonos(poliza.movimientos);
            const fechaObj = new Date(poliza.fecha);

            const fechaFormatted = `${fechaObj.getUTCDate()} ${
              MESES[fechaObj.getUTCMonth()]
            } ${fechaObj.getUTCFullYear()}`;

            return (
              <Card
                key={poliza.id}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.app.border}`,
                  overflow: "hidden",
                }}
              >
                {/* Policy Header Bar */}
                <Box
                  onClick={() => toggleExpanded(poliza.id)}
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    backgroundColor: theme.palette.action.hover,
                    "&:hover": {
                      backgroundColor: theme.palette.action.selected,
                    },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5} flex={1}>
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}

                    {poliza.estatus === "ERROR" && (
                      <Tooltip title={poliza.error || "Error en generación de póliza"}>
                        <AlertCircle size={18} color={theme.palette.error.main} />
                      </Tooltip>
                    )}

                    <Grid container spacing={2} alignItems="center" sx={{ flex: 1 }}>
                      <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Número
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={700} fontFamily="monospace">
                          #{String(poliza.numero).padStart(4, "0")}
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Fecha
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {fechaFormatted}
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Concepto
                        </Typography>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {poliza.polizaSistema?.clave && (
                            <Typography
                              component="span"
                              variant="body2"
                              fontWeight={700}
                              color="primary.main"
                              sx={{ mr: 1 }}
                            >
                              [{poliza.polizaSistema.clave}]
                            </Typography>
                          )}
                          {poliza.concepto}
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 3 }} textAlign={{ xs: "left", sm: "right" }}>
                        <Typography variant="caption" color="primary.main" fontWeight={700} display="block">
                          Cargos: {formatCurrency(cargos)}
                        </Typography>
                        <Typography variant="caption" color="success.main" fontWeight={700} display="block">
                          Abonos: {formatCurrency(abonos)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Stack>

                  {/* Actions & Status Badge */}
                  <Stack direction="row" alignItems="center" spacing={1} onClick={(e) => e.stopPropagation()}>
                    <Chip
                      label={poliza.estatus}
                      size="small"
                      color={
                        poliza.estatus === "ACTIVA"
                          ? "success"
                          : poliza.estatus === "ENVIADA"
                          ? "info"
                          : poliza.estatus === "ERROR"
                          ? "error"
                          : "warning"
                      }
                      variant={poliza.estatus === "ACTIVA" ? "filled" : "outlined"}
                      sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                    />

                    {(poliza.estatus === "ACTIVA" || poliza.estatus === "REGENERAR") && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<Send size={14} />}
                        onClick={() => enviarSingleMutation.mutate(poliza.id)}
                        disabled={enviandoId === poliza.id}
                        sx={{ fontSize: "0.75rem", py: 0.5, px: 1.5, borderRadius: 1.5 }}
                      >
                        {enviandoId === poliza.id ? "Enviando..." : "Enviar"}
                      </Button>
                    )}

                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<Trash2 size={14} />}
                      onClick={() => setDeleteId(poliza.id)}
                      sx={{ fontSize: "0.75rem", py: 0.5, px: 1.5, borderRadius: 1.5 }}
                    >
                      Eliminar
                    </Button>
                  </Stack>
                </Box>

                {/* Movements Detail Table */}
                {isOpen && (
                  <TableContainer component={Paper} elevation={0} sx={{ borderTop: `1px solid ${theme.palette.app.border}` }}>
                    <Table size="small">
                      <TableHead sx={{ backgroundColor: theme.palette.action.selected }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, width: 50 }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Cuenta Contable</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Referencia</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Concepto</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Segmento de Negocio</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                            Cargo ($)
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                            Abono ($)
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {poliza.movimientos.map((mov) => {
                          const esCargo = Number(mov.escargo) === 1;
                          return (
                            <TableRow key={mov.id} hover>
                              <TableCell sx={{ color: "text.secondary" }}>{mov.numero}</TableCell>
                              <TableCell>
                                <Typography variant="body2" fontFamily="monospace" fontWeight={700}>
                                  {formatearCuenta(mov.cuentaDetalle?.cuenta || mov.cuenta)}
                                </Typography>
                                {mov.cuentaDetalle?.nombre && (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    {mov.cuentaDetalle.nombre}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>{mov.referencia || "—"}</TableCell>
                              <TableCell sx={{ fontSize: "0.8rem" }}>{mov.concepto || "—"}</TableCell>
                              <TableCell sx={{ fontSize: "0.8rem" }}>
                                {mov.segmento
                                  ? `${mov.segmento.codigo} — ${mov.segmento.nombre}`
                                  : mov.idsegmentodenegocio ?? "—"}
                              </TableCell>
                              <TableCell align="right" sx={{ fontFamily: "monospace", fontWeight: 700, color: theme.palette.primary.main }}>
                                {esCargo ? formatCurrency(mov.importe) : ""}
                              </TableCell>
                              <TableCell align="right" sx={{ fontFamily: "monospace", fontWeight: 700, color: theme.palette.success.main }}>
                                {!esCargo ? formatCurrency(mov.importe) : ""}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                      <TableHead sx={{ backgroundColor: theme.palette.action.hover }}>
                        <TableRow>
                          <TableCell colSpan={5} align="right" sx={{ fontWeight: 700 }}>
                            Totales de la Póliza:
                          </TableCell>
                          <TableCell align="right" sx={{ fontFamily: "monospace", fontWeight: 700, color: theme.palette.primary.main }}>
                            {formatCurrency(cargos)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontFamily: "monospace", fontWeight: 700, color: theme.palette.success.main }}>
                            {formatCurrency(abonos)}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                    </Table>
                  </TableContainer>
                )}
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>¿Eliminar Póliza Generada?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            ¿Estás seguro de que deseas eliminar la póliza <strong>#{deleteId}</strong>? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteId(null)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
            sx={{ fontWeight: 600 }}
          >
            {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
