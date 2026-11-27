import { useCallback, useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  Stack,
  Typography,
} from "@mui/material";
import { CircleCheck, X as CloseIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  DialogContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  CloseButton,
} from "@/components/ModalForm/styles";
import { deactivateClient } from "@/services/clients.service";
import type { ClientDeactivationStatus } from "@/types/clientes.types";
import { getApiErrorMessage } from "@/lib/axios";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  FooterActions,
  ReasonCard,
  ReasonCheckIcon,
} from "@/components/DiscountRequestModal/styles";

const DEACTIVATION_OPTIONS: {
  status: ClientDeactivationStatus;
  title: string;
  description: string;
}[] = [
  {
    status: "cesado",
    title: "Cesado",
    description: "Adeudo incobrable.",
  },
  {
    status: "cancelado",
    title: "Cancelado",
    description: "Solicitud directa del cliente.",
  },
];

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

  const [selectedStatus, setSelectedStatus] =
    useState<ClientDeactivationStatus | null>(null);

  const resetForm = useCallback(() => {
    setSelectedStatus(null);
  }, []);

  const canSubmit = selectedStatus !== null;

  const mutation = useMutation({
    mutationFn: async () => {
      if (selectedStatus === null) {
        throw new Error("Selecciona un motivo de baja.");
      }
      const result = await deactivateClient(clientId, {
        deactivationStatus: selectedStatus,
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

  const renderReasonCard = (option: (typeof DEACTIVATION_OPTIONS)[number]) => {
    const selected = selectedStatus === option.status;

    return (
      <ReasonCard
        key={option.status}
        selected={selected}
        role="button"
        tabIndex={0}
        onClick={() => setSelectedStatus(option.status)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setSelectedStatus(option.status);
          }
        }}
      >
        <Stack spacing={0.5} flex={1} minWidth={0}>
          <Typography variant="subtitle1" fontWeight={600}>
            {option.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {option.description}
          </Typography>
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
          {DEACTIVATION_OPTIONS.map(renderReasonCard)}
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