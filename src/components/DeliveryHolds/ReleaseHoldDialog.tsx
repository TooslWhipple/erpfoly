import { useState } from "react";
import { Alert, Stack, TextField } from "@mui/material";
import { ConfirmModal } from "@/components/ConfirmModal/ConfirmModal";
import { handoverErrorMessage } from "@/components/HandoverCounter/handoverErrors";
import { releaseHold } from "@/services/sale-handover.service";
import type {
  HoldRow,
  ReleaseHoldResponse,
} from "@/types/saleHandover.types";
import { formatUnits } from "./holds";

const MIN_REASON_LENGTH = 5;
const MAX_REASON_LENGTH = 512;

export interface ReleaseHoldDialogProps {
  hold: HoldRow | null;
  onClose: () => void;
  /** `result` es null cuando el servidor indica que el estado cambió. */
  onDone: (result: ReleaseHoldResponse | null) => void;
}

export function ReleaseHoldDialog({ hold, onClose, onDone }: ReleaseHoldDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const trimmedReason = reason.trim();
  const valid = trimmedReason.length >= MIN_REASON_LENGTH;

  const handleConfirm = async () => {
    if (!hold || !valid) return;
    setSubmitting(true);
    setError(null);
    const result = await releaseHold(hold.saleId, { reason: trimmedReason });
    setSubmitting(false);
    if (result.error || !result.data) {
      const apiError = result.error;
      if (apiError) {
        setError(handoverErrorMessage(apiError));
        if (
          apiError.errorCode === "HOLD_NOT_FOUND" ||
          apiError.errorCode === "HOLD_SCOPE_FORBIDDEN"
        ) {
          onDone(null);
        }
      }
      return;
    }
    onDone(result.data);
  };

  return (
    <ConfirmModal
      open={hold !== null}
      onClose={onClose}
      onExited={() => {
        setReason("");
        setError(null);
      }}
      onConfirm={handleConfirm}
      loading={submitting}
      confirmDisabled={!valid}
      type="warning"
      title="Regularizar resguardo"
      description={
        hold
          ? `Se liberarán ${formatUnits(hold.pendingUnits)} sin entregar de la venta ${hold.folio}: vuelven al inventario disponible. Lo pagado y no entregado se abona al cliente como saldo a favor. Si la venta no tenía nada entregado, se cancela. Esta acción no se puede deshacer.`
          : undefined
      }
      confirmLabel="Regularizar"
    >
      <Stack spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Motivo"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          inputProps={{ maxLength: MAX_REASON_LENGTH }}
          helperText={`Mínimo ${MIN_REASON_LENGTH} caracteres. Queda en el historial.`}
          multiline
          minRows={2}
          fullWidth
        />
        {error ? <Alert severity="error">{error}</Alert> : null}
      </Stack>
    </ConfirmModal>
  );
}
