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
import { FormTextField } from "@/components/Form";
import { requestSaleDiscount } from "@/services/ventas.service";
import type {
  DiscountRequestReason,
  SaleDiscountRequest,
} from "@/types/ventas.types";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { ReasonCard, ReasonCheckIcon, FooterActions } from "./styles";

export interface DiscountRequestModalProps {
  open: boolean;
  onClose: () => void;
  saleId: number;
  existingRequest: SaleDiscountRequest | null;
  onSuccess?: () => void;
}

interface DiscountReasonOption {
  id: DiscountRequestReason;
  title: string;
  description?: string;
  allowsCustomText?: boolean;
}

const DISCOUNT_REQUEST_REASONS: DiscountReasonOption[] = [
  {
    id: "LAST_UNIT",
    title: "Última pieza",
    description:
      "Puedes solicitar un descuento si es la ultima pieza en existencia y no se volverá a surtir el producto",
  },
  {
    id: "DAMAGED_ITEM",
    title: "Pieza dañada o con desperfecto",
    description:
      "El producto tiene algún daño, rasón o avería y el cliente desea comprarlo en esta condición.",
  },
  {
    id: "CLOSING_SALE",
    title: "Cierre de venta",
    description:
      "Se pretende usar esta venta para alcanzar objetivos de venta del mes.",
  },
  {
    id: "OTHER",
    title: "Otro motivo",
    allowsCustomText: true,
  },
];

export function DiscountRequestModal({
  open,
  onClose,
  saleId,
  existingRequest,
  onSuccess,
}: DiscountRequestModalProps) {
  const showError = useSnackbarStore((state) => state.showError);

  const [selectedReason, setSelectedReason] =
    useState<DiscountRequestReason | null>(null);
  const [otherReasonText, setOtherReasonText] = useState("");

  const resetForm = useCallback(() => {
    setSelectedReason(null);
    setOtherReasonText("");
  }, []);

  const isOtherSelected = selectedReason === "OTHER";
  const trimmedOtherReason = otherReasonText.trim();
  const canSubmit =
    selectedReason !== null &&
    (!isOtherSelected || trimmedOtherReason.length > 0);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedReason) throw new Error("Selecciona un motivo");
      const result = await requestSaleDiscount(saleId, {
        reason: selectedReason,
        notes: isOtherSelected ? trimmedOtherReason : undefined,
      });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      resetForm();
      onClose();
      onSuccess?.();
    },
    onError: (err: Error) => showError(err.message),
  });

  const handleClose = () => {
    if (mutation.isPending) return;
    resetForm();
    onClose();
  };

  if (existingRequest) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}
      >
        <ModalHeader>
          <div>
            <ModalTitle>Solicitar descuento especial</ModalTitle>
            <ModalDescription>
              Se enviará una solicitud a dirección general para validar tu
              solicitud.
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
          Selecciona una opción:
        </Typography>

        <Stack
          spacing={1.5}
          sx={{ flex: 1, overflow: "auto", minHeight: 0, pb: 1, mt: 1.5 }}
        >
          {DISCOUNT_REQUEST_REASONS.map((reason) => {
            const selected = selectedReason === reason.id;

            return (
              <ReasonCard
                key={reason.id}
                selected={selected}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedReason(reason.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedReason(reason.id);
                  }
                }}
              >
                <Stack
                  spacing={reason.allowsCustomText ? 1.5 : 0.5}
                  flex={1}
                  minWidth={0}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    {reason.title}
                  </Typography>
                  {reason.allowsCustomText ? (
                    <FormTextField
                      placeholder="Ingresa otro motivo"
                      value={otherReasonText}
                      onChange={(event) =>
                        setOtherReasonText(event.target.value)
                      }
                      onFocus={() => setSelectedReason(reason.id)}
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
            color="primary"
            disabled={!canSubmit || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Solicitar descuento especial"
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
