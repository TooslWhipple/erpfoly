import type { ReactNode } from "react";
import { Dialog, Button, CircularProgress } from "@mui/material";
import type { ButtonProps } from "@mui/material/Button";
import { Close as CloseIcon } from "@mui/icons-material";
import {
  DialogContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  CloseButton,
  ItemNameHighlight,
} from "./styles";
import { FormActions, ConfirmButton } from "@/components/Form/styles";

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: ReactNode;
  /** When set and `description` is omitted, shows default delete copy with highlighted name. */
  itemName?: string;
  loading?: boolean;
  cancelLabel?: string;
  confirmLabel?: string;
  confirmColor?: ButtonProps["color"];
}

export function ConfirmModal({
  open,
  onClose,
  title = "Confirmar eliminación",
  description,
  itemName,
  onConfirm,
  loading = false,
  cancelLabel = "Cancelar",
  confirmLabel = "Eliminar",
  confirmColor = "error",
}: ConfirmModalProps) {
  const handleClose = (_event: object, reason: string) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      if (!loading) onClose();
    }
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  const resolvedDescription =
    description ??
    (itemName != null && itemName !== "" ? (
      <>
        ¿Estás seguro de eliminar <ItemNameHighlight>{itemName}</ItemNameHighlight>? Esta acción
        no se puede deshacer.
      </>
    ) : (
      "¿Deseas continuar?"
    ));

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogContent>
        <ModalHeader>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <ModalTitle>{title}</ModalTitle>
            <ModalDescription>{resolvedDescription}</ModalDescription>
          </div>
          <CloseButton onClick={onClose} disabled={loading} size="small">
            <CloseIcon />
          </CloseButton>
        </ModalHeader>

        <FormActions>
          <Button
            type="button"
            variant="outlined"
            color="primary"
            onClick={onClose}
            disabled={loading}
            sx={{ minWidth: 100 }}
          >
            {cancelLabel}
          </Button>
          <ConfirmButton
            type="button"
            variant="contained"
            color={confirmColor}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : confirmLabel}
          </ConfirmButton>
        </FormActions>
      </DialogContent>
    </Dialog>
  );
}
