import { useCallback, useEffect, useState } from "react";
import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { CircleCheck } from "lucide-react";
import { SideModal } from "@/components/SideModal";
import { FormTextField } from "@/components/Form";
import { CANCEL_PURCHASE_REASONS, cancelClientPurchase } from "@/data/cancelPurchase.mockData";
import type { CancelPurchaseReasonId } from "@/types/cancelPurchase.types";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  FooterActions,
  ReasonCard,
  ReasonCheckIcon,
} from "@/styles/clientes/cancelPurchaseModal.styles";

export interface CancelPurchaseModalProps {
  open: boolean;
  purchaseId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CancelPurchaseModal({
  open,
  purchaseId,
  onClose,
  onSuccess,
}: CancelPurchaseModalProps) {
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const showError = useSnackbarStore((state) => state.showError);

  const [selectedReasonId, setSelectedReasonId] = useState<CancelPurchaseReasonId | null>(null);
  const [customReason, setCustomReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setSelectedReasonId(null);
    setCustomReason("");
    setSubmitting(false);
  }, []);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const isOtherSelected = selectedReasonId === "OTHER";
  const trimmedCustomReason = customReason.trim();
  const canSubmit =
    selectedReasonId !== null &&
    (!isOtherSelected || trimmedCustomReason.length > 0) &&
    !submitting;

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit || selectedReasonId === null) return;

    setSubmitting(true);
    try {
      await cancelClientPurchase(purchaseId);
      showSuccess("La venta se canceló correctamente.");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("[CancelPurchaseModal] Error canceling purchase:", error);
      showError("No se pudo cancelar la venta. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SideModal
      open={open}
      onClose={handleClose}
      disableClose={submitting}
      maxWidth="md"
      title="Cancelar venta"
      description="Selecciona el motivo de cancelación de la venta"
      contentSx={{ display: "flex", flexDirection: "column", minHeight: 0 }}
    >
      <Stack spacing={1.5} sx={{ flex: 1, overflow: "auto", minHeight: 0, pb: 1 }}>
        {CANCEL_PURCHASE_REASONS.map((reason) => {
          const selected = selectedReasonId === reason.id;

          return (
            <ReasonCard
              key={reason.id}
              selected={selected}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedReasonId(reason.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedReasonId(reason.id);
                }
              }}
            >
              <Stack spacing={reason.allowsCustomText ? 1.5 : 0.5} flex={1} minWidth={0}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {reason.title}
                </Typography>
                {reason.allowsCustomText ? (
                  <FormTextField
                    placeholder="Ingresa otro motivo"
                    value={customReason}
                    onChange={(event) => setCustomReason(event.target.value)}
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                    fullWidth
                    size="small"
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {reason.description}
                  </Typography>
                )}
              </Stack>

              {selected && (
                <ReasonCheckIcon aria-hidden>
                  <CircleCheck size={22} strokeWidth={2} />
                </ReasonCheckIcon>
              )}
            </ReasonCard>
          );
        })}
      </Stack>

      <FooterActions>
        <Button
          variant="contained"
          color="error"
          disabled={!canSubmit}
          onClick={() => void handleSubmit()}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : "Cancelar venta"}
        </Button>
        <Button variant="outlined" color="primary" disabled={submitting} onClick={handleClose}>
          Cancelar
        </Button>
      </FooterActions>
    </SideModal>
  );
}

const CancelPurchaseModalPage = () => null;

export default CancelPurchaseModalPage;
