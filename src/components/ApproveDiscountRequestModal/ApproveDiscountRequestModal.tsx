import { useId, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Dialog,
  DialogContent,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { LineCard, ModalBody, ModalFooter, PriceComparisonPanel } from "./styles";

const MAX_SPECIAL_DISCOUNT_PCT = 40;

export type ApproveDiscountRequestMode = "pct" | "amount";

export interface ApproveDiscountLineInput {
  discountRequestItemId: number;
  name: string;
  quantity: number;
  baseAmount: number;
  reasonLabel: string;
  notes?: string | null;
}

export type ApproveDiscountLineDecision = {
  discountRequestItemId: number;
  mode: ApproveDiscountRequestMode;
  value: number;
};

export type ApproveDiscountRequestResult =
  | { items: ApproveDiscountLineDecision[] }
  | { mode: ApproveDiscountRequestMode; value: number };

type LineDraft = {
  mode: ApproveDiscountRequestMode;
  value: string;
};

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
  draft: LineDraft,
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

function emptyDrafts(lines: ApproveDiscountLineInput[]): Record<number, LineDraft> {
  return Object.fromEntries(
    lines.map((line) => [
      line.discountRequestItemId,
      { mode: "pct" as const, value: "" },
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
  const [drafts, setDrafts] = useState<Record<number, LineDraft>>(() =>
    emptyDrafts(lines),
  );
  const [legacyMode, setLegacyMode] = useState<ApproveDiscountRequestMode>("pct");
  const [legacyValue, setLegacyValue] = useState("");

  const evaluated = useMemo(
    () =>
      lines.map((line) => ({
        line,
        result: evaluateDraft(
          line.baseAmount,
          drafts[line.discountRequestItemId] ?? { mode: "pct", value: "" },
        ),
      })),
    [drafts, lines],
  );

  const missing = evaluated.filter((row) => row.result.value == null && !row.result.error).length;
  const invalid = evaluated.filter((row) => row.result.error).length;
  const discountTotal = roundCents(
    evaluated.reduce((sum, row) => sum + row.result.amount, 0),
  );
  const baseTotal = roundCents(
    evaluated.reduce((sum, row) => sum + row.line.baseAmount, 0),
  );
  const canApprove = granular
    ? evaluated.length > 0 && missing === 0 && invalid === 0
    : evaluateDraft(saleTotal, { mode: legacyMode, value: legacyValue }).value != null;

  const hint = granular
    ? missing > 0
      ? missing === 1
        ? "Falta el descuento de 1 artículo."
        : `Falta el descuento de ${missing} artículos.`
      : invalid > 0
        ? "Revisa los montos marcados."
        : ""
    : "";

  const reset = () => {
    setDrafts(emptyDrafts(lines));
    setLegacyMode("pct");
    setLegacyValue("");
  };

  const updateDraft = (
    id: number,
    patch: Partial<LineDraft>,
  ) => {
    setDrafts((current) => {
      const previous = current[id] ?? { mode: "pct" as const, value: "" };
      const next = { ...previous, ...patch };
      if (patch.mode && patch.mode !== previous.mode) {
        next.value = "";
      }
      return { ...current, [id]: next };
    });
  };

  const handleApproveClick = () => {
    if (!canApprove) return;
    if (granular) {
      onApprove?.({
        items: evaluated.flatMap(({ line, result }) =>
          result.value == null
            ? []
            : [
                {
                  discountRequestItemId: line.discountRequestItemId,
                  mode: drafts[line.discountRequestItemId]?.mode ?? "pct",
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
            Cada artículo tiene su propio porcentaje o monto fijo.
          </Typography>
        </Stack>

        <ModalBody>
          {granular
            ? evaluated.map(({ line, result }) => {
                const draft = drafts[line.discountRequestItemId] ?? {
                  mode: "pct" as const,
                  value: "",
                };
                const after = roundCents(line.baseAmount - result.amount);
                return (
                  <LineCard key={line.discountRequestItemId} invalid={Boolean(result.error)}>
                    <Stack spacing={1.5}>
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2" noWrap title={line.name}>
                          {line.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {line.quantity}{" "}
                          {line.quantity === 1 ? "pieza" : "piezas"} · Base{" "}
                          {formatCurrency(line.baseAmount)}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip size="small" label={line.reasonLabel} />
                        </Stack>
                        {line.notes?.trim() && (
                          <Typography variant="body2" color="text.secondary">
                            {line.notes.trim()}
                          </Typography>
                        )}
                      </Stack>
                      <ToggleButtonGroup
                        value={draft.mode}
                        exclusive
                        fullWidth
                        size="small"
                        onChange={(_event, next: ApproveDiscountRequestMode | null) => {
                          if (!next) return;
                          updateDraft(line.discountRequestItemId, { mode: next });
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
                          updateDraft(line.discountRequestItemId, {
                            value: event.target.value,
                          })
                        }
                        slotProps={{
                          htmlInput: {
                            inputMode: "decimal",
                            "aria-label":
                              draft.mode === "pct"
                                ? `Porcentaje de ${line.name}`
                                : `Monto fijo de ${line.name}`,
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
