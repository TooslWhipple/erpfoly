import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
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
  User,
  Users,
} from "lucide-react";
import numeral from "numeral";
import dayjs from "dayjs";
import { confirmInstallment } from "@/services/diverse-debtor-expenses.service";
import type { DiverseDebtorExpense, DiverseDebtorExpenseInstallment } from "@/types/diverse-debtor-expenses.types";

interface DiverseDebtorExpenseInstallmentsModalProps {
  expense: DiverseDebtorExpense | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function DiverseDebtorExpenseInstallmentsModal({
  expense,
  open,
  onClose,
  onUpdated,
}: DiverseDebtorExpenseInstallmentsModalProps) {
  const theme = useTheme();

  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [confirmNotes, setConfirmNotes] = useState<string>("");
  const [confirmModalTarget, setConfirmModalTarget] =
    useState<DiverseDebtorExpenseInstallment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!expense) return null;

  const handleOpenConfirm = (inst: DiverseDebtorExpenseInstallment) => {
    setConfirmModalTarget(inst);
    setConfirmNotes("");
    setErrorMsg(null);
  };

  const handleConfirmSubmit = async () => {
    if (!confirmModalTarget) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await confirmInstallment(
        confirmModalTarget.id,
        confirmNotes.trim() || undefined,
      );
      if (res.data) {
        setConfirmModalTarget(null);
        onUpdated();
      } else {
        setErrorMsg(res.error?.message || "Error al confirmar descuento.");
      }
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Error al confirmar descuento.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const installments = expense.installments || [];

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Users size={22} color={theme.palette.primary.main} />
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Desglose de Quincenas: {expense.folio}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Responsable: <strong>{expense.debtor?.fullName}</strong> ({expense.debtor?.employeeNumber})
                </Typography>
              </Box>
            </Stack>
            <Chip
              label={
                expense.status === "COMPLETED"
                  ? "Liquidado / Pagado"
                  : expense.status === "ACTIVE"
                  ? "En Descuentos Activos"
                  : expense.status
              }
              color={
                expense.status === "COMPLETED"
                  ? "success"
                  : expense.status === "ACTIVE"
                  ? "primary"
                  : "default"
              }
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5}>
            {/* Resumen Superior */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Monto Original
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {numeral(expense.amount).format("$0,0.00")}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Saldo Pendiente
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color={expense.remainingAmount > 0 ? "warning.main" : "success.main"}
                  >
                    {numeral(expense.remainingAmount).format("$0,0.00")}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Plazo en Quincenas
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {expense.installmentsCount} quincenas
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Por Quincena
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    {numeral(expense.installmentAmount).format("$0,0.00")}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Progreso */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" fontWeight={600}>
                    Progreso de Cobro en Nómina
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="primary.main">
                    {expense.progress?.confirmedCount || 0} de {expense.installmentsCount} quincenas confirmadas ({expense.progress?.percentage || 0}%)
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={expense.progress?.percentage || 0}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Stack>
            </Paper>

            {/* Evidencia y Concepto */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Concepto del Cobro
                </Typography>
                <Typography variant="body2">{expense.description}</Typography>
                {expense.evidenceUrl && (
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ pt: 1 }}>
                    <FileText size={16} color={theme.palette.primary.main} />
                    <Button
                      size="small"
                      variant="text"
                      endIcon={<ExternalLink size={14} />}
                      href={expense.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver Evidencia Adjunta ({expense.evidenceFileName || "Documento"})
                    </Button>
                  </Stack>
                )}
              </Stack>
            </Paper>

            {/* Tabla de Quincenas */}
            <Typography variant="subtitle1" fontWeight={700}>
              Calendario de Quincenas (Días 15 y Fin de Mes)
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 360 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Corte Quincenal</TableCell>
                    <TableCell align="right">Monto</TableCell>
                    <TableCell>Estatus</TableCell>
                    <TableCell>Confirmación / Notas</TableCell>
                    <TableCell align="center">Acción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {installments.map((inst) => {
                    const isConfirmed = inst.status === "CONFIRMED";
                    const formattedDate = dayjs(inst.cutOffDate).format("DD/MM/YYYY");
                    return (
                      <TableRow key={inst.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {inst.installmentNumber} / {inst.totalInstallments}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Calendar size={14} opacity={0.6} />
                            <Typography variant="body2" fontWeight={600}>
                              {formattedDate}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          {numeral(inst.amount).format("$0,0.00")}
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
                            label={isConfirmed ? "Descontado" : "Pendiente"}
                            color={isConfirmed ? "success" : "warning"}
                            variant={isConfirmed ? "filled" : "outlined"}
                          />
                        </TableCell>
                        <TableCell>
                          {isConfirmed ? (
                            <Stack spacing={0.3}>
                              <Typography variant="caption" fontWeight={600} color="success.main">
                                Confirmado {inst.confirmedAt ? dayjs(inst.confirmedAt).format("DD/MM/YYYY HH:mm") : ""}
                              </Typography>
                              {inst.confirmedBy && (
                                <Typography variant="caption" color="text.secondary">
                                  Por: {inst.confirmedBy}
                                </Typography>
                              )}
                              {inst.notes && (
                                <Typography variant="caption" color="text.secondary" fontStyle="italic">
                                  "{inst.notes}"
                                </Typography>
                              )}
                            </Stack>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Pendiente de procesar en nómina
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {!isConfirmed && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              onClick={() => handleOpenConfirm(inst)}
                            >
                              Confirmar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para confirmar descuento individual */}
      <Dialog
        open={Boolean(confirmModalTarget)}
        onClose={() => setConfirmModalTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirmar Descuento Realizado</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
            <Typography variant="body2">
              ¿Confirmas que se aplicó el descuento de{" "}
              <strong>
                {numeral(confirmModalTarget?.amount).format("$0,0.00")}
              </strong>{" "}
              correspondiente a la{" "}
              <strong>
                Quincena {confirmModalTarget?.installmentNumber} de{" "}
                {confirmModalTarget?.totalInstallments}
              </strong>{" "}
              al colaborador <strong>{expense.debtor?.fullName}</strong>?
            </Typography>
            <TextField
              label="Notas u observaciones (opcional)"
              placeholder="Ej. Descontado vía nómina quincena 1..."
              value={confirmNotes}
              onChange={(e) => setConfirmNotes(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button onClick={() => setConfirmModalTarget(null)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmSubmit}
            disabled={submitting}
            startIcon={
              submitting ? <CircularProgress size={16} color="inherit" /> : <CheckCircle2 size={16} />
            }
          >
            {submitting ? "Confirmando..." : "Confirmar Pago / Descuento"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
