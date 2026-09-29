import { useCallback, useState } from "react";
import {
  Button,
  Checkbox,
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

export interface DiscountRequestLineOption {
  saleItemId: number;
  name: string;
  quantity: number;
  total: number;
}

export interface DiscountRequestModalProps {
  open: boolean;
  onClose: () => void;
  saleId: number;
  lines: DiscountRequestLineOption[];
  existingRequest: SaleDiscountRequest | null;
  onSuccess?: () => void;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value);
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
  lines,
  existingRequest,
  onSuccess,
}: DiscountRequestModalProps) {
  const showError = useSnackbarStore((state) => state.showError);

  const [selectedReason, setSelectedReason] =
    useState<DiscountRequestReason | null>(null);
  const [otherReasonText, setOtherReasonText] = useState("");
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const resetForm = useCallback(() => {
    setSelectedReason(null);
    setOtherReasonText("");
    setQuantities({});
  }, []);

  const isOtherSelected = selectedReason === "OTHER";
  const trimmedOtherReason = otherReasonText.trim();
  const selectedItems = lines.flatMap((line) => {
    const quantity = quantities[line.saleItemId] ?? 0;
    return quantity > 0
      ? [{ saleItemId: line.saleItemId, quantity }]
      : [];
  });
  const canSubmit =
    selectedItems.length > 0 &&
    selectedReason !== null &&
    (!isOtherSelected || trimmedOtherReason.length > 0);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedReason) throw new Error("Selecciona un motivo");
      if (selectedItems.length === 0) {
        throw new Error("Selecciona al menos una pieza");
      }
      const result = await requestSaleDiscount(saleId, {
        reason: selectedReason,
        notes: isOtherSelected ? trimmedOtherReason : undefined,
        items: selectedItems,
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
          Piezas con descuento
        </Typography>
        <Stack spacing={1} sx={{ mt: 1, mb: 2 }}>
          {lines.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Guarda los artículos de la cotización para elegir las piezas.
            </Typography>
          ) : (
            lines.map((line) => {
              const selectedQty = quantities[line.saleItemId] ?? 0;
              const checked = selectedQty > 0;
              return (
                <Stack
                  key={line.saleItemId}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  <Checkbox
                    checked={checked}
                    onChange={(_, next) => {
                      setQuantities((current) => ({
                        ...current,
                        [line.saleItemId]: next ? 1 : 0,
                      }));
                    }}
                    inputProps={{
                      "aria-label": `Aplicar descuento a ${line.name}`,
                    }}
                  />
                  <Stack flex={1} minWidth={0}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {line.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {line.quantity} en la cotización · {formatMoney(line.total)}
                    </Typography>
                  </Stack>
                  {checked && line.quantity > 1 && (
                    <FormTextField
                      type="number"
                      size="small"
                      value={String(selectedQty)}
                      onChange={(event) => {
                        const next = Number(event.target.value);
                        if (!Number.isInteger(next)) return;
                        setQuantities((current) => ({
                          ...current,
                          [line.saleItemId]: Math.min(
                            line.quantity,
                            Math.max(1, next),
                          ),
                        }));
                      }}
                      inputProps={{ min: 1, max: line.quantity, step: 1 }}
                      sx={{ width: 88 }}
                    />
                  )}
                </Stack>
              );
            })
          )}
        </Stack>

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
