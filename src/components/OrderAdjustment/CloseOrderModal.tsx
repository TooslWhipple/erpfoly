import { useState } from "react";
import { Alert, Stack, Typography } from "@mui/material";
import { ConfirmModal } from "@/components/ConfirmModal";
import { FormTextField } from "@/components/Form/FormTextField";
import type { OrderAdjustmentContext } from "@/types/orders.types";
import { estimateUncoveredSales } from "@/utils/orderStatus";

const MIN_REASON_LENGTH = 5;
const MAX_REASON_LENGTH = 500;

export interface CloseOrderModalProps {
  context: OrderAdjustmentContext;
  loading: boolean;
  /** `allowed_actions.closeRemainder`: falso mientras existan folios abiertos. */
  closeAllowed: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<unknown>;
}

/** Cierra el remanente: lo pendiente deja de esperarse. Con folios abiertos no se puede confirmar. */
export function CloseOrderModal({ context, loading, closeAllowed, onClose, onSubmit }: CloseOrderModalProps) {
  const [reason, setReason] = useState("");
  const trimmedReason = reason.trim();
  const hasOpenReceptions = context.openReceptions.length > 0;
  const blocked = hasOpenReceptions || !closeAllowed;
  const pendingLines = context.lines.filter((line) => line.pendingQuantity > 0);
  const uncovered = pendingLines.reduce(
    (sum, line) => sum + estimateUncoveredSales(line, 0),
    0,
  );

  return (
    <ConfirmModal
      open
      onClose={onClose}
      onConfirm={async () => {
        await onSubmit(trimmedReason);
      }}
      loading={loading}
      type="warning"
      title="Cerrar remanente"
      description={`Pedido ${context.folio}. Lo que el proveedor no surtió deja de esperarse y el pedido queda Cerrado.`}
      confirmLabel="Cerrar remanente"
      confirmDisabled={blocked || trimmedReason.length < MIN_REASON_LENGTH}
    >
      <Stack spacing={1.5}>
        {hasOpenReceptions && (
          <Alert severity="error">
            Hay recepciones abiertas: {context.openReceptions.map((r) => r.folio).join(", ")}.
            Termínalas o cancélalas antes de cerrar el pedido.
          </Alert>
        )}
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">Pendiente por línea</Typography>
          {pendingLines.map((line) => (
            <Stack key={line.orderItemId} direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="body2" noWrap title={line.productName}>
                {line.productName}
              </Typography>
              <Typography variant="body2">{line.pendingQuantity}</Typography>
            </Stack>
          ))}
        </Stack>
        <FormTextField
          label="Motivo"
          required
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          multiline
          minRows={2}
          inputProps={{ maxLength: MAX_REASON_LENGTH }}
          helperText={`Mínimo ${MIN_REASON_LENGTH} caracteres.`}
        />
        {uncovered > 0 && (
          <Alert severity="warning">
            Estimado: {uncovered} {uncovered === 1 ? "pieza vendida" : "piezas vendidas"} sobre
            pedido quedarían sin cubrir por este pedido.
          </Alert>
        )}
      </Stack>
    </ConfirmModal>
  );
}
