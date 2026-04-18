import { Dialog, Box, CircularProgress } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useRef } from "react";
import { Form } from "../Form";
import type { FormProps } from "../Form";
import {
  DialogContent,
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

export interface ModalFormProps extends Omit<FormProps, "showHeader"> {
  open: boolean;
  onClose: () => void;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
  headerContent?: React.ReactNode;
  onValuesChange?: (values: Record<string, unknown>) => void;
}

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
  headerContent,
  onValuesChange,
}: ModalFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

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

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const handleConfirm = async (data: Record<string, unknown>) => {
    await onConfirm(data);
  };

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
      <DialogContent>
        <ModalHeader>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
            <div>
              {title && <ModalTitle>{title}</ModalTitle>}
              {description && <ModalDescription>{description}</ModalDescription>}
            </div>
            {headerContent}
          </div>
          <CloseButton onClick={onClose} disabled={loading} size="small">
            <CloseIcon />
          </CloseButton>
        </ModalHeader>

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

        {children}

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
      </DialogContent>
    </Dialog>
  );
}
