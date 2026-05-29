import { Dialog, Button, CircularProgress } from "@mui/material";
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

export interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: React.ReactNode;
  itemName: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  confirmLabel?: string;
}

export function ConfirmDeleteModal({
  open,
  onClose,
  title = "Confirmar eliminación",
  description,
  itemName,
  onConfirm,
  loading = false,
  confirmLabel = "Eliminar",
}: ConfirmDeleteModalProps) {
  const handleClose = (_event: object, reason: string) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      if (!loading) onClose();
    }
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  const defaultDescription = (
    <>
      ¿Estás seguro de eliminar <ItemNameHighlight>{itemName}</ItemNameHighlight>?
      Esta acción no se puede deshacer.
    </>
  );

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
            <ModalDescription>
              {description ?? defaultDescription}
            </ModalDescription>
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
            Cancelar
          </Button>
          <ConfirmButton
            type="button"
            variant="contained"
            color="error"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              confirmLabel
            )}
          </ConfirmButton>
        </FormActions>
      </DialogContent>
    </Dialog>
  );
}
