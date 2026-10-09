import { useCallback, useId, useState } from "react";
import {
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { X as CloseIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  ModalHeader,
  ModalTitle,
  ModalDescription,
  CloseButton,
} from "@/components/ModalForm/styles";
import { requestSaleDiscount } from "@/services/ventas.service";
import type {
  DiscountRequestReason,
  SaleDiscountRequest,
} from "@/types/ventas.types";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { LineCard, ModalBody, ModalFooter } from "./styles";

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

const NOTES_MAX = 512;

interface DiscountReasonOption {
  id: DiscountRequestReason;
  title: string;
}

const DISCOUNT_REQUEST_REASONS: DiscountReasonOption[] = [
  { id: "LAST_UNIT", title: "Última pieza" },
  { id: "DAMAGED_ITEM", title: "Pieza dañada o con desperfecto" },
  { id: "CLOSING_SALE", title: "Cierre de venta" },
  { id: "OTHER", title: "Otro motivo" },
];

type LineDraft = {
  quantity: number;
  reason: DiscountRequestReason | "";
  notes: string;
  reasonTouched: boolean;
  notesTouched: boolean;
};

function formatMoney(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value);
}

function lineIsComplete(draft: LineDraft): boolean {
  if (!draft.reason) return false;
  if (draft.reason === "OTHER" && draft.notes.trim().length === 0) return false;
  return true;
}

