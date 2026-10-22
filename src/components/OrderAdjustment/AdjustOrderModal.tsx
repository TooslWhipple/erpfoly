import { useState } from "react";
import { Alert, Stack, Typography } from "@mui/material";
import { ConfirmModal } from "@/components/ConfirmModal";
import { FormTextField } from "@/components/Form/FormTextField";
import NumberSpinner from "@/components/NumberSpinner";
import type { AdjustOrderPayload, OrderAdjustmentContext } from "@/types/orders.types";
import { estimateUncoveredSales } from "@/utils/orderStatus";

const MIN_REASON_LENGTH = 5;
const MAX_REASON_LENGTH = 500;

export interface AdjustOrderModalProps {
  context: OrderAdjustmentContext;
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: AdjustOrderPayload) => Promise<unknown>;
}

/** Compras baja la cantidad pedida por línea, nunca por debajo de lo recibido más los folios abiertos. */
export function AdjustOrderModal({ context, loading, onClose, onSubmit }: AdjustOrderModalProps) {
  const [quantities, setQuantities] = useState<Record<number, number>>(() =>
    Object.fromEntries(context.lines.map((line) => [line.orderItemId, line.requestedQuantity])),
  );
  const [reason, setReason] = useState("");

  const changed = context.lines.filter(
    (line) => quantities[line.orderItemId] !== line.requestedQuantity,
  );
  const trimmedReason = reason.trim();
  const reasonInvalid = trimmedReason.length < MIN_REASON_LENGTH;
  const allZero = context.lines.every((line) => quantities[line.orderItemId] === 0);
  const allSettled = context.lines.every(
    (line) => quantities[line.orderItemId] <= line.deliveredQuantity,
  );
  const uncovered = changed.reduce(
    (sum, line) =>
      sum +
      estimateUncoveredSales(line, quantities[line.orderItemId] - line.deliveredQuantity),
    0,
  );

  const handleConfirm = async () => {
    await onSubmit({
      reason: trimmedReason,
      items: changed.map((line) => ({
        orderItemId: line.orderItemId,
        requestedQuantity: quantities[line.orderItemId],
      })),
    });
  };

  return (
    <ConfirmModal
      open
      onClose={onClose}
      onConfirm={handleConfirm}
      loading={loading}
      title="Ajustar pedido"
      description={`Pedido ${context.folio}. Baja la cantidad que surtirá el proveedor; no puede quedar por debajo de lo recibido ni de lo que está en folios abiertos.`}
      confirmLabel="Ajustar pedido"
      type={allZero ? "error" : "primary"}
      confirmDisabled={changed.length === 0 || reasonInvalid}
    >
      <Stack spacing={1.5}>
        {context.lines.map((line) => (
          <Stack
            key={line.orderItemId}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Stack minWidth={0}>
              <Typography variant="subtitle2" noWrap title={line.productName}>
                {line.productName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pedido {line.requestedQuantity} · Recibido {line.deliveredQuantity}
                {line.openReceptionQuantity > 0
                  ? ` · En folios abiertos ${line.openReceptionQuantity}`
                  : ""}
                {" · Mínimo "}
                {line.minAllowedQuantity}
              </Typography>
            </Stack>
            <NumberSpinner
              value={quantities[line.orderItemId]}
              min={line.minAllowedQuantity}
              max={line.requestedQuantity}
              onChange={(value) =>
                setQuantities((prev) => ({ ...prev, [line.orderItemId]: value }))
              }
              inputAriaLabel={`Cantidad pedida de ${line.productName}`}
            />
          </Stack>
        ))}
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
        {allZero && (
          <Alert severity="warning">Todo queda en 0: esto cancela el pedido.</Alert>
        )}
        {!allZero && allSettled && (
          <Alert severity="info">
            Lo pendiente queda en 0: el pedido pasa a Recibido.
          </Alert>
        )}
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
