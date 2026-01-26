import { Dialog, IconButton, Box, Button, CircularProgress } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useRef } from "react";
import { Form } from "../Form";
import type { FormProps, FormFieldConfig } from "../Form";
import {
  StyledDialogContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  CloseButton,
} from "./styles";
import {
  FormActions,
  CancelButton,
  ConfirmButton,
} from "../Form/styles";

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
  /** Additional content to render after the form */
  children?: React.ReactNode;
  /** Callback fired when form values change */
  onValuesChange?: (values: Record<string, unknown>) => void;
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
  children,
  onValuesChange,
}: ModalFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

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

  // Handle form submit trigger
  const handleSubmitClick = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
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

        {/* Form without its own header and actions */}
        <Box
          component="div"
          ref={(node: HTMLDivElement | null) => {
            if (node) {
              const form = node.querySelector('form') as HTMLFormElement | null;
              if (form) {
                formRef.current = form;
              }
            }
          }}
        >
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
            showActions={false}
            onValuesChange={onValuesChange}
          />
        </Box>

        {/* Additional content (e.g., info messages) */}
        {children}

        {/* Actions at the bottom, after children */}
        {showActions && (
          <FormActions>
            {onCancel && (
              <CancelButton
                type="button"
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
              >
                {cancelLabel}
              </CancelButton>
            )}
            <ConfirmButton
              type="button"
              variant="contained"
              onClick={handleSubmitClick}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                confirmLabel
              )}
            </ConfirmButton>
          </FormActions>
        )}
      </StyledDialogContent>
    </Dialog>
  );
}
