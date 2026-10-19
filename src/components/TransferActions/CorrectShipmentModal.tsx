import { useState } from "react";
import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { SideModal } from "@/components/SideModal";
import { FormTextField } from "@/components/Form/FormTextField";
import { FormActions, ConfirmButton } from "@/components/Form/styles";
import NumberSpinner from "@/components/NumberSpinner";
import type {
  CorrectShipmentPayload,
  TransferDetail,
  TransferIncidentView,
} from "@/types/transfers.types";
import { getExpectedQuantity } from "@/utils/transfers";

export interface CorrectShipmentModalProps {
  detail: TransferDetail;
  incident: TransferIncidentView;
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: CorrectShipmentPayload) => Promise<unknown>;
}

/** El origen corrige lo que declaró enviado en los artículos de la incidencia (RN-053). */
export function CorrectShipmentModal({
  detail,
  incident,
  loading,
  onClose,
  onSubmit,
}: CorrectShipmentModalProps) {
  const affected = detail.order_items.filter((item) =>
    incident.items.some((entry) => entry.order_item_id === item.id),
  );
  const [quantities, setQuantities] = useState<Record<number, number>>(() =>
    Object.fromEntries(affected.map((item) => [item.id, getExpectedQuantity(item)])),
  );
  const [notes, setNotes] = useState("");

  const handleSubmit = () =>
    onSubmit({
      items: affected.map((item) => ({
        order_item_id: item.id,
        shipped_quantity: quantities[item.id],
      })),
      notes: notes.trim(),
    });

  return (
    <SideModal
      open
      onClose={onClose}
      title="Corregir envío"
      description="Ajusta las piezas que realmente salieron. La incidencia queda resuelta como corregida por el origen."
      maxWidth="sm"
      disableClose={loading}
    >
      <Stack spacing={2}>
        {affected.map((item) => (
          <Stack key={item.id} direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack minWidth={0}>
              <Typography variant="subtitle2">{item.product?.short_name ?? "Sin nombre"}</Typography>
              <Typography variant="caption" color="text.secondary">
                Enviado: {getExpectedQuantity(item)} · Pedido: {item.requested_quantity}
              </Typography>
            </Stack>
            <NumberSpinner
              value={quantities[item.id]}
              min={0}
              max={item.requested_quantity}
              onChange={(value) => setQuantities((prev) => ({ ...prev, [item.id]: value }))}
              inputAriaLabel={`Piezas enviadas de ${item.product?.short_name ?? "artículo"}`}
            />
          </Stack>
        ))}
        <FormTextField
          label="Notas"
          required
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          multiline
          minRows={2}
        />
        <FormActions>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <ConfirmButton
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || notes.trim().length === 0}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Corregir envío"}
          </ConfirmButton>
        </FormActions>
      </Stack>
    </SideModal>
  );
}
