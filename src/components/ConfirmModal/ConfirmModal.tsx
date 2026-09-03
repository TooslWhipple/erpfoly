import { useEffect, useState, type ReactNode } from "react";
import { Dialog, Button, CircularProgress } from "@mui/material";
import type { ButtonProps } from "@mui/material/Button";
import { Close as CloseIcon } from "@mui/icons-material";
import { AlertTriangle, CheckCircle2, Info, Trash2 } from "lucide-react";
import {
  DialogContent,
  ModalHeader,
  ModalHeaderContent,
  ModalTextBlock,
  ModalTitle,
  ModalDescription,
  CloseButton,
  ItemNameHighlight,
  IconBadge,
  type ConfirmModalType,
} from "./styles";
import { FormActions, ConfirmButton } from "@/components/Form/styles";

export { ItemNameHighlight };
export type { ConfirmModalType };

const ICON_SIZE = 22;

interface ConfirmModalContentSnapshot {
  title: string;
  description?: ReactNode;
  itemName?: string;
  cancelLabel: string;
  confirmLabel: string;
  confirmColor?: ButtonProps["color"];
  type?: ConfirmModalType;
  icon?: ReactNode;
  hideIcon: boolean;
}

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  /** Cancel button. Defaults to `onClose` (X and backdrop still use `onClose`). */
  onCancel?: () => void;
  /** Called after the close transition finishes. */
  onExited?: () => void;
  title?: string;
  description?: ReactNode;
  /** When set and `description` is omitted, shows default delete copy with highlighted name. */
  itemName?: string;
  loading?: boolean;
  cancelLabel?: string;
  confirmLabel?: string;
  /** Overrides the confirm button color derived from `type`. */
  confirmColor?: ButtonProps["color"];
  /** Visual variant. Defaults to `primary`, or `error` when `itemName` is set. */
  type?: ConfirmModalType;
  /** Custom icon for the badge. Uses a preset icon per `type` when omitted. */
  icon?: ReactNode;
  /** Hide the leading icon badge. */
  hideIcon?: boolean;
}

function resolveType(
  type: ConfirmModalType | undefined,
  itemName?: string,
): ConfirmModalType {
  if (type) return type;
  if (itemName) return "error";
  return "primary";
}

function resolveConfirmColor(
  modalType: ConfirmModalType,
  confirmColor?: ButtonProps["color"],
): ButtonProps["color"] {
  return confirmColor ?? modalType;
}

function DefaultTypeIcon({ modalType }: { modalType: ConfirmModalType }) {
  switch (modalType) {
    case "warning":
      return <AlertTriangle size={ICON_SIZE} aria-hidden />;
    case "error":
      return <Trash2 size={ICON_SIZE} aria-hidden />;
    case "success":
      return <CheckCircle2 size={ICON_SIZE} aria-hidden />;
    case "primary":
    default:
      return <Info size={ICON_SIZE} aria-hidden />;
  }
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  onCancel,
  onExited,
  title = "Confirmar eliminación",
  description,
  itemName,
  loading = false,
  cancelLabel = "Cancelar",
  confirmLabel = "Eliminar",
  confirmColor,
  type,
  icon,
  hideIcon = false,
}: ConfirmModalProps) {
  const [contentSnapshot, setContentSnapshot] = useState<ConfirmModalContentSnapshot | null>(
    null,
  );

  useEffect(() => {
    if (!open) return;

    setContentSnapshot({
      title,
      description,
      itemName,
      cancelLabel,
      confirmLabel,
      confirmColor,
      type,
      icon,
      hideIcon,
    });
  }, [
    open,
    title,
    description,
    itemName,
    cancelLabel,
    confirmLabel,
    confirmColor,
    type,
    icon,
    hideIcon,
  ]);

  const content: ConfirmModalContentSnapshot =
    contentSnapshot ??
    ({
      title,
      description,
      itemName,
      cancelLabel,
      confirmLabel,
      confirmColor,
      type,
      icon,
      hideIcon,
    } satisfies ConfirmModalContentSnapshot);

  const resolvedType = resolveType(content.type, content.itemName);
  const resolvedConfirmColor = resolveConfirmColor(resolvedType, content.confirmColor);

  const handleClose = (_event: object, reason: string) => {
    if (loading) return;
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      onClose();
    }
  };

  const handleDismiss = () => {
    if (!loading) onClose();
  };

  const handleCancel = () => {
    if (loading) return;
    (onCancel ?? onClose)();
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  const resolvedDescription =
    content.description ??
    (content.itemName != null && content.itemName !== "" ? (
      <>
        ¿Estás seguro de eliminar <ItemNameHighlight>{content.itemName}</ItemNameHighlight>? Esta
        acción no se puede deshacer.
      </>
    ) : (
      "¿Deseas continuar?"
    ));

  const resolvedIcon = content.icon ?? <DefaultTypeIcon modalType={resolvedType} />;

  const handleTransitionExited = () => {
    setContentSnapshot(null);
    onExited?.();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      TransitionProps={{ onExited: handleTransitionExited }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogContent>
        <ModalHeader>
          <ModalHeaderContent>
            {!content.hideIcon && (
              <IconBadge modalType={resolvedType}>{resolvedIcon}</IconBadge>
            )}
            <ModalTextBlock>
              <ModalTitle>{content.title}</ModalTitle>
              <ModalDescription>{resolvedDescription}</ModalDescription>
            </ModalTextBlock>
          </ModalHeaderContent>
          <CloseButton onClick={handleDismiss} disabled={loading} size="small" aria-label="Cerrar">
            <CloseIcon fontSize="small" />
          </CloseButton>
        </ModalHeader>

        <FormActions>
          <Button
            type="button"
            variant="outlined"
            color="primary"
            onClick={handleCancel}
            disabled={loading}
            sx={{ minWidth: 100 }}
          >
            {content.cancelLabel}
          </Button>
          <ConfirmButton
            type="button"
            variant="contained"
            color={resolvedConfirmColor}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : content.confirmLabel}
          </ConfirmButton>
        </FormActions>
      </DialogContent>
    </Dialog>
  );
}
