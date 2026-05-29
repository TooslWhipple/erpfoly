import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Checkbox, CircularProgress, Stack, Typography } from "@mui/material";
import { Package } from "lucide-react";
import { SideModal } from "@/components/SideModal";
import { FormTextField } from "@/components/Form";
import { markClientPurchaseAsDelivered } from "@/data/deliverPurchase.mockData";
import { getDeliveryConfirmationWord } from "@/lib/clientPurchaseDelivery";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  FooterActions,
  ProductCard,
  ProductThumbnail,
  ValidationBanner,
} from "@/styles/clientes/deliverPurchaseModal.styles";

export interface DeliverPurchaseModalProps {
  open: boolean;
  purchaseId: string;
  productName: string;
  productSku: string;
  productImageUrl?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeliverPurchaseModal({
  open,
  purchaseId,
  productName,
  productSku,
  productImageUrl,
  onClose,
  onSuccess,
}: DeliverPurchaseModalProps) {
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const showError = useSnackbarStore((state) => state.showError);

  const confirmationWord = useMemo(
    () => getDeliveryConfirmationWord(productName),
    [productName],
  );

  const [confirmationInput, setConfirmationInput] = useState("");
  const [identityValidated, setIdentityValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setConfirmationInput("");
    setIdentityValidated(false);
    setSubmitting(false);
  }, []);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const isConfirmationValid =
    confirmationWord.length > 0 &&
    confirmationInput.trim() === confirmationWord;

  const canSubmit = isConfirmationValid && identityValidated && !submitting;

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await markClientPurchaseAsDelivered(purchaseId);
      showSuccess("El artículo se marcó como entregado correctamente.");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("[DeliverPurchaseModal] Error marking purchase as delivered:", error);
      showError("No se pudo marcar como entregado. Intenta de nuevo.");
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
      title="Marcar pedido como entregado?"
      description="¿Estás seguro que deseas marcar este artículo como entregado al cliente?"
      contentSx={{ display: "flex", flexDirection: "column", minHeight: 0 }}
    >
      <Stack spacing={2.5} sx={{ flex: 1, overflow: "auto", minHeight: 0, pb: 1 }}>
        <ProductCard>
          <ProductThumbnail>
            {productImageUrl ? (
              <img src={productImageUrl} alt={productName} />
            ) : (
              <Package size={24} strokeWidth={1.75} />
            )}
          </ProductThumbnail>
          <Stack spacing={0.5} minWidth={0}>
            <Typography variant="subtitle1" fontWeight={600}>{productName}</Typography>
            <Typography variant="body2" color="text.secondary">{productSku}</Typography>
          </Stack>
        </ProductCard>

        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Ingresa la palabra{" "}
            <Typography component="span" variant="body2" color="primary" fontWeight={600}>
              {confirmationWord}
            </Typography>{" "}
            para confirmar la entrega
          </Typography>
          <FormTextField
            placeholder={confirmationWord}
            value={confirmationInput}
            onChange={(event) => setConfirmationInput(event.target.value)}
            fullWidth
            size="small"
            error={confirmationInput.length > 0 && !isConfirmationValid}
          />
        </Stack>

        <ValidationBanner>
          <Checkbox
            checked={identityValidated}
            onChange={(event) => setIdentityValidated(event.target.checked)}
            color="primary"
            sx={{ p: 0, mt: 0.25 }}
          />
          <Typography variant="body2" color="primary.main" fontWeight={600}>
            Acepto haber validado la identificación del cliente a quién se le entrega el artículo.
          </Typography>
        </ValidationBanner>
      </Stack>

      <FooterActions>
        <Button
          variant="contained"
          color="primary"
          disabled={!canSubmit}
          onClick={() => void handleSubmit()}
        >
          {submitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Marcar como entregado"
          )}
        </Button>
        <Button variant="outlined" color="primary" disabled={submitting} onClick={handleClose}>
          Cancelar
        </Button>
      </FooterActions>
    </SideModal>
  );
}

const DeliverPurchaseModalPage = () => null;

export default DeliverPurchaseModalPage;
