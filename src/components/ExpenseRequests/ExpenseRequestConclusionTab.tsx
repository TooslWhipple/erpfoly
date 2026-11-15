import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Slider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  CheckCircle2,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CalendarClock,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  Coins,
  Send,
} from "lucide-react";
import numeral from "numeral";
import { FormDatePicker, FormTextField } from "@/components/Form";
import type {
  CompleteExpenseVerificationPayload,
  ExpenseRequestDetail,
} from "@/types/expense-requests.types";
import { formatDate } from "@/utils/date";
import { calculateFortnightSchedulePreview } from "@/utils/fortnightCalculator";

export interface ExpenseRequestConclusionTabProps {
  request: ExpenseRequestDetail;
  onConclude: (payload?: CompleteExpenseVerificationPayload) => Promise<void>;
  canConclude?: boolean;
  canReviewAndComplete?: boolean;
}

function getTomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function ExpenseRequestConclusionTab({
  request,
  onConclude,
  canConclude = true,
  canReviewAndComplete = true,
}: ExpenseRequestConclusionTabProps) {
  const muiTheme = useTheme();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reimbursementDate, setReimbursementDate] = useState<string>(
    getTomorrowIso(),
  );

  const isCompleted = request.status === "COMPLETED";
  const isInComprobation =
    request.status === "IN_COMPROBATION" || request.status === "APPROVED";
  const isInVerification = request.status === "IN_VERIFICATION";

  const requested = request.requestedAmount || 0;
  const verified = request.verifiedAmount || 0;
  const difference = Number((requested - verified).toFixed(2));
  const isCajaChica = request.classification === "CAJA_CHICA";

  // Excedente que la empresa debe reembolsar al empleado (gastó más de lo que se le anticipó)
  const employeeExcess =
    verified > requested ? Number((verified - requested).toFixed(2)) : 0;
  // Sobrante en poder del empleado que debe devolver a la empresa (gastó menos del anticipo)
  const leftoverToReturn =
    requested > verified ? Number((requested - verified).toFixed(2)) : 0;
  // Cuadrado exacto (monto solicitado/dispersado coincide exactamente con lo comprobado)
  const isExactMatch = requested > 0 && Math.abs(difference) === 0;

  const defaultReimbursementAmount = useMemo(() => {
    if (isCajaChica) return verified;
    // Si la comprobación está cuadrada ($0) o si le sobró dinero al empleado, NO hay reembolso
    if (isExactMatch || leftoverToReturn > 0) return 0;
    // Si gastó de más por encima del anticipo, se le reembolsa únicamente el excedente
    if (employeeExcess > 0) return employeeExcess;
    // Solicitud directa de reembolso sin anticipo (donde requested === 0 y verified > 0)
    if (requested === 0 && verified > 0) return verified;
    return 0;
  }, [isCajaChica, isExactMatch, leftoverToReturn, employeeExcess, requested, verified]);

  const hasReimbursementToSchedule = defaultReimbursementAmount > 0;

  const [customReimbursementAmount, setCustomReimbursementAmount] =
    useState<string>(defaultReimbursementAmount > 0 ? String(defaultReimbursementAmount) : "");

  useEffect(() => {
    setCustomReimbursementAmount(defaultReimbursementAmount > 0 ? String(defaultReimbursementAmount) : "");
  }, [defaultReimbursementAmount]);

  const employeeName =
    request.debtor?.fullName ||
    request.applicant?.fullName ||
    request.applicant?.username ||
    "Empleado que comprobó";

  const [leftoverInstallmentsCount, setLeftoverInstallmentsCount] =
    useState<number>(2);
  const [leftoverNotes, setLeftoverNotes] = useState<string>("");
  const [showLeftoverPreview, setShowLeftoverPreview] = useState(false);

  const leftoverSchedulePreview = useMemo(() => {
    if (leftoverToReturn <= 0) return [];
    return calculateFortnightSchedulePreview(
      leftoverToReturn,
      leftoverInstallmentsCount,
      new Date(),
    );
  }, [leftoverToReturn, leftoverInstallmentsCount]);

  const leftoverPerFortnight = useMemo(() => {
    if (leftoverToReturn <= 0 || leftoverInstallmentsCount <= 0) return 0;
    return leftoverToReturn / leftoverInstallmentsCount;
  }, [leftoverToReturn, leftoverInstallmentsCount]);

  const pendingVouchers = request.vouchers.filter(
    (v) => v.status === "PENDING",
  );
  const acceptedVouchers = request.vouchers.filter(
    (v) => v.status === "ACCEPTED",
  );
  const rejectedVouchers = request.vouchers.filter(
    (v) => v.status === "REJECTED",
  );

  // En IN_COMPROBATION (o APPROVED): el solicitante concluye su comprobación para pasar a IN_VERIFICATION
  const canConcludeComprobation = isInComprobation && canConclude;

  // En IN_VERIFICATION: el responsable completa la revisión una vez evaluados todos los comprobantes
  const canCompleteVerification =
    isInVerification &&
    canReviewAndComplete &&
    pendingVouchers.length === 0 &&
    canConclude;

  const handleAction = async () => {
    setSubmitting(true);
    try {
      if (isInVerification) {
        const parsed = Number(customReimbursementAmount);
        const amountToReimburse =
          hasReimbursementToSchedule && Number.isFinite(parsed) && parsed > 0
            ? parsed
            : defaultReimbursementAmount;

        await onConclude({
          scheduledDate: reimbursementDate || getTomorrowIso(),
          scheduleReimbursement: amountToReimburse > 0,
          reimbursementAmount: amountToReimburse,
          leftoverInstallmentsCount:
            leftoverToReturn > 0 ? leftoverInstallmentsCount : undefined,
          leftoverNotes: leftoverToReturn > 0 ? leftoverNotes : undefined,
        });
      } else {
        await onConclude();
      }
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Typography variant="subtitle1" fontWeight={600}>
        Liquidación y Conclusión de Comprobación
      </Typography>

      {isCompleted ? (
        <Alert severity="success" icon={<CheckCircle2 size={20} />}>
          <Typography variant="subtitle2" fontWeight={600}>
            Esta solicitud ha sido verificada y concluida satisfactoriamente.
          </Typography>
          <Typography variant="caption" display="block">
            {request.concludedAt &&
              `Fecha de conclusión: ${formatDate(request.concludedAt, "DD/MM/YYYY HH:mm")}`}
            {request.concludedBy &&
              ` por ${request.concludedBy.fullName || request.concludedBy.username}`}
          </Typography>
        </Alert>
      ) : isInVerification ? (
        <Alert severity="warning" icon={<Wallet size={20} />}>
          <Typography variant="body2">
            <strong>En verificación por responsable:</strong> La comprobación de
            gastos fue concluida por el solicitante. Ahora un{" "}
            <strong>responsable</strong> debe revisar (aceptar o rechazar) los
            comprobantes y completar la solicitud. Si sobra dinero del monto
            dispersado, se programará un{" "}
            <strong>Reembolso de Viáticos</strong> para su devolución.
          </Typography>
        </Alert>
      ) : (
        <Alert severity="info" icon={<Wallet size={20} />}>
          {isCajaChica ? (
            <Typography variant="body2">
              <strong>Caja Chica (Revolvente):</strong> Al concluir, los
              comprobantes aceptados ({numeral(verified).format("$0,0.00")})
              repondrán el dinero gastado para devolverlo a la caja chica.
            </Typography>
          ) : (
            <Typography variant="body2">
              <strong>
                Etapa de Comprobación de{" "}
                {request.classification === "VIATICOS" ? "Viáticos" : "Gastos"}:
              </strong>{" "}
              Una vez que termines de subir todos tus comprobantes en la pestaña{" "}
              <strong>Comprobantes</strong>, da clic en{" "}
              <strong>Concluir Comprobación de Gastos</strong> para cambiar el
              estatus a <strong>En verificación</strong> y que un responsable
              revise lo comprobado.
            </Typography>
          )}
        </Alert>
      )}

      {isInVerification && !canReviewAndComplete && (
        <Alert severity="info">
          La solicitud se encuentra en estatus <strong>En verificación</strong>.
          Un responsable asignado (distinto al deudor diverso solicitante) debe
          revisar los comprobantes y completar la solicitud.
        </Alert>
      )}

      {isInVerification && pendingVouchers.length > 0 && (
        <Alert severity="warning">
          Existen <strong>{pendingVouchers.length}</strong> comprobantes
          pendientes de aceptar o rechazar en la pestaña de{" "}
          <strong>Comprobantes</strong>. El responsable debe evaluarlos en su
          totalidad antes de completar la solicitud.
        </Alert>
      )}

      {/* Financial Breakdown Cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box
            p={2}
            borderRadius={2}
            bgcolor="background.paper"
            border="1px solid"
            borderColor="divider"
          >
            <Typography variant="caption" color="text.secondary">
              Monto Solicitado / Dispersado
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {numeral(requested).format("$0,0.00")}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Box
            p={2}
            borderRadius={2}
            bgcolor="background.paper"
            border="1px solid"
            borderColor="divider"
          >
            <Typography variant="caption" color="text.secondary">
              Monto Comprobado Aceptado ({acceptedVouchers.length})
            </Typography>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              {numeral(verified).format("$0,0.00")}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Box
            p={2}
            borderRadius={2}
            bgcolor="background.paper"
            border="1px solid"
            borderColor="divider"
          >
            <Typography variant="caption" color="text.secondary">
              {isCajaChica
                ? "Monto a Reintegrar a Caja Chica"
                : isExactMatch
                  ? "Saldo Cuadrado"
                  : difference > 0
                    ? "Sobrante a Devolver a la Empresa"
                    : "Excedente a Favor del Empleado (Reembolso)"}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              {isExactMatch ? (
                <CheckCircle2 size={20} color="#16a34a" />
              ) : difference > 0 ? (
                <ArrowDownRight size={20} color="#ca8a04" />
              ) : (
                <ArrowUpRight size={20} color="#2563eb" />
              )}
              <Typography
                variant="h5"
                fontWeight={700}
                color={
                  isExactMatch || isCajaChica
                    ? "success.main"
                    : difference > 0
                      ? "warning.main"
                      : "primary.main"
                }
              >
                {numeral(
                  isCajaChica
                    ? verified
                    : isExactMatch
                      ? 0
                      : Math.abs(difference),
                ).format("$0,0.00")}
              </Typography>
            </Stack>
          </Box>
        </Grid>
      </Grid>

      {/* Voucher Breakdown Counts */}
      <Box
        p={2}
        borderRadius={2}
        bgcolor="background.paper"
        border="1px solid"
        borderColor="divider"
      >
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Resumen de Comprobantes
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Aceptados:
            </Typography>
            <Typography variant="body1" fontWeight={600} color="success.main">
              {acceptedVouchers.length} (
              {numeral(
                acceptedVouchers.reduce((s, v) => s + v.amount, 0),
              ).format("$0,0.00")}
              )
            </Typography>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Rechazados:
            </Typography>
            <Typography variant="body1" fontWeight={600} color="error.main">
              {rejectedVouchers.length} (
              {numeral(
                rejectedVouchers.reduce((s, v) => s + v.amount, 0),
              ).format("$0,0.00")}
              )
            </Typography>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Pendientes de revisión:
            </Typography>
            <Typography
              variant="body1"
              fontWeight={600}
              color={
                pendingVouchers.length > 0 ? "warning.main" : "text.secondary"
              }
            >
              {pendingVouchers.length} (
              {numeral(
                pendingVouchers.reduce((s, v) => s + v.amount, 0),
              ).format("$0,0.00")}
              )
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Mensaje de Comprobación Cuadrada al 100% */}
      {isInVerification &&
        canReviewAndComplete &&
        pendingVouchers.length === 0 &&
        isExactMatch && (
          <Alert severity="success" icon={<CheckCircle2 size={20} />}>
            <Typography variant="subtitle2" fontWeight={700}>
              Comprobación Cuadrada al 100%
            </Typography>
            <Typography variant="body2">
              El monto comprobado (<strong>{numeral(verified).format("$0,0.00")}</strong>)
              coincide exactamente con el monto dispersado (
              <strong>{numeral(requested).format("$0,0.00")}</strong>). No hay saldos
              pendientes ni sobrantes a devolver. Al completar la revisión, la solicitud
              se marcará como concluida sin movimientos de reembolso.
            </Typography>
          </Alert>
        )}

      {/* Programación de Descuento de Nómina a Deudor Diverso por Sobrante a Devolver */}
      {isInVerification &&
        canReviewAndComplete &&
        pendingVouchers.length === 0 &&
        leftoverToReturn > 0 && (
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
              backgroundColor: alpha(muiTheme.palette.warning.main, 0.04),
              borderColor: alpha(muiTheme.palette.warning.main, 0.4),
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Coins size={22} color={muiTheme.palette.warning.main} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Descuento en Nómina al Colaborador por Sobrante a Devolver
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Al empleado le sobraron{" "}
                    <strong>{numeral(leftoverToReturn).format("$0,0.00")}</strong> respecto al
                    monto dispersado ({numeral(requested).format("$0,0.00")}). Este importe se
                    descontará de nómina mediante un registro automático en{" "}
                    <strong>Gastos Deudores Diversos</strong>.
                  </Typography>
                </Box>
              </Stack>

              {/* Slider de Quincenas */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CalendarRange size={18} color={muiTheme.palette.primary.main} />
                  <Typography variant="body2" fontWeight={700}>
                    ¿A cuántas quincenas se descontará de nómina? (1 a 24)
                  </Typography>
                </Stack>
                <Chip
                  color="warning"
                  label={`${leftoverInstallmentsCount} quincena${
                    leftoverInstallmentsCount > 1 ? "s" : ""
                  }`}
                  sx={{ fontWeight: 700 }}
                />
              </Stack>

              <Box sx={{ px: 2 }}>
                <Slider
                  value={leftoverInstallmentsCount}
                  onChange={(_, val) => setLeftoverInstallmentsCount(val as number)}
                  min={1}
                  max={24}
                  step={1}
                  marks={[
                    { value: 1, label: "1" },
                    { value: 2, label: "2" },
                    { value: 4, label: "4" },
                    { value: 8, label: "8" },
                    { value: 12, label: "12 (6m)" },
                    { value: 24, label: "24" },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                sx={{
                  pt: 1,
                  borderTop: `1px dashed ${alpha(muiTheme.palette.divider, 0.6)}`,
                }}
                spacing={1}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Descuento programado por quincena (días 15 y fin de mes):
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="warning.main">
                    {numeral(leftoverPerFortnight).format("$0,0.00")}{" "}
                    <Typography component="span" variant="caption" color="text.secondary">
                      / quincena a descontar a <strong>{employeeName}</strong>
                    </Typography>
                  </Typography>
                </Box>

                {leftoverSchedulePreview.length > 0 && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setShowLeftoverPreview(!showLeftoverPreview)}
                    endIcon={
                      showLeftoverPreview ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                    }
                  >
                    {showLeftoverPreview ? "Ocultar calendario" : "Ver fechas de corte"}
                  </Button>
                )}
              </Stack>

              {/* Desglose colapsable de las quincenas a descontar */}
              {showLeftoverPreview && leftoverSchedulePreview.length > 0 && (
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ maxHeight: 200, mt: 1 }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell># Cuota</TableCell>
                        <TableCell>Fecha de Corte en Nómina</TableCell>
                        <TableCell align="right">Monto a Descontar</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leftoverSchedulePreview.map((item) => (
                        <TableRow key={item.installmentNumber}>
                          <TableCell>
                            Quincena {item.installmentNumber} de {item.totalInstallments}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Calendar size={14} opacity={0.6} />
                              <Typography variant="body2" fontWeight={600}>
                                {item.formattedDate}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            {numeral(item.amount).format("$0,0.00")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Observación adicional opcional */}
              <FormTextField
                label="Observaciones o notas del descuento de nómina (opcional)"
                value={leftoverNotes}
                onChange={(e) => setLeftoverNotes(e.target.value)}
                placeholder="Ej. Descuento autorizado por colaborador a partir de la próxima quincena..."
                multiline
                rows={1}
              />
            </Stack>
          </Paper>
        )}

      {/* Programación de Reembolso al Empleado cuando existe excedente a su favor o reposición */}
      {isInVerification &&
        canReviewAndComplete &&
        pendingVouchers.length === 0 &&
        hasReimbursementToSchedule && (
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
              borderColor: "primary.main",
              bgcolor: alpha(muiTheme.palette.primary.main, 0.03),
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CalendarClock size={20} color={muiTheme.palette.primary.main} />
                <Typography variant="subtitle1" fontWeight={700}>
                  Programación de Reembolso al Empleado
                </Typography>
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {employeeExcess > 0
                  ? `El empleado comprobó un excedente de ${numeral(employeeExcess).format("$0,0.00")} por encima del monto dispersado. Al completar la revisión se programará la orden de pago de reembolso (folio REM-${request.folio}):`
                  : `Al completar la revisión, se programará automáticamente una orden de pago por reembolso (folio REM-${request.folio}) a favor del empleado que comprobó los gastos (${employeeName}):`}
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormTextField
                    label="Monto a programar para reembolso ($ MXN)"
                    value={customReimbursementAmount}
                    onChange={(e) => setCustomReimbursementAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormDatePicker
                    label="Fecha programada de pago"
                    value={reimbursementDate}
                    onChange={(val) => setReimbursementDate(val)}
                    placeholder="DD/MM/YYYY"
                  />
                </Grid>
              </Grid>

              {request.debtor?.clabe && (
                <Typography variant="caption" color="text.secondary">
                  Cuenta destino para dispersión: <strong>{employeeName}</strong> • {request.debtor.bankName || "SPEI"} (•••• {request.debtor.clabe.slice(-4)})
                </Typography>
              )}
            </Stack>
          </Paper>
        )}

      {/* Existing Reimbursement Schedule Info when COMPLETED */}
      {request.reimbursementSchedule && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            borderColor: "success.main",
            bgcolor: "background.paper",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.5}
          >
            <Stack spacing={0.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CalendarClock size={18} />
                <Typography variant="subtitle2" fontWeight={700}>
                  Reembolso al Empleado Programado:{" "}
                  {request.reimbursementSchedule.folio}
                </Typography>
                <Chip
                  size="small"
                  label={
                    request.reimbursementSchedule.status === "PAGADO"
                      ? "Dispersado / Pagado"
                      : "Pendiente de pago"
                  }
                  color={
                    request.reimbursementSchedule.status === "PAGADO"
                      ? "success"
                      : "warning"
                  }
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Fecha programada de dispersión:{" "}
                <strong>
                  {formatDate(
                    request.reimbursementSchedule.scheduledDate,
                    "DD/MM/YYYY",
                  )}
                </strong>
                {request.reimbursementSchedule.paymentReference
                  ? ` • Ref: ${request.reimbursementSchedule.paymentReference}`
                  : ""}
              </Typography>
            </Stack>
            <Typography variant="h5" fontWeight={800} color="success.main">
              {numeral(request.reimbursementSchedule.amount).format("$0,0.00")}
            </Typography>
          </Stack>
        </Paper>
      )}

      {/* Action Buttons */}
      {!isCompleted && (
        <Stack direction="row" justifyContent="flex-end" sx={{ pt: 1 }}>
          {isInComprobation && (
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Send size={18} />}
              disabled={!canConcludeComprobation || submitting}
              onClick={() => setConfirmOpen(true)}
            >
              {submitting ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Concluir Comprobación de Gastos"
              )}
            </Button>
          )}

          {isInVerification && canReviewAndComplete && (
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<CheckCircle2 size={18} />}
              disabled={!canCompleteVerification || submitting}
              onClick={() => setConfirmOpen(true)}
            >
              {submitting ? (
                <CircularProgress size={22} color="inherit" />
              ) : hasReimbursementToSchedule ? (
                "Completar y Programar Reembolso"
              ) : leftoverToReturn > 0 ? (
                "Completar y Descontar de Nómina"
              ) : (
                "Completar y Concluir Comprobación"
              )}
            </Button>
          )}
        </Stack>
      )}

      {/* Confirmation Modal */}
      <Dialog
        open={confirmOpen}
        onClose={() => !submitting && setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {isInVerification
            ? hasReimbursementToSchedule
              ? "¿Completar revisión y programar reembolso?"
              : leftoverToReturn > 0
                ? "¿Completar y programar descuento de nómina?"
                : "¿Completar y concluir comprobación?"
            : "¿Concluir comprobación de gastos?"}
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText component="div">
            {isInVerification ? (
              <Stack spacing={1.5}>
                <Typography variant="body2">
                  Se completará la revisión con un monto comprobado aceptado de{" "}
                  <strong>{numeral(verified).format("$0,0.00")}</strong> y la
                  solicitud pasará a estatus <strong>Concluida</strong>.
                </Typography>
                {hasReimbursementToSchedule ? (
                  <Alert severity="success" icon={<Send size={18} />}>
                    Se creará la programación de <strong>Reembolso al empleado</strong> (folio{" "}
                    <code>REM-{request.folio}</code>) por{" "}
                    <strong>
                      {numeral(
                        Number(customReimbursementAmount) || defaultReimbursementAmount,
                      ).format("$0,0.00")}
                    </strong>{" "}
                    a nombre de <strong>{employeeName}</strong> para dispersarse el{" "}
                    <strong>{formatDate(reimbursementDate, "DD/MM/YYYY")}</strong>.
                  </Alert>
                ) : isExactMatch ? (
                  <Alert severity="info" icon={<CheckCircle2 size={18} />}>
                    La comprobación queda <strong>completada y cuadrada al 100%</strong>. No existen saldos pendientes ni movimientos de reembolso.
                  </Alert>
                ) : leftoverToReturn > 0 ? (
                  <Alert severity="warning" icon={<ArrowDownRight size={18} />}>
                    <Typography variant="body2" fontWeight={700}>
                      Se creará un cobro en Gastos Deudores Diversos
                    </Typography>
                    <Typography variant="body2">
                      El sobrante de <strong>{numeral(leftoverToReturn).format("$0,0.00")}</strong> se descontará vía nómina a <strong>{employeeName}</strong> en{" "}
                      <strong>{leftoverInstallmentsCount} quincena{leftoverInstallmentsCount > 1 ? "s" : ""}</strong> (
                      {numeral(leftoverPerFortnight).format("$0,0.00")} por quincena en días 15 y fin de mes).
                    </Typography>
                  </Alert>
                ) : null}
              </Stack>
            ) : (
              <Typography variant="body2">
                Al concluir la comprobación de gastos, la solicitud cambiará a
                estatus <strong>En verificación</strong> para que un responsable
                revise y valide los comprobantes subidos.
              </Typography>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color={isInVerification ? "success" : "primary"}
            onClick={handleAction}
            disabled={submitting}
          >
            {submitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : isInVerification ? (
              "Sí, completar solicitud"
            ) : (
              "Sí, enviar a verificación"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
