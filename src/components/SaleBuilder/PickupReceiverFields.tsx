import { Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { isValidPhone, sanitizePhone } from "@/forms/validation/schemas/creditApplication";
import type { PickupReceiver, PickupReceiverPayload } from "@/types/saleHandover.types";

export type PickupReceiverDraft = {
  type: "HOLDER" | "THIRD_PARTY";
  name: string;
  phone: string;
};

export const HOLDER_RECEIVER_DRAFT: PickupReceiverDraft = {
  type: "HOLDER",
  name: "",
  phone: "",
};

/** Mensaje de error del borrador, o null si se puede guardar. */
export function getPickupReceiverError(draft: PickupReceiverDraft): string | null {
  if (draft.type === "HOLDER") return null;
  const name = draft.name.trim();
  if (name.length < 2 || name.length > 128) {
    return "Captura el nombre de quien recoge (2 a 128 caracteres).";
  }
  if (!isValidPhone(draft.phone)) {
    return "Captura un celular de 10 dígitos para quien recoge.";
  }
  return null;
}

export function toPickupReceiverPayload(
  draft: PickupReceiverDraft,
): PickupReceiverPayload {
  if (draft.type === "HOLDER") return { type: "HOLDER" };
  return {
    type: "THIRD_PARTY",
    name: draft.name.trim(),
    phone: draft.phone.trim(),
  };
}

/** Clave estable para detectar cambios contra lo ya guardado. */
export function pickupReceiverKey(draft: PickupReceiverDraft): string {
  if (draft.type === "HOLDER") return "HOLDER";
  return `THIRD_PARTY|${draft.name.trim()}|${draft.phone.trim()}`;
}

/**
 * El back solo devuelve el celular enmascarado: al hidratar, el nombre se
 * conserva y el celular queda vacío para que se vuelva a capturar si se edita.
 */
export function draftFromPickupReceiver(
  receiver: PickupReceiver | null | undefined,
): PickupReceiverDraft {
  if (!receiver || receiver.type === "HOLDER") return HOLDER_RECEIVER_DRAFT;
  return { type: "THIRD_PARTY", name: receiver.thirdPartyName, phone: "" };
}

export interface PickupReceiverFieldsProps {
  value: PickupReceiverDraft;
  onChange: (next: PickupReceiverDraft) => void;
  /** Celular enmascarado ya guardado (se muestra como ayuda si el campo está vacío). */
  savedPhoneMasked?: string | null;
  disabled?: boolean;
  showErrors?: boolean;
}

export function PickupReceiverFields({
  value,
  onChange,
  savedPhoneMasked,
  disabled,
  showErrors,
}: PickupReceiverFieldsProps) {
  const isThird = value.type === "THIRD_PARTY";
  const nameInvalid =
    isThird && (value.name.trim().length < 2 || value.name.trim().length > 128);
  const phoneInvalid = isThird && !isValidPhone(value.phone);

  return (
    <Stack spacing={1} sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary">
        ¿Quién recoge?
      </Typography>
      <ToggleButtonGroup
        exclusive
        fullWidth
        size="small"
        color="primary"
        value={value.type}
        disabled={disabled}
        onChange={(_, next: "HOLDER" | "THIRD_PARTY" | null) => {
          if (next) onChange({ ...value, type: next });
        }}
      >
        <ToggleButton value="HOLDER">Titular</ToggleButton>
        <ToggleButton value="THIRD_PARTY">Tercero</ToggleButton>
      </ToggleButtonGroup>
      {isThird && (
        <>
          <TextField
            size="small"
            label="Nombre de quien recoge"
            value={value.name}
            disabled={disabled}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            error={Boolean(showErrors) && nameInvalid}
            slotProps={{ htmlInput: { maxLength: 128 } }}
          />
          <TextField
            size="small"
            label="Celular de quien recoge"
            value={value.phone}
            disabled={disabled}
            onChange={(e) =>
              onChange({ ...value, phone: sanitizePhone(e.target.value) })
            }
            error={Boolean(showErrors) && phoneInvalid}
            helperText={
              !value.phone && savedPhoneMasked
                ? `Guardado: ${savedPhoneMasked}`
                : "10 dígitos; recibirá el código de verificación al recoger."
            }
            slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 10 } }}
          />
        </>
      )}
    </Stack>
  );
}
