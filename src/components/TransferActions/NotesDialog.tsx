import { useState } from "react";
import { ConfirmModal, type ConfirmModalProps } from "@/components/ConfirmModal";
import { FormTextField } from "@/components/Form/FormTextField";

const MIN_REQUIRED_LENGTH = 3;
const MAX_LENGTH = 255;

export interface NotesDialogProps
  extends Pick<
    ConfirmModalProps,
    "open" | "onClose" | "title" | "description" | "confirmLabel" | "type" | "loading"
  > {
  fieldLabel: string;
  /** Si es `true`, el texto es obligatorio (mínimo 3 caracteres). */
  required?: boolean;
  onSubmit: (text: string) => Promise<unknown>;
}

/**
 * Confirmación con un campo de texto: motivo (cancelar, regresar, escalar) o
 * notas opcionales. Se monta solo mientras está abierta, así el texto no sobrevive.
 */
export function NotesDialog({
  fieldLabel,
  required = false,
  onSubmit,
  onClose,
  ...modalProps
}: NotesDialogProps) {
  const [text, setText] = useState("");
  const trimmed = text.trim();
  const invalid = required && trimmed.length < MIN_REQUIRED_LENGTH;

  const handleConfirm = async () => {
    await onSubmit(trimmed);
  };

  return (
    <ConfirmModal
      {...modalProps}
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmDisabled={invalid}
    >
      <FormTextField
        label={fieldLabel}
        required={required}
        value={text}
        onChange={(event) => setText(event.target.value)}
        multiline
        minRows={2}
        inputProps={{ maxLength: MAX_LENGTH }}
      />
    </ConfirmModal>
  );
}
