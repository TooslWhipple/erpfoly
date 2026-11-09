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
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  CheckCircle2,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  Send,
} from "lucide-react";
import numeral from "numeral";
import { FormDatePicker } from "@/components/Form";
import type {
  CompleteExpenseVerificationPayload,
  ExpenseRequestDetail,
} from "@/types/expense-requests.types";
import { formatDate } from "@/utils/date";

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reimbursementDate, setReimbursementDate] = useState<string>(
    getTomorrowIso(),
  );

  const isCompleted = request.status === "COMPLETED";
  const isInComprobation =
    request.status === "IN_COMPROBATION" || request.status === "APPROVED";
  const isInVerification = request.status === "IN_VERIFICATION";

  const requested = request.requestedAmount;
  const verified = request.verifiedAmount;
  const difference = Number((requested - verified).toFixed(2));
  const hasLeftoverMoney = difference > 0;
  const isCajaChica = request.classification === "CAJA_CHICA";

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

  // En IN_VERIFICATION: el responsable (que no sea el mismo deudor) completa la revisión una vez evaluados todos los comprobantes
  const canCompleteVerification =
    isInVerification &&
    canReviewAndComplete &&
    pendingVouchers.length === 0 &&
    canConclude;

  const handleAction = async () => {
    setSubmitting(true);
    try {
      if (isInVerification) {
        await onConclude({
          scheduledDate: reimbursementDate || getTomorrowIso(),
          scheduleReimbursement: hasLeftoverMoney,
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
                : difference >= 0
                  ? "Sobrante a Devolver (Reembolso de Viáticos)"
                  : "Diferencia a Favor del Empleado"}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              {difference >= 0 ? (
                <ArrowDownRight size={20} color="#16a34a" />
              ) : (
                <ArrowUpRight size={20} color="#dc2626" />
              )}
              <Typography
                variant="h5"
                fontWeight={700}
                color={
                  isCajaChica || difference >= 0 ? "success.main" : "error.main"
                }
              >
                {numeral(isCajaChica ? verified : Math.abs(difference)).format(
                  "$0,0.00",
                )}
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

      {/* Reimbursement / Devolución Schedule Card when in IN_VERIFICATION and there is leftover money */}
      {isInVerification &&
        canReviewAndComplete &&
        pendingVouchers.length === 0 &&
        hasLeftoverMoney && (
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
              borderColor: "info.main",
              bgcolor: "background.paper",
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CalendarClock size={20} />
                <Typography variant="subtitle1" fontWeight={700}>
                  Programar Reembolso de Viáticos (Devolución de Sobrante)
                </Typography>
              </Stack>

              <Typography variant="body2" color="text.secondary">
                Al empleado le sobraron{" "}
                <strong>{numeral(difference).format("$0,0.00")}</strong> respecto
                al monto dispersado ({numeral(requested).format("$0,0.00")}). Al
                completar la revisión se programará automáticamente un{" "}
                <strong>Reembolso de Viáticos</strong> (folio{" "}
                <code>REM-{request.folio}</code>) para su devolución en la fecha
                indicada:
              </Typography>

              <Box sx={{ maxWidth: 280 }}>
                <FormDatePicker
                  label="Fecha programada de devolución"
                  value={reimbursementDate}
                  onChange={(val) => setReimbursementDate(val)}
                  placeholder="DD/MM/YYYY"
                />
              </Box>
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
                  Reembolso / Devolución de Viáticos Programado:{" "}
                  {request.reimbursementSchedule.folio}
                </Typography>
                <Chip
                  size="small"
                  label={
                    request.reimbursementSchedule.status === "PAGADO"
                      ? "Devuelto / Pagado"
                      : "Pendiente de devolución"
                  }
                  color={
                    request.reimbursementSchedule.status === "PAGADO"
                      ? "success"
                      : "warning"
                  }
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Fecha programada de devolución:{" "}
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
              ) : hasLeftoverMoney ? (
                "Completar y Programar Reembolso de Viáticos"
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
            ? "¿Completar revisión de comprobación?"
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
                {hasLeftoverMoney && (
                  <Alert severity="info">
                    Sobran{" "}
                    <strong>{numeral(difference).format("$0,0.00")}</strong> de
                    los viáticos dispersados. Se programará el{" "}
                    <strong>Reembolso de Viáticos</strong> (
                    <code>REM-{request.folio}</code>) para devolución el día{" "}
                    <strong>
                      {formatDate(reimbursementDate, "DD/MM/YYYY")}
                    </strong>
                    .
                  </Alert>
                )}
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
