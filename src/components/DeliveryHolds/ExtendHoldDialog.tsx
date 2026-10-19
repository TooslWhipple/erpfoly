import { useState } from "react";
import { Alert, Stack, TextField } from "@mui/material";
import { ConfirmModal } from "@/components/ConfirmModal/ConfirmModal";
import type { ApiError } from "@/lib/axios";
import dayjs from "@/lib/dayjs";
import { handoverErrorMessage } from "@/components/HandoverCounter/handoverErrors";
import { extendHold } from "@/services/sale-handover.service";
import type { HoldRow } from "@/types/saleHandover.types";

const MIN_REASON_LENGTH = 5;
const MAX_REASON_LENGTH = 512;

export interface ExtendHoldDialogProps {
  hold: HoldRow | null;
  onClose: () => void;
  /** Se invoca tras prorrogar, o cuando el servidor indica que el estado cambió. */
  onDone: (extended: boolean) => void;
}

export function ExtendHoldDialog({ hold, onClose, onDone }: ExtendHoldDialogProps) {
  const [newDate, setNewDate] = useState("");
  const [reason, setReason] = useState("");
  const [maxDate, setMaxDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
  const trimmedReason = reason.trim();
  const valid =
    newDate >= tomorrow &&
    (maxDate === null || newDate <= maxDate) &&
    trimmedReason.length >= MIN_REASON_LENGTH;

  const reset = () => {
    setNewDate("");
    setReason("");
    setMaxDate(null);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!hold || !valid) return;
    setSubmitting(true);
    setError(null);
    const result = await extendHold(hold.saleId, {
      newExpiresAt: newDate,
      reason: trimmedReason,
    });
    setSubmitting(false);
    if (result.error) {
      handleError(result.error);
      return;
    }
    onDone(true);
  };

  const handleError = (apiError: ApiError) => {
    setError(handoverErrorMessage(apiError));
    if (apiError.errorCode === "EXTENSION_OUT_OF_RANGE") {
      const max = apiError.data?.maxDate;
      if (typeof max === "string") setMaxDate(max.slice(0, 10));
      return;
    }
    if (
      apiError.errorCode === "HOLD_NOT_EXTENDABLE" ||
      apiError.errorCode === "HOLD_NOT_FOUND" ||
      apiError.errorCode === "HOLD_SCOPE_FORBIDDEN"
    ) {
      onDone(false);
    }
  };

  return (
    <ConfirmModal
      open={hold !== null}
      onClose={onClose}
      onExited={reset}
      onConfirm={handleConfirm}
      loading={submitting}
      confirmDisabled={!valid}
      type="primary"
      title="Prorrogar resguardo"
      description={
        hold
          ? `Elige la nueva fecha de vencimiento del resguardo de la venta ${hold.folio}. El resguardo vuelve a quedar vigente.`
          : undefined
      }
      confirmLabel="Prorrogar"
    >
      <Stack spacing={2} sx={{ mb: 2 }}>
        <TextField
          type="date"
          size="small"
          label="Nueva fecha de vencimiento"
          value={newDate}
          onChange={(event) => setNewDate(event.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: tomorrow, max: maxDate ?? undefined }}
          helperText={maxDate ? `Fecha máxima permitida: ${maxDate}` : undefined}
          fullWidth
        />
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
