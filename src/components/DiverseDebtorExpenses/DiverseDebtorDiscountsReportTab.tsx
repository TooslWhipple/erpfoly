import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
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
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  RefreshCw,
  Search,
  Send,
  UserCheck,
  Users,
} from "lucide-react";
import numeral from "numeral";
import dayjs from "dayjs";
import {
  batchConfirmInstallments,
  confirmInstallment,
  getDiscountsReport,
} from "@/services/diverse-debtor-expenses.service";
import type {
  DiscountsReportRecord,
  DiscountsReportResponse,
} from "@/types/diverse-debtor-expenses.types";
import {
  getCurrentFortnightDate,
  getFortnightCutOffOptions,
} from "@/utils/fortnightCalculator";

export function DiverseDebtorDiscountsReportTab() {
  const theme = useTheme();

  const fortnightOptions = useMemo(() => getFortnightCutOffOptions(), []);
  const [selectedCutOff, setSelectedCutOff] = useState<string>(() =>
    getCurrentFortnightDate(),
  );

  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "CONFIRMED">(
    "ALL",
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<DiscountsReportResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selección múltiple para confirmación en lote
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Diálogo de confirmación (individual o masivo)
  const [confirmDialogTarget, setConfirmDialogTarget] = useState<{
    isBatch: boolean;
    record?: DiscountsReportRecord;
    count?: number;
    amount?: number;
  } | null>(null);
  const [confirmNotes, setConfirmNotes] = useState<string>("");
  const [submittingConfirm, setSubmittingConfirm] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await getDiscountsReport({
        cutOffDate: selectedCutOff,
        status: statusFilter,
      });
      if (res.data) {
        setReportData(res.data);
        setSelectedIds([]);
      } else {
        setErrorMsg(res.error?.message || "Error al cargar reporte de descuentos.");
      }
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Error al cargar reporte de descuentos.",
      );
    } finally {
      setLoading(false);
    }
  }, [selectedCutOff, statusFilter]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const filteredRecords = useMemo(() => {
    if (!reportData?.records) return [];
    if (!searchTerm.trim()) return reportData.records;

    const s = searchTerm.toLowerCase().trim();
    return reportData.records.filter((r) => {
      return (
        r.debtor?.fullName?.toLowerCase().includes(s) ||
        r.debtor?.employeeNumber?.toLowerCase().includes(s) ||
        r.debtor?.branchName?.toLowerCase().includes(s) ||
        r.folio?.toLowerCase().includes(s) ||
        r.expenseDescription?.toLowerCase().includes(s)
      );
    });
  }, [reportData, searchTerm]);

  const pendingRecords = useMemo(() => {
    return filteredRecords.filter((r) => r.status === "PENDING");
  }, [filteredRecords]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(pendingRecords.map((r) => r.installmentId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleOpenIndividualConfirm = (record: DiscountsReportRecord) => {
    setConfirmNotes("");
    setConfirmDialogTarget({
      isBatch: false,
      record,
      amount: record.amount,
    });
  };

  const handleOpenBatchConfirm = () => {
    if (!selectedIds.length) return;
    const selectedRecords = pendingRecords.filter((r) =>
      selectedIds.includes(r.installmentId),
    );
    const sumAmount = selectedRecords.reduce((acc, r) => acc + r.amount, 0);

    setConfirmNotes("");
    setConfirmDialogTarget({
      isBatch: true,
      count: selectedIds.length,
      amount: sumAmount,
    });
  };

  const handleConfirmSubmit = async () => {
    if (!confirmDialogTarget) return;
    setSubmittingConfirm(true);
    try {
      if (confirmDialogTarget.isBatch) {
        await batchConfirmInstallments(selectedIds, confirmNotes.trim() || undefined);
      } else if (confirmDialogTarget.record) {
        await confirmInstallment(
          confirmDialogTarget.record.installmentId,
          confirmNotes.trim() || undefined,
        );
      }
      setConfirmDialogTarget(null);
      await fetchReport();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Error al registrar la confirmación del descuento.",
      );
    } finally {
      setSubmittingConfirm(false);
    }
  };

  const summary = reportData?.summary;

  return (
    <Stack spacing={3}>
      {errorMsg && (
        <Alert severity="error" onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      {/* Barra de Filtros y Selección de Corte */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="cutoff-select-label">
                Fecha de Corte Quincenal (15 y Fin de Mes)
              </InputLabel>
              <Select
                labelId="cutoff-select-label"
                value={selectedCutOff}
                label="Fecha de Corte Quincenal (15 y Fin de Mes)"
                onChange={(e) => setSelectedCutOff(e.target.value)}
              >
                {fortnightOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 3, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Estatus Descuento</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Estatus Descuento"
                onChange={(e) =>
                  setStatusFilter(e.target.value as "ALL" | "PENDING" | "CONFIRMED")
                }
              >
                <MenuItem value="ALL">Todos los estatus</MenuItem>
                <MenuItem value="PENDING">Pendientes de descuento</MenuItem>
                <MenuItem value="CONFIRMED">Descontados / Confirmados</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 5, md: 3.5 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Buscar colaborador, folio o concepto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Search size={18} style={{ marginRight: 8, opacity: 0.6 }} />
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <Stack direction="row" spacing={1} justifyContent={{ md: "flex-end" }}>
              <Button
                variant="outlined"
                size="medium"
                startIcon={<RefreshCw size={16} />}
                onClick={fetchReport}
                disabled={loading}
              >
                Actualizar
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Tarjetas KPI de Resumen del Corte */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
              borderColor: alpha(theme.palette.primary.main, 0.25),
            }}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Total a Descontar en Quincena
              </Typography>
              <Typography variant="h5" fontWeight={800} color="primary.main">
                {numeral(summary?.totalDiscounts || 0).format("$0,0.00")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {summary?.recordsCount || 0} cuotas en este periodo
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.success.main, 0.04),
              borderColor: alpha(theme.palette.success.main, 0.25),
            }}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Descontado y Confirmado
              </Typography>
              <Typography variant="h5" fontWeight={800} color="success.main">
                {numeral(summary?.totalConfirmed || 0).format("$0,0.00")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pago confirmado por responsable
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.warning.main, 0.04),
              borderColor: alpha(theme.palette.warning.main, 0.25),
            }}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Pendiente de Descuento
              </Typography>
              <Typography variant="h5" fontWeight={800} color="warning.main">
                {numeral(summary?.totalPending || 0).format("$0,0.00")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Por aplicar en recibo de nómina
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.info.main, 0.04),
              borderColor: alpha(theme.palette.info.main, 0.25),
            }}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Colaboradores con Descuento
              </Typography>
              <Typography variant="h5" fontWeight={800} color="info.main">
                {summary?.debtorsCount || 0} deudores
              </Typography>
              <Typography variant="caption" color="text.secondary">
                En nómina de esta quincena
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barra de Acciones Masivas */}
      {selectedIds.length > 0 && (
        <Paper
          sx={{
            p: 1.5,
            px: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            borderColor: theme.palette.primary.main,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <CheckCircle2 size={20} color={theme.palette.primary.main} />
            <Typography variant="subtitle2" fontWeight={700}>
              {selectedIds.length} descuentos seleccionados
            </Typography>
          </Stack>

          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircle2 size={18} />}
            onClick={handleOpenBatchConfirm}
          >
            Confirmar Descuentos Seleccionados
          </Button>
        </Paper>
      )}

      {/* Tabla del Reporte */}
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        {loading && <CircularProgress size={24} sx={{ m: 2 }} />}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedIds.length > 0 &&
                    selectedIds.length < pendingRecords.length
                  }
                  checked={
                    pendingRecords.length > 0 &&
                    selectedIds.length === pendingRecords.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  disabled={pendingRecords.length === 0}
                />
              </TableCell>
              <TableCell>Colaborador / Deudor</TableCell>
              <TableCell>Folio / Concepto</TableCell>
              <TableCell>Cuota / Quincena</TableCell>
              <TableCell align="right">Monto a Descontar</TableCell>
              <TableCell align="right">Saldo Restante Gasto</TableCell>
              <TableCell>Evidencia</TableCell>
              <TableCell>Estatus</TableCell>
              <TableCell>Confirmación / Registro</TableCell>
              <TableCell align="center">Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {loading
                      ? "Cargando reporte de descuentos..."
                      : "No hay descuentos programados para la quincena seleccionada."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((r) => {
                const isConfirmed = r.status === "CONFIRMED";
                const isSelected = selectedIds.includes(r.installmentId);

                return (
                  <TableRow
                    key={r.installmentId}
                    hover
                    selected={isSelected}
                    sx={{
                      backgroundColor: isConfirmed
                        ? alpha(theme.palette.success.main, 0.02)
                        : undefined,
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggleRow(r.installmentId)}
                        disabled={isConfirmed}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.3}>
                        <Typography variant="body2" fontWeight={700}>
                          {r.debtor?.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          No. {r.debtor?.employeeNumber}
                          {r.debtor?.branchName ? ` • ${r.debtor.branchName}` : ""}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.3}>
                        <Typography variant="body2" fontWeight={600} color="primary.main">
                          {r.folio}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          sx={{ maxWidth: 220 }}
                          title={r.expenseDescription}
                        >
                          {r.expenseDescription}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={`Qna ${r.installmentNumber} de ${r.totalInstallments}`}
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, fontSize: "0.95rem" }}>
                      {numeral(r.amount).format("$0,0.00")}
                    </TableCell>
                    <TableCell align="right" sx={{ color: "text.secondary" }}>
                      {numeral(r.expenseRemainingAmount).format("$0,0.00")}
                    </TableCell>
                    <TableCell>
                      {r.evidenceUrl ? (
                        <Tooltip title="Ver evidencia adjunta">
                          <IconButton
                            size="small"
                            color="primary"
                            href={r.evidenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileText size={18} />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          Sin archivo
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        icon={
                          isConfirmed ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <Clock size={14} />
                          )
                        }
                        label={isConfirmed ? "Descontado" : "Por descontar"}
                        color={isConfirmed ? "success" : "warning"}
                        variant={isConfirmed ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell>
                      {isConfirmed ? (
                        <Stack spacing={0.2}>
                          <Typography variant="caption" fontWeight={600} color="success.main">
                            Confirmado {r.confirmedAt ? dayjs(r.confirmedAt).format("DD/MM/YYYY HH:mm") : ""}
                          </Typography>
                          {r.confirmedBy && (
                            <Typography variant="caption" color="text.secondary">
                              Por: {r.confirmedBy}
                            </Typography>
                          )}
                          {r.notes && (
                            <Typography variant="caption" color="text.secondary" fontStyle="italic">
                              "{r.notes}"
                            </Typography>
                          )}
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Pendiente de confirmar por responsable
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {!isConfirmed && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleOpenIndividualConfirm(r)}
                          startIcon={<CheckCircle2 size={14} />}
                        >
                          Confirmar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de Confirmación de Descuento (Individual / Masivo) */}
      <Dialog
        open={Boolean(confirmDialogTarget)}
        onClose={() => setConfirmDialogTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {confirmDialogTarget?.isBatch
            ? "¿Confirmar descuentos seleccionados?"
            : "¿Confirmar descuento realizado?"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {confirmDialogTarget?.isBatch ? (
              <Typography variant="body2">
                Se confirmará la aplicación de{" "}
                <strong>{confirmDialogTarget.count}</strong> descuentos en nómina
                por un monto total acumulado de{" "}
                <strong>
                  {numeral(confirmDialogTarget.amount).format("$0,0.00")}
                </strong>
                .
              </Typography>
            ) : (
              <Typography variant="body2">
                ¿Confirmas que se aplicó el descuento de{" "}
                <strong>
                  {numeral(confirmDialogTarget?.amount).format("$0,0.00")}
                </strong>{" "}
                correspondiente a la{" "}
                <strong>
                  Quincena {confirmDialogTarget?.record?.installmentNumber} de{" "}
                  {confirmDialogTarget?.record?.totalInstallments}
                </strong>{" "}
                al colaborador{" "}
                <strong>{confirmDialogTarget?.record?.debtor?.fullName}</strong>?
              </Typography>
            )}

            <TextField
              label="Observaciones / Comentario de confirmación"
              placeholder="Ej. Descontado en nómina del 15 de noviembre..."
              value={confirmNotes}
              onChange={(e) => setConfirmNotes(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button
            onClick={() => setConfirmDialogTarget(null)}
            disabled={submittingConfirm}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmSubmit}
            disabled={submittingConfirm}
            startIcon={
              submittingConfirm ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CheckCircle2 size={16} />
              )
            }
          >
            {submittingConfirm ? "Confirmando..." : "Confirmar Pago / Descuento"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