export function DiscountRequestModal({
  open,
  onClose,
  saleId,
  lines,
  existingRequest,
  onSuccess,
}: DiscountRequestModalProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const titleId = useId();
  const hintId = useId();
  const showError = useSnackbarStore((state) => state.showError);
  const [drafts, setDrafts] = useState<Record<number, LineDraft>>({});

  const resetForm = useCallback(() => {
    setDrafts({});
  }, []);

  const selected = lines.flatMap((line) => {
    const draft = drafts[line.saleItemId];
    return draft ? [{ line, draft }] : [];
  });
  const missingReason = selected.filter(({ draft }) => !draft.reason).length;
  const missingNotes = selected.filter(
    ({ draft }) => draft.reason === "OTHER" && draft.notes.trim().length === 0,
  ).length;
  const canSubmit =
    selected.length > 0 && missingReason === 0 && missingNotes === 0;

  let hint = "";
  if (lines.length > 0 && selected.length === 0) {
    hint = "Selecciona al menos una pieza.";
  } else if (missingReason > 0) {
    hint =
      missingReason === 1
        ? "Elige el motivo de 1 artículo."
        : `Elige el motivo de ${missingReason} artículos.`;
  } else if (missingNotes > 0) {
    hint =
      missingNotes === 1
        ? "Escribe el motivo del artículo marcado como Otro."
        : "Escribe el motivo de los artículos marcados como Otro.";
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const items = selected.filter(({ draft }) => lineIsComplete(draft));
      if (items.length === 0 || items.length !== selected.length) {
        throw new Error(hint || "Elige el motivo de cada artículo.");
      }
      const result = await requestSaleDiscount(saleId, {
        items: items.map(({ line, draft }) => ({
          saleItemId: line.saleItemId,
          quantity: draft.quantity,
          reason: draft.reason as DiscountRequestReason,
          notes:
            draft.reason === "OTHER" ? draft.notes.trim() : undefined,
        })),
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
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      aria-labelledby={titleId}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 2,
          maxHeight: fullScreen ? "100%" : "90vh",
          height: fullScreen ? "100%" : "min(720px, 90vh)",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          p: 0,
        }}
      >
        <ModalHeader sx={{ px: 3, pt: 3, pb: 2 }}>
          <div>
            <ModalTitle id={titleId}>Solicitar descuento especial</ModalTitle>
            <ModalDescription>
              Cada pieza puede llevar un motivo distinto. Se enviará una sola
              solicitud a dirección general.
            </ModalDescription>
          </div>
          <CloseButton
            onClick={handleClose}
            disabled={mutation.isPending}
            size="small"
            aria-label="Cerrar"
          >
            <CloseIcon size={16} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Piezas con descuento
          </Typography>
          {lines.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Guarda los artículos de la cotización para elegir las piezas.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {lines.map((line) => {
                const draft = drafts[line.saleItemId];
                const checked = draft != null;
                const reasonMissing = checked && !draft.reason;
                const notesMissing =
                  checked &&
                  draft.reason === "OTHER" &&
                  draft.notes.trim().length === 0;
                const showReasonError = reasonMissing && draft.reasonTouched;
                const showNotesError = notesMissing && draft.notesTouched;
                const reasonFieldId = `discount-reason-${line.saleItemId}`;
                const notesFieldId = `discount-notes-${line.saleItemId}`;
                return (
                  <LineCard key={line.saleItemId} selected={checked}>
                    <Stack direction="row" alignItems="flex-start" spacing={0.5}>
                      <Checkbox
                        checked={checked}
                        sx={{ minWidth: 44, minHeight: 44 }}
                        onChange={(_, next) => {
                          setDrafts((current) => {
                            if (!next) {
                              const rest = { ...current };
                              delete rest[line.saleItemId];
                              return rest;
                            }
                            return {
                              ...current,
                              [line.saleItemId]: {
                                quantity: 1,
                                reason: "",
                                notes: "",
                                reasonTouched: false,
                                notesTouched: false,
                              },
                            };
                          });
                        }}
                        inputProps={{
                          "aria-label": `Aplicar descuento a ${line.name}`,
                        }}
                      />
                      <Stack flex={1} minWidth={0} spacing={1.5} sx={{ py: 0.5 }}>
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          spacing={1}
                          alignItems={{ md: "center" }}
                        >
                          <Stack flex={1} minWidth={0}>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              noWrap
                              title={line.name}
                            >
                              {line.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {line.quantity} en la cotización ·{" "}
                              {formatMoney(line.total)}
                            </Typography>
                          </Stack>
                          {checked && line.quantity > 1 && (
                            <TextField
                              label="Cantidad"
                              type="number"
                              size="small"
                              value={String(draft.quantity)}
                              onChange={(event) => {
                                const next = Number(event.target.value);
                                if (!Number.isInteger(next)) return;
                                setDrafts((current) => ({
                                  ...current,
                                  [line.saleItemId]: {
                                    ...draft,
                                    quantity: Math.min(
                                      line.quantity,
                                      Math.max(1, next),
                                    ),
                                  },
                                }));
                              }}
                              slotProps={{
                                htmlInput: {
                                  min: 1,
                                  max: line.quantity,
                                  step: 1,
                                  inputMode: "numeric",
                                  "aria-label": `Cantidad con descuento de ${line.name}`,
                                },
                              }}
                              sx={{
                                width: { xs: "100%", md: 120 },
                                "& .MuiInputBase-root": { minHeight: 44 },
                              }}
                            />
                          )}
                        </Stack>
                        {checked && (
                          <>
                            <FormControl
                              fullWidth
                              size="small"
                              error={showReasonError}
                              sx={{ "& .MuiInputBase-root": { minHeight: 44 } }}
                            >
                              <Typography
                                component="label"
                                htmlFor={reasonFieldId}
                                variant="body2"
                                color={showReasonError ? "error.main" : "text.primary"}
                                sx={{ mb: 0.5, display: "block", fontWeight: 500 }}
                              >
                                Motivo
                              </Typography>
                              <Select
                                id={reasonFieldId}
                                value={draft.reason}
                                displayEmpty
                                error={showReasonError}
                                aria-invalid={showReasonError}
                                onClose={() => {
                                  setDrafts((current) => {
                                    const row = current[line.saleItemId];
                                    if (!row) return current;
                                    return {
                                      ...current,
                                      [line.saleItemId]: {
                                        ...row,
                                        reasonTouched: true,
                                      },
                                    };
                                  });
                                }}
                                onChange={(event) => {
                                  const reason = event.target
                                    .value as DiscountRequestReason;
                                  setDrafts((current) => ({
                                    ...current,
                                    [line.saleItemId]: {
                                      ...draft,
                                      reason,
                                      notes: reason === "OTHER" ? draft.notes : "",
                                      notesTouched:
                                        reason === "OTHER" ? draft.notesTouched : false,
                                      reasonTouched: true,
                                    },
                                  }));
                                }}
                                renderValue={(selected) => {
                                  const option = DISCOUNT_REQUEST_REASONS.find(
                                    (reason) => reason.id === selected,
                                  );
                                  if (!option) {
                                    return (
                                      <Typography
                                        component="span"
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        Selecciona un motivo
                                      </Typography>
                                    );
                                  }
                                  return option.title;
                                }}
                              >
                                <MenuItem value="" sx={{ display: "none" }}>
                                  Selecciona un motivo
                                </MenuItem>
                                {DISCOUNT_REQUEST_REASONS.map((reason) => (
                                  <MenuItem key={reason.id} value={reason.id}>
                                    {reason.title}
                                  </MenuItem>
                                ))}
                              </Select>
                              {showReasonError && (
                                <FormHelperText>Elige un motivo.</FormHelperText>
                              )}
                            </FormControl>
                            {draft.reason === "OTHER" && (
                              <TextField
                                id={notesFieldId}
                                label="Describe el motivo"
                                placeholder="Ejemplo: rasguño en la orilla"
                                value={draft.notes}
                                multiline
                                minRows={2}
                                fullWidth
                                error={showNotesError}
                                helperText={
                                  showNotesError
                                    ? "Escribe el motivo."
                                    : `${draft.notes.length}/${NOTES_MAX}`
                                }
                                onBlur={() => {
                                  setDrafts((current) => {
                                    const row = current[line.saleItemId];
                                    if (!row) return current;
                                    return {
                                      ...current,
                                      [line.saleItemId]: {
                                        ...row,
                                        notesTouched: true,
                                      },
                                    };
                                  });
                                }}
                                onChange={(event) => {
                                  const notes = event.target.value.slice(
                                    0,
                                    NOTES_MAX,
                                  );
                                  setDrafts((current) => ({
                                    ...current,
                                    [line.saleItemId]: { ...draft, notes },
                                  }));
                                }}
                                slotProps={{
                                  htmlInput: {
                                    maxLength: NOTES_MAX,
                                    "aria-invalid": showNotesError,
                                  },
                                }}
                              />
                            )}
                          </>
                        )}
                      </Stack>
                    </Stack>
                  </LineCard>
                );
              })}
            </Stack>
          )}
        </ModalBody>

        <ModalFooter>
          {hint && (
            <Typography
              id={hintId}
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1.5 }}
            >
              {hint}
            </Typography>
          )}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
          >
            <Button
              variant="contained"
              color="primary"
              disabled={!canSubmit || mutation.isPending}
              aria-describedby={hint ? hintId : undefined}
              onClick={() => mutation.mutate()}
              sx={{ minHeight: 44, width: { xs: "100%", sm: "auto" } }}
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
              sx={{ minHeight: 44, width: { xs: "100%", sm: "auto" } }}
            >
              Cancelar
            </Button>
          </Stack>
        </ModalFooter>
      </DialogContent>
    </Dialog>
  );
}
