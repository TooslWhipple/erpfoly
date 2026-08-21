import { useCallback, useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  Stack,
  Typography,
} from "@mui/material";
import { CircleCheck, X as CloseIcon } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  DialogContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  CloseButton,
} from "@/components/ModalForm/styles";
import { FormTextField } from "@/components/Form";
import {
  deactivateClient,
  getClientDeactivationReasons,
} from "@/services/clients.service";
import type { ClientDeactivationReason } from "@/types/clientes.types";
import { getApiErrorMessage, unwrapOrThrow } from "@/lib/axios";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  FooterActions,
  ReasonCard,
  ReasonCheckIcon,
} from "@/components/DiscountRequestModal/styles";

export interface DeactivateClientModalProps {
  open: boolean;
  clientId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeactivateClientModal({
  open,
  clientId,
  onClose,
  onSuccess,
}: DeactivateClientModalProps) {
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const showError = useSnackbarStore((state) => state.showError);

  const [selectedReasonId, setSelectedReasonId] = useState<number | null>(null);
  const [customReason, setCustomReason] = useState("");

  const reasonsQuery = useQuery({
    queryKey: ["clients", "deactivation-reasons"],
    enabled: open,
    queryFn: async () => {
      const result = await getClientDeactivationReasons();
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
    selectedReasonId !== null &&
    (!isOtherSelected || trimmedCustomReason.length > 0) &&
    !reasonsQuery.isLoading;

  const mutation = useMutation({
    mutationFn: async () => {
      if (selectedReasonId === null) {
        throw new Error("Selecciona un motivo de baja.");
      }
      const result = await deactivateClient(clientId, {
        reasonId: selectedReasonId,
        notes: isOtherSelected ? trimmedCustomReason : undefined,
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: (data) => {
      showSuccess(data?.message ?? "El cliente se dio de baja correctamente.");
      resetForm();
      onClose();
      onSuccess?.();
    },
    onError: (error: Error) => showError(getApiErrorMessage(error)),
  });

  const handleClose = () => {
    if (mutation.isPending) return;
    resetForm();
    onClose();
  };

  const renderReasonCard = (reason: ClientDeactivationReason) => {
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
            <ModalTitle>Dar de baja al cliente</ModalTitle>
            <ModalDescription>
              Al dar de baja al cliente se cancelará su línea de crédito y letras
              abiertas.
            </ModalDescription>
          </div>
          <CloseButton
            onClick={handleClose}
            disabled={mutation.isPending}
            size="small"
          >
            <CloseIcon size={16} />
          </CloseButton>
        </ModalHeader>

        <Typography variant="subtitle2" color="text.secondary">
          Selecciona el motivo de baja
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
              "Dar de baja"
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
      </DialogContent>
    </Dialog>
  );
}

const DeactivateClientModalPage = () => null;

export default DeactivateClientModalPage;
