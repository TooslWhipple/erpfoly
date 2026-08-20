import { useCallback, useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  Stack,
  Typography,
} from "@mui/material";
import { CircleCheck, X as CloseIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import numeral from "numeral";
import {
  DialogContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  CloseButton,
} from "@/components/ModalForm/styles";
import { FormTextField } from "@/components/Form";
import {
  cancelClientPurchase,
  getSaleCancelReasons,
} from "@/services/clients.service";
import type { SaleCancelBlockReason, SaleCancelReason } from "@/types/cancelPurchase.types";
import { getApiErrorMessage, unwrapOrThrow } from "@/lib/axios";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  FooterActions,
  ReasonCard,
  ReasonCheckIcon,
} from "@/components/DiscountRequestModal/styles";

const BLOCK_MESSAGES: Record<Exclude<SaleCancelBlockReason, "ALREADY_CANCELLED">, string> = {
  IN_ROUTE:
    "No es posible realizar la cancelación del artículo ya que se encuentra en reparto",
  DELIVERED: "No es posible cancelar el artículo porque ya fue entregado",
};

export interface CancelPurchaseModalProps {
  open: boolean;
  clientId: number;
  saleId: number;
  totalPaid: number;
  blockReason: SaleCancelBlockReason | null;
  onClose: () => void;
  onSuccess?: () => void;
}

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export function CancelPurchaseModal({
  open,
  clientId,
  saleId,
  totalPaid,
  blockReason,
  onClose,
  onSuccess,
}: CancelPurchaseModalProps) {
  const queryClient = useQueryClient();
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const showError = useSnackbarStore((state) => state.showError);

  const [selectedReasonId, setSelectedReasonId] = useState<number | null>(null);
  const [customReason, setCustomReason] = useState("");

  const isBlocked =
    blockReason === "IN_ROUTE" || blockReason === "DELIVERED";

  const reasonsQuery = useQuery({
    queryKey: ["clients", "sale-cancel-reasons"],
    enabled: open && !isBlocked,
    queryFn: async () => {
      const result = await getSaleCancelReasons();
      return unwrapOrThrow(result);
    },
    staleTime: 6 * 60 * 60 * 1000,
    gcTime: 12 * 60 * 60 * 1000,
  });

  const reasons = reasonsQuery.data ?? [];
  const selectedReason = reasons.find((reason) => reason.id === selectedReasonId);

  const resetForm = useCallback(() => {
    setSelectedReasonId(null);
    setCustomReason("");
  }, []);

  const isOtherSelected = selectedReason?.allowsCustomText ?? false;
  const trimmedCustomReason = customReason.trim();
  const canSubmit =
    !isBlocked &&
    selectedReasonId !== null &&
    (!isOtherSelected || trimmedCustomReason.length > 0) &&
    !reasonsQuery.isLoading;

  const mutation = useMutation({
    mutationFn: async () => {
      if (selectedReasonId === null) {
        throw new Error("Selecciona un motivo de cancelación.");
      }
      const result = await cancelClientPurchase(clientId, saleId, {
        reasonId: selectedReasonId,
        notes: isOtherSelected ? trimmedCustomReason : undefined,
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: async (data) => {
      showSuccess(data?.message ?? "La venta se canceló correctamente.");
      resetForm();
      onClose();
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["clients", "purchase-detail", clientId, saleId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["clients", "detail", clientId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["clients", "purchases", clientId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["sale-credits", "active", clientId],
        }),
      ]);
      onSuccess?.();
    },
    onError: (error: Error) => showError(getApiErrorMessage(error)),
  });

  const handleClose = () => {
    if (mutation.isPending) return;
    resetForm();
    onClose();
  };

  const renderReasonCard = (reason: SaleCancelReason) => {
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
            {reason.name}
          </Typography>
          {reason.allowsCustomText ? (
            <FormTextField
              placeholder="Ingresa otro motivo"
              value={customReason}
              onChange={(event) => setCustomReason(event.target.value)}
              onFocus={() => setSelectedReasonId(reason.id)}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              fullWidth
              size="small"
            />
          ) : (
            reason.description && (
              <Typography variant="body2" color="text.secondary">
                {reason.description}
              </Typography>
            )
          )}
        </Stack>

        {selected && (
          <ReasonCheckIcon aria-hidden>
            <CircleCheck size={22} strokeWidth={2} />
          </ReasonCheckIcon>
        )}
      </ReasonCard>
    );
  };

  const submitLabel =
    totalPaid > 0 ? "Cancelar venta y abonar pagos" : "Cancelar venta";

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
      <DialogContent sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        <ModalHeader>
          <div>
            <ModalTitle>Cancelar venta</ModalTitle>
            {!isBlocked && (
              <ModalDescription>
                Selecciona el motivo de cancelación de la venta
              </ModalDescription>
            )}
          </div>
          <CloseButton
            onClick={handleClose}
            disabled={mutation.isPending}
            size="small"
          >
            <CloseIcon size={16} />
          </CloseButton>
        </ModalHeader>

        {isBlocked ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {BLOCK_MESSAGES[blockReason]}
            </Typography>
            <FooterActions>
              <Button variant="contained" color="primary" onClick={handleClose}>
                Entendido
              </Button>
            </FooterActions>
          </>
        ) : (
          <>
            <Typography variant="subtitle2" color="text.secondary">
              Selecciona el motivo de cancelación
            </Typography>

            <Stack
              spacing={1.5}
              sx={{ flex: 1, overflow: "auto", minHeight: 0, pb: 1, mt: 1.5 }}
            >
              {reasonsQuery.isLoading ? (
                <Typography variant="body2" color="text.secondary">
                  Cargando motivos...
                </Typography>
              ) : reasonsQuery.isError ? (
                <Typography variant="body2" color="error">
                  {getApiErrorMessage(reasonsQuery.error)}
                </Typography>
              ) : (
                reasons.map(renderReasonCard)
              )}
            </Stack>

            {totalPaid > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                El monto pagado del artículo [{formatCurrency(totalPaid)}] se
                abonará como saldo a favor del cliente
              </Typography>
            )}

            <FooterActions>
              <Button
                variant="contained"
                color="error"
                disabled={!canSubmit || mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                {mutation.isPending ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  submitLabel
                )}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                disabled={mutation.isPending}
                onClick={handleClose}
              >
                Cancelar
              </Button>
            </FooterActions>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

const CancelPurchaseModalPage = () => null;

export default CancelPurchaseModalPage;
