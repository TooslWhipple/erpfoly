import { Dialog, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { Form } from "../Form";
import type { FormProps, FormFieldConfig } from "../Form";
import {
  StyledDialogContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  CloseButton,
} from "./styles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ModalFormProps extends Omit<FormProps, "showHeader"> {
  /** Modal open state */
  open: boolean;
  /** Close modal callback */
  onClose: () => void;
  /** Maximum width of the modal */
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Disable close on backdrop click */
  disableBackdropClick?: boolean;
  /** Disable close on escape key */
  disableEscapeKeyDown?: boolean;
  /** Full width modal */
  fullWidth?: boolean;
}

// ============================================================================
// MODAL FORM COMPONENT
// ============================================================================

export function ModalForm({
  open,
  onClose,
  maxWidth = "sm",
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  fullWidth = true,
  title,
  description,
  fields,
  onCancel,
  onConfirm,
  confirmLabel,
  cancelLabel,
  loading = false,
  initialValues,
  spacing,
  showActions = true,
}: ModalFormProps) {
  // Handle modal close
  const handleClose = (_event: object, reason: "backdropClick" | "escapeKeyDown") => {
    if (reason === "backdropClick" && disableBackdropClick) {
      return;
    }
    if (reason === "escapeKeyDown" && disableEscapeKeyDown) {
      return;
    }
    if (!loading) {
      onClose();
    }
  };

  // Handle cancel - use onCancel if provided, otherwise use onClose
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  // Handle confirm with auto-close on success
  const handleConfirm = async (data: Record<string, unknown>) => {
    await onConfirm(data);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      <StyledDialogContent>
        {/* Header */}
        <ModalHeader>
          <div>
            {title && <ModalTitle>{title}</ModalTitle>}
            {description && <ModalDescription>{description}</ModalDescription>}
          </div>
          <CloseButton onClick={onClose} disabled={loading} size="small">
            <CloseIcon />
          </CloseButton>
        </ModalHeader>

        {/* Form without its own header */}
        <Form
          fields={fields}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
          confirmLabel={confirmLabel}
          cancelLabel={cancelLabel}
          loading={loading}
          initialValues={initialValues}
          spacing={spacing}
          showHeader={false}
          showActions={showActions}
        />
      </StyledDialogContent>
    </Dialog>
  );
}
