import { useId, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogContent,
  FormControlLabel,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { groupDiscountPiecesBySku } from "@/utils/discountRequest";
import { LineCard, ModalBody, ModalFooter, PriceComparisonPanel } from "./styles";

const MAX_SPECIAL_DISCOUNT_PCT = 40;

export type ApproveDiscountRequestMode = "pct" | "amount";

export interface ApproveDiscountLineInput {
  discountRequestItemId: number;
  unitIndex: number;
  sku: string;
  name: string;
  baseAmount: number;
  reasonLabel: string;
  notes?: string | null;
}

export type ApproveDiscountLineDecision = {
  discountRequestItemId: number;
  unitIndex: number;
  mode: ApproveDiscountRequestMode;
  value: number;
};

export type ApproveDiscountRequestResult =
  | { items: ApproveDiscountLineDecision[] }
  | { mode: ApproveDiscountRequestMode; value: number };

type LineDraft = {
  apply: boolean;
  mode: ApproveDiscountRequestMode;
  value: string;
};

function pieceKey(line: Pick<ApproveDiscountLineInput, "discountRequestItemId" | "unitIndex">): string {
  return `${line.discountRequestItemId}:${line.unitIndex}`;
}

export interface ApproveDiscountRequestModalProps {
  open: boolean;
  onClose: () => void;
  lines?: ApproveDiscountLineInput[];
  saleTotal: number;
  suggestedDiscountPercent?: number;
  onApprove?: (result: ApproveDiscountRequestResult) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function roundCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function maxAmountFor(base: number): number {
  return roundCents(base * (MAX_SPECIAL_DISCOUNT_PCT / 100));
}

function parseDraft(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  if (!normalized) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function evaluateDraft(
  base: number,
  draft: Pick<LineDraft, "mode" | "value">,
): { amount: number; error: string | null; value: number | null } {
  const parsed = parseDraft(draft.value);
  if (parsed == null) {
    return { amount: 0, error: null, value: null };
  }
  if (draft.mode === "pct") {
    if (parsed < 2 || parsed > MAX_SPECIAL_DISCOUNT_PCT) {
      return {
        amount: 0,
        error: "El porcentaje debe estar entre 2 y 40.",
        value: null,
      };
    }
    return {
      amount: roundCents((base * parsed) / 100),
      error: null,
      value: parsed,
    };
  }
  const max = maxAmountFor(base);
  const amount = roundCents(parsed);
  if (amount <= 0 || amount > max) {
    return {
      amount: 0,
      error: `Máximo ${formatCurrency(max)} en esta pieza.`,
      value: null,
    };
  }
  return { amount, error: null, value: amount };
}

function emptyDrafts(lines: ApproveDiscountLineInput[]): Record<string, LineDraft> {
  return Object.fromEntries(
    lines.map((line) => [
      pieceKey(line),
      { apply: true, mode: "pct" as const, value: "" },
    ]),
  );
}

export function ApproveDiscountRequestModal({
  open,
  onClose,
  lines = [],
  saleTotal,
  onApprove,
}: ApproveDiscountRequestModalProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const titleId = useId();
  const granular = lines.length > 0;
  const [drafts, setDrafts] = useState<Record<string, LineDraft>>(() =>
    emptyDrafts(lines),
  );
  const [legacyMode, setLegacyMode] = useState<ApproveDiscountRequestMode>("pct");
  const [legacyValue, setLegacyValue] = useState("");

  const evaluated = useMemo(
    () =>
      lines.map((line) => {
        const draft = drafts[pieceKey(line)] ?? {
          apply: true,
          mode: "pct" as const,
          value: "",
        };
        return {
          line,
          draft,
          sku: line.sku,
          name: line.name,
          result: draft.apply
            ? evaluateDraft(line.baseAmount, draft)
            : { amount: 0, error: null, value: null },
        };
      }),
    [drafts, lines],
  );
  const groups = useMemo(
    () => groupDiscountPiecesBySku(evaluated),
    [evaluated],
  );
  const applied = evaluated.filter((row) => row.draft.apply);
  const missing = applied.filter(
    (row) => row.result.value == null && !row.result.error,
  ).length;
  const invalid = applied.filter((row) => row.result.error).length;
  const discountTotal = roundCents(
    applied.reduce((sum, row) => sum + row.result.amount, 0),
  );
  const baseTotal = roundCents(
    applied.reduce((sum, row) => sum + row.line.baseAmount, 0),
  );
  const canApprove = granular
    ? applied.length > 0 && missing === 0 && invalid === 0
    : evaluateDraft(saleTotal, { mode: legacyMode, value: legacyValue }).value != null;

  const hint = granular
    ? applied.length === 0
      ? "Elige al menos una pieza."
      : missing > 0
        ? missing === 1
          ? "Falta el descuento de 1 pieza."
          : `Falta el descuento de ${missing} piezas.`
        : invalid > 0
          ? "Revisa los montos marcados."
          : ""
    : "";

  const reset = () => {
    setDrafts(emptyDrafts(lines));
    setLegacyMode("pct");
    setLegacyValue("");
  };

  const updateDraft = (key: string, patch: Partial<LineDraft>) => {
    setDrafts((current) => {
      const previous = current[key] ?? {
        apply: true,
        mode: "pct" as const,
        value: "",
      };
      const next = { ...previous, ...patch };
      if (patch.mode && patch.mode !== previous.mode) {
        next.value = "";
      }
      return { ...current, [key]: next };
    });
  };

  const handleApproveClick = () => {
    if (!canApprove) return;
    if (granular) {
      onApprove?.({
        items: applied.flatMap(({ line, draft, result }) =>
          result.value == null
            ? []
            : [
                {
                  discountRequestItemId: line.discountRequestItemId,
                  unitIndex: line.unitIndex,
                  mode: draft.mode,
                  value: result.value,
                },
              ],
        ),
      });
    } else {
      const result = evaluateDraft(saleTotal, {
        mode: legacyMode,
        value: legacyValue,
      });
      if (result.value == null) return;
      onApprove?.({ mode: legacyMode, value: result.value });
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      aria-labelledby={titleId}
      TransitionProps={{ onEnter: reset }}
      sx={
        fullScreen
          ? undefined
          : {
              "& .MuiDialog-container": {
                alignItems: "flex-start",
                justifyContent: "flex-end",
              },
            }
      }
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : "12px",
          overflow: "hidden",
          m: 0,
          mt: fullScreen ? 0 : 2,
          mr: fullScreen ? 0 : 2,
          width: fullScreen ? "100%" : 480,
          maxWidth: fullScreen ? "100%" : 480,
          height: fullScreen ? "100%" : "auto",
          maxHeight: fullScreen ? "100%" : "calc(100dvh - 32px)",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogContent
        sx={{
          padding: fullScreen ? 2 : 3,
          paddingBottom: `calc(${theme.spacing(fullScreen ? 2 : 3)} + env(safe-area-inset-bottom))`,
          display: "flex",
          flexDirection: "column",
          flex: fullScreen ? 1 : "1 1 auto",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Stack spacing={0.5} sx={{ mb: 2, flexShrink: 0 }}>
          <Typography id={titleId} variant="h5" fontWeight={600}>
            Aprobar descuento especial
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cada pieza tiene su propio porcentaje o monto. Puedes dejar alguna sin descuento.
          </Typography>
        </Stack>

        <ModalBody>
          {granular
            ? groups.map((group) => {
                const groupInvalid = group.pieces.some((row) => row.result.error);
                return (
                  <LineCard key={group.sku} invalid={groupInvalid}>
                    <Stack spacing={2}>
                      <Stack spacing={0.25}>
                        <Typography variant="subtitle2" noWrap title={group.name}>
                          {group.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {group.sku}
                        </Typography>
                      </Stack>
                      {group.pieces.map((row) => {
                        const { line, draft, result } = row;
                        const key = pieceKey(line);
                        const after = roundCents(line.baseAmount - result.amount);
                        return (
                          <Stack
                            key={key}
                            spacing={1.5}
                            sx={{ opacity: draft.apply ? 1 : 0.45 }}
                          >
                            {group.pieces.length > 1 && (
                              <Typography variant="body2" fontWeight={600}>
                                Pieza {line.unitIndex}
                              </Typography>
                            )}
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              <Chip size="small" label={line.reasonLabel} />
                            </Stack>
                            {line.notes?.trim() && (
                              <Typography variant="body2" color="text.secondary">
                                {line.notes.trim()}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              Base {formatCurrency(line.baseAmount)}
                            </Typography>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={draft.apply}
                                  onChange={(_, next) =>
                                    updateDraft(key, { apply: next })
                                  }
                                  slotProps={{
                                    input: {
                                      "aria-label": `Aplicar descuento a ${line.name}, pieza ${line.unitIndex}`,
                                    },
                                  }}
                                />
                              }
                              label="Aplicar descuento"
                            />
                            {draft.apply && (
                              <>
                                <ToggleButtonGroup
                                  value={draft.mode}
                                  exclusive
                                  fullWidth
                                  size="small"
                                  onChange={(_event, next: ApproveDiscountRequestMode | null) => {
                                    if (!next) return;
                                    updateDraft(key, { mode: next });
                                  }}
                                  sx={{
                                    "& .MuiToggleButton-root": { minHeight: 44 },
                                    "& .MuiToggleButtonGroup-grouped": {
                                      border: `1px solid ${theme.palette.app.border}`,
                                      "&.Mui-selected": {
                                        backgroundColor: theme.palette.app.sidebar.itemSelected,
                                        color: theme.palette.app.sidebar.textSelected,
                                      },
                                    },
                                  }}
                                >
                                  <ToggleButton value="pct">Porcentaje</ToggleButton>
                                  <ToggleButton value="amount">Monto fijo</ToggleButton>
                                </ToggleButtonGroup>
                                <TextField
                                  label={draft.mode === "pct" ? "Porcentaje" : "Monto fijo"}
                                  value={draft.value}
                                  error={Boolean(result.error)}
                                  helperText={
                                    result.error ??
                                    (draft.mode === "pct"
                                      ? "Entre 2% y 40% de esta pieza."
                                      : `Máximo ${formatCurrency(maxAmountFor(line.baseAmount))} en esta pieza.`)
                                  }
                                  onChange={(event) =>
                                    updateDraft(key, { value: event.target.value })
                                  }
                                  slotProps={{
                                    htmlInput: {
                                      inputMode: "decimal",
                                      "aria-label":
                                        draft.mode === "pct"
                                          ? `Porcentaje de ${line.name}, pieza ${line.unitIndex}`
                                          : `Monto fijo de ${line.name}, pieza ${line.unitIndex}`,
                                    },
                                    input: {
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          {draft.mode === "pct" ? "%" : "$"}
                                        </InputAdornment>
                                      ),
                                    },
                                  }}
                                  sx={{ "& .MuiInputBase-root": { minHeight: 44 } }}
                                />
                                {result.value != null && (
                                  <PriceComparisonPanel>
                                    <Stack spacing={0.25} flex={1} minWidth={0}>
                                      <Typography variant="caption" color="text.secondary">
                                        Antes
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        sx={{ textDecoration: "line-through" }}
                                      >
                                        {formatCurrency(line.baseAmount)}
                                      </Typography>
                                    </Stack>
                                    <Stack spacing={0.25} flex={1} minWidth={0} textAlign="right">
                                      <Typography variant="caption" color="text.secondary">
                                        Con descuento
                                      </Typography>
                                      <Typography variant="body2" fontWeight={700}>
                                        {formatCurrency(after)}
                                      </Typography>
                                      <Typography variant="caption" color="error.main">
                                        -{formatCurrency(result.amount)}
                                      </Typography>
                                    </Stack>
                                  </PriceComparisonPanel>
                                )}
                              </>
                            )}
                          </Stack>
                        );
                      })}
                    </Stack>
                  </LineCard>
                );
              })
            : (
              <LegacyApproval
                saleTotal={saleTotal}
                mode={legacyMode}
                value={legacyValue}
                onMode={(mode) => {
                  setLegacyMode(mode);
                  setLegacyValue("");
                }}
                onValue={setLegacyValue}
              />
            )}
        </ModalBody>

        <ModalFooter>
          {granular && (
            <Typography variant="body2" color="text.secondary">
              {applied.length} de {evaluated.length}{" "}
              {evaluated.length === 1 ? "pieza" : "piezas"}
            </Typography>
          )}
          {granular && applied.length > 0 && (
            <PriceComparisonPanel>
              <Stack spacing={0.25} flex={1}>
                <Typography variant="caption" color="text.secondary">
                  Antes
                </Typography>
                <Typography variant="subtitle2" sx={{ textDecoration: "line-through" }}>
                  {formatCurrency(baseTotal)}
                </Typography>
              </Stack>
              <Stack spacing={0.25} flex={1} textAlign="right">
                <Typography variant="caption" color="text.secondary">
                  Con descuento
                </Typography>
                <Typography variant="subtitle2" fontWeight={700}>
                  {formatCurrency(roundCents(baseTotal - discountTotal))}
                </Typography>
                <Typography variant="caption" color="error.main">
                  -{formatCurrency(discountTotal)}
                </Typography>
              </Stack>
            </PriceComparisonPanel>
          )}
          {hint && (
            <Typography variant="body2" color="text.secondary">
              {hint}
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={!canApprove}
            onClick={handleApproveClick}
            sx={{ minHeight: 44 }}
          >
            {`Aprobar descuento [${formatCurrency(
              granular
                ? discountTotal
                : evaluateDraft(saleTotal, { mode: legacyMode, value: legacyValue }).amount,
            )}]`}
          </Button>
        </ModalFooter>
      </DialogContent>
    </Dialog>
  );
}

function LegacyApproval({
  saleTotal,
  mode,
  value,
  onMode,
  onValue,
}: {
  saleTotal: number;
  mode: ApproveDiscountRequestMode;
  value: string;
  onMode: (mode: ApproveDiscountRequestMode) => void;
  onValue: (value: string) => void;
}) {
  const theme = useTheme();
  const result = evaluateDraft(saleTotal, { mode, value });
  return (
    <Stack spacing={1.5}>
      <Typography variant="body2" color="text.secondary">
        Esta solicitud no tiene partidas. El descuento aplica al total de{" "}
        {formatCurrency(saleTotal)}.
      </Typography>
      <ToggleButtonGroup
        value={mode}
        exclusive
        fullWidth
        onChange={(_event, next: ApproveDiscountRequestMode | null) => {
          if (next) onMode(next);
        }}
        sx={{ "& .MuiToggleButton-root": { minHeight: 44 } }}
      >
        <ToggleButton value="pct">Porcentaje</ToggleButton>
        <ToggleButton value="amount">Monto fijo</ToggleButton>
      </ToggleButtonGroup>
      <TextField
        label={mode === "pct" ? "Porcentaje" : "Monto fijo"}
        value={value}
        error={Boolean(result.error)}
        helperText={
          result.error ??
          (mode === "amount"
            ? `Máximo ${formatCurrency(maxAmountFor(saleTotal))}.`
            : "Entre 2% y 40%.")
        }
        onChange={(event) => onValue(event.target.value)}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                {mode === "pct" ? "%" : "$"}
              </InputAdornment>
            ),
          },
        }}
        sx={{
          "& .MuiInputBase-root": { minHeight: 44 },
          borderColor: theme.palette.divider,
        }}
      />
    </Stack>
  );
}
