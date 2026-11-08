import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { CheckCircle2, Wallet, ArrowDownRight, ArrowUpRight } from "lucide-react";
import numeral from "numeral";
import type {
  ExpenseRequestDetail,
} from "@/types/expense-requests.types";
import { formatDate } from "@/utils/date";

export interface ExpenseRequestConclusionTabProps {
  request: ExpenseRequestDetail;
  onConclude: () => Promise<void>;
  canConclude?: boolean;
}

export function ExpenseRequestConclusionTab({
  request,
  onConclude,
  canConclude = true,
}: ExpenseRequestConclusionTabProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isCompleted = request.status === "COMPLETED";
  const requested = request.requestedAmount;
  const verified = request.verifiedAmount;
  const difference = requested - verified;
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

  const canExecuteConclude =
    !isCompleted &&
    (request.status === "APPROVED" || request.status === "IN_VERIFICATION") &&
    pendingVouchers.length === 0 &&
    canConclude;

  const handleConclude = async () => {
    setSubmitting(true);
    try {
      await onConclude();
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
            Esta solicitud ha sido concluida satisfactoriamente.
          </Typography>
          <Typography variant="caption" display="block">
            {request.concludedAt &&
              `Fecha de conclusión: ${formatDate(request.concludedAt, "dateTime")}`}
            {request.concludedBy &&
              ` por ${request.concludedBy.fullName || request.concludedBy.username}`}
          </Typography>
        </Alert>
      ) : (
        <Alert severity="info" icon={<Wallet size={20} />}>
          {isCajaChica ? (
            <Typography variant="body2">
              <strong>Caja Chica (Revolvente):</strong> Al concluir, los comprobantes
              aceptados ({numeral(verified).format("$0,0.00")}) repondrán el dinero
              gastado para devolverlo a la caja chica y mantener su fondo fijo.
            </Typography>
          ) : (
            <Typography variant="body2">
              <strong>Comprobación de {request.classification === "VIATICOS" ? "Viáticos" : "Gastos"}:</strong>{" "}
              Se compara el presupuesto solicitado contra los comprobantes fiscales
              aceptados para determinar saldo a favor o a devolver.
            </Typography>
          )}
        </Alert>
      )}

      {pendingVouchers.length > 0 && (
        <Alert severity="warning">
          Existen <strong>{pendingVouchers.length}</strong> comprobantes pendientes
          de aceptar o rechazar en la pestaña de Comprobantes. Para poder concluir,
          deben ser evaluados en su totalidad.
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
              Monto Solicitado
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
                ? "Remanente a Devolver por Empleado"
                : "Reembolso a Favor del Empleado"}
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
                color={isCajaChica || difference >= 0 ? "success.main" : "error.main"}
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
              Pendientes:
            </Typography>
            <Typography
              variant="body1"
              fontWeight={600}
              color={pendingVouchers.length > 0 ? "warning.main" : "text.secondary"}
            >
              {pendingVouchers.length}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Conclude Action */}
      {!isCompleted && (
        <Stack direction="row" justifyContent="flex-end" sx={{ pt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            disabled={!canExecuteConclude || submitting}
            onClick={() => setConfirmOpen(true)}
          >
            {submitting ? (
              <CircularProgress size={24} />
            ) : (
              "Concluir Comprobación de Gastos"
            )}
          </Button>
        </Stack>
      )}

      {/* Confirmation Modal */}
      <Dialog
        open={confirmOpen}
        onClose={() => !submitting && setConfirmOpen(false)}
        maxWidth="xs"
      >
        <DialogTitle>¿Confirmar conclusión del gasto?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isCajaChica ? (
              <>
                Se registrará la reposición de{" "}
                <strong>{numeral(verified).format("$0,0.00")}</strong> al fondo
                de Caja Chica y la solicitud quedará con estatus concluido.
              </>
            ) : (
              <>
                Se dará por concluida la comprobación por un total aceptado de{" "}
                <strong>{numeral(verified).format("$0,0.00")}</strong>. Esta
                acción finalizará el ciclo de comprobación de la solicitud.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleConclude}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : "Sí, concluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
