import { useEffect, useState } from "react";
import { Alert, Button, Stack, Typography } from "@mui/material";
import {
  PickupReceiverFields,
  draftFromPickupReceiver,
  getPickupReceiverError,
  toPickupReceiverPayload,
} from "@/components/SaleBuilder/PickupReceiverFields";
import type { PickupReceiverDraft } from "@/components/SaleBuilder/PickupReceiverFields";
import { updateHandoverReceiver } from "@/services/sale-handover.service";
import type { HandoverSaleDetail } from "@/types/saleHandover.types";
import { handoverErrorMessage } from "./handoverErrors";
import { SectionCard } from "./styles";

export interface ReceiverSectionProps {
  detail: HandoverSaleDetail;
  branchId: number;
  /** Se avisa si el borrador difiere de lo guardado (bloquea confirmar). */
  onDirtyChange: (dirty: boolean) => void;
  /** Se invoca tras guardar: el padre refresca el detalle y descarta autorizaciones. */
  onSaved: () => void;
  disabled?: boolean;
}

/**
 * «Recibe»: siempre visible antes de la evidencia. Titular muestra el nombre del
 * cliente; tercero, el designado. Cambiar de receptor llama a `PUT …/receiver`.
 */
export function ReceiverSection({
  detail,
  branchId,
  onDirtyChange,
  onSaved,
  disabled = false,
}: ReceiverSectionProps) {
  const saved = detail.receiver;
  const savedDraft = draftFromPickupReceiver(saved);
  const [draft, setDraft] = useState<PickupReceiverDraft>(savedDraft);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // El celular guardado llega enmascarado: un tercero sin celular nuevo equivale
  // a «sin cambios» solo si tipo y nombre coinciden.
  const dirty =
    draft.type !== savedDraft.type ||
    (draft.type === "THIRD_PARTY" &&
      (draft.name.trim() !== savedDraft.name.trim() || draft.phone.trim() !== ""));

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  const handleSave = async () => {
    if (getPickupReceiverError(draft)) {
      setShowErrors(true);
      return;
    }
    setSaving(true);
    setError(null);
    const response = await updateHandoverReceiver(detail.saleId, {
      branchId,
      ...toPickupReceiverPayload(draft),
    });
    setSaving(false);
    if (response.error || !response.data) {
      setError(
        response.error
          ? handoverErrorMessage(response.error)
          : "No se pudo guardar quién recibe.",
      );
      return;
    }
    setShowErrors(false);
    setDraft(draftFromPickupReceiver(response.data));
    onSaved();
  };

  const handleCancel = () => {
    setDraft(savedDraft);
    setShowErrors(false);
    setError(null);
  };

  return (
    <SectionCard>
      <Stack spacing={1.5}>
        <Typography variant="subtitle1" fontWeight={700}>
          Recibe
        </Typography>
        {draft.type === "HOLDER" && !dirty ? (
          <Typography variant="body2" color="text.secondary">
            Recibe el titular: <strong>{detail.client.name}</strong>.
          </Typography>
        ) : null}
        <PickupReceiverFields
          value={draft}
          onChange={setDraft}
          savedPhoneMasked={saved.thirdPartyPhoneMasked}
          disabled={disabled || saving}
          showErrors={showErrors}
        />
        {dirty ? (
          <>
            <Alert severity="warning">
              Al cambiar quién recibe se revoca la validación de identidad ya
              hecha y se necesitará un código nuevo para el nuevo receptor.
            </Alert>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                onClick={() => void handleSave()}
                disabled={disabled || saving}
              >
                {saving ? "Guardando..." : "Guardar quién recibe"}
              </Button>
              <Button variant="text" onClick={handleCancel} disabled={saving}>
                Descartar cambio
              </Button>
            </Stack>
          </>
        ) : null}
      </Stack>
    </SectionCard>
  );
}
