import { useCallback, useState, type ReactNode } from "react";
import {
  ConfirmModal,
  type ConfirmModalProps,
  type ConfirmModalType,
} from "@/components/ConfirmModal";
import type { ButtonProps } from "@mui/material/Button";

export interface ConfirmationRequest {
  title: string;
  description?: ReactNode;
  itemName?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  confirmColor?: ButtonProps["color"];
  type?: ConfirmModalType;
  icon?: ReactNode;
  hideIcon?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function useConfirmationModal() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<ConfirmationRequest | null>(null);
  const [loading, setLoading] = useState(false);

  const requestConfirmation = useCallback((request: ConfirmationRequest) => {
    setPending(request);
    setOpen(true);
  }, []);

  const closeConfirmation = useCallback(() => {
    if (loading) return;
    setOpen(false);
  }, [loading]);

  const handleExited = useCallback(() => {
    setPending(null);
    setLoading(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!pending) return;

    setLoading(true);
    try {
      await pending.onConfirm();
      setOpen(false);
    } finally {
      if (open) {
        setLoading(false);
      }
    }
  }, [open, pending]);

  const confirmationModal = pending ? (
    <ConfirmModal
      open={open}
      onClose={closeConfirmation}
      onConfirm={handleConfirm}
      onExited={handleExited}
      loading={loading}
      title={pending.title}
      description={pending.description}
      itemName={pending.itemName}
      cancelLabel={pending.cancelLabel}
      confirmLabel={pending.confirmLabel}
      confirmColor={pending.confirmColor}
      type={pending.type}
      icon={pending.icon}
      hideIcon={pending.hideIcon}
    />
  ) : null;

  return {
    requestConfirmation,
    closeConfirmation,
    confirmationModal,
    confirmationOpen: open,
    confirmationLoading: loading,
  };
}

export type { ConfirmModalProps, ConfirmModalType };
