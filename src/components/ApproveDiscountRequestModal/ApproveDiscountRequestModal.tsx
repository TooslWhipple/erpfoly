import { useId, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
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
import { X as CloseIcon } from "lucide-react";
import { CloseButton } from "@/components/ModalForm/styles";
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
      maxWidth="md"
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
          width: fullScreen ? "100%" : "min(720px, calc(100vw - 32px))",
          maxWidth: fullScreen ? "100%" : "min(720px, calc(100vw - 32px))",
          height: fullScreen ? "100%" : "auto",
          maxHeight: fullScreen ? "100%" : "calc(100dvh - 32px)",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogContent
        sx={{
          padding: 2,
          paddingTop: fullScreen
            ? `calc(${theme.spacing(2)} + env(safe-area-inset-top))`
            : 2,
          paddingBottom: `calc(${theme.spacing(2)} + env(safe-area-inset-bottom))`,
          display: "flex",
          flexDirection: "column",
          flex: fullScreen ? 1 : "1 1 auto",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Stack
          direction="row"
          alignItems="flex-start"
          spacing={1}
          sx={{ mb: 1.5, flexShrink: 0 }}
        >
          <Stack spacing={0.25} flex={1} minWidth={0}>
            <Typography id={titleId} variant="h6" fontWeight={600}>
              Aprobar descuento especial
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Marca cada pieza. El descuento es del 2% al 40% de su base, o un monto fijo.
            </Typography>
          </Stack>
          {fullScreen && (
            <CloseButton onClick={onClose} size="small" aria-label="Cerrar">
              <CloseIcon size={16} />
            </CloseButton>
          )}
        </Stack>

        <ModalBody>
          {granular
            ? groups.map((group) => {
                const groupInvalid = group.pieces.some((row) => row.result.error);
                return (
                  <LineCard key={group.sku} invalid={groupInvalid}>
                    <Stack spacing={1.25}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="baseline"
                        justifyContent="space-between"
                      >
                        <Typography variant="subtitle2" noWrap title={group.name} fontWeight={600}>
                          {group.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                          {group.sku}
                        </Typography>
                      </Stack>
                      {group.pieces.map((row) => {
                        const { line, draft, result } = row;
                        const key = pieceKey(line);
                        const numbered = group.pieces.length > 1;
                        const errorId = result.error
                          ? `discount-piece-error-${line.discountRequestItemId}-${line.unitIndex}`
                          : undefined;
                        const notes = line.notes?.trim() ?? "";
                        return (
                          <Stack
                            key={key}
                            spacing={0.75}
                            sx={{ opacity: draft.apply ? 1 : 0.72 }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                              flexWrap={{ xs: "wrap", sm: "nowrap" }}
                            >
                              <Checkbox
                                checked={draft.apply}
                                size="small"
                                onChange={(_, next) => updateDraft(key, { apply: next })}
                                slotProps={{
                                  input: {
                                    "aria-label": `Aplicar descuento a ${line.name}, pieza ${line.unitIndex}`,
                                  },
                                }}
                                sx={{ p: 0.5, flexShrink: 0 }}
                              />
                              <Stack flex={1} minWidth={0} spacing={0}>
                                {numbered && (
                                  <Typography variant="body2" fontWeight={600}>
                                    Pieza {line.unitIndex}
                                  </Typography>
                                )}
                                <Typography variant="caption" color="text.secondary">
                                  Base {formatCurrency(line.baseAmount)}
                                </Typography>
                              </Stack>
                              {draft.apply && (
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{
                                  flexShrink: 0,
                                  width: { xs: "100%", sm: "auto" },
                                  pl: { xs: 4.5, sm: 0 },
                                  justifyContent: { xs: "flex-start", sm: "flex-end" },
                                }}
                              >
                                <ToggleButtonGroup
                                  value={draft.mode}
                                  exclusive
                                  size="small"
                                  onChange={(_event, next: ApproveDiscountRequestMode | null) => {
                                    if (!next) return;
                                    updateDraft(key, { mode: next });
                                  }}
                                  sx={{
                                    flexShrink: 0,
                                    "& .MuiToggleButton-root": {
                                      minHeight: 40,
                                      minWidth: 40,
                                      px: 1,
                                    },
                                    "& .MuiToggleButtonGroup-grouped": {
                                      border: `1px solid ${theme.palette.app.border}`,
                                      "&.Mui-selected": {
                                        backgroundColor: theme.palette.app.sidebar.itemSelected,
                                        color: theme.palette.app.sidebar.textSelected,
                                      },
                                    },
                                  }}
                                >
                                  <ToggleButton value="pct" aria-label="Porcentaje">
                                    %
                                  </ToggleButton>
                                  <ToggleButton value="amount" aria-label="Monto fijo">
                                    $
                                  </ToggleButton>
                                </ToggleButtonGroup>
                                <TextField
                                  size="small"
                                  value={draft.value}
                                  error={Boolean(result.error)}
                                  placeholder={draft.mode === "pct" ? "2–40" : "0.00"}
                                  onChange={(event) =>
                                    updateDraft(key, { value: event.target.value })
                                  }
                                  slotProps={{
                                    htmlInput: {
                                      inputMode: "decimal",
                                      "aria-invalid": Boolean(result.error),
                                      "aria-describedby": errorId,
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
                                  sx={{
                                    width: { xs: "100%", sm: 128 },
                                    "& .MuiInputBase-root": { minHeight: 40 },
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  fontWeight={700}
                                  color="error.main"
                                  sx={{ minWidth: 84, textAlign: "right", flexShrink: 0 }}
                                >
                                  {result.value != null
                                    ? `−${formatCurrency(result.amount)}`
                                    : ""}
                                </Typography>
                              </Stack>
                              )}
                            </Stack>
                            <Stack spacing={0.5} sx={{ pl: 4.5, minWidth: 0 }}>
                              <Chip
                                size="small"
                                label={line.reasonLabel}
                                sx={{
                                  alignSelf: "flex-start",
                                  height: "auto",
                                  maxWidth: "100%",
                                  "& .MuiChip-label": {
                                    display: "block",
                                    whiteSpace: "normal",
                                    overflow: "visible",
                                    textOverflow: "clip",
                                    py: 0.5,
                                  },
                                }}
                              />
                              {notes && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}
                                >
                                  {notes}
                                </Typography>
                              )}
                            </Stack>
                            {result.error && (
                              <Typography
                                id={errorId}
                                variant="caption"
                                color="error.main"
                                sx={{ pl: 4.5 }}
                              >
                                {result.error}
                              </Typography>
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
              <Stack spacing={0} flex={1} minWidth={0}>
                <Typography variant="caption" color="text.secondary">
                  Antes
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ textDecoration: "line-through" }}>
                  {formatCurrency(baseTotal)}
                </Typography>
              </Stack>
              <Stack spacing={0} flex={1} minWidth={0} textAlign="right">
                <Typography variant="caption" color="text.secondary">
                  Con descuento
                </Typography>
                <Typography variant="body1" fontWeight={700}>
                  {formatCurrency(roundCents(baseTotal - discountTotal))}
                </Typography>
                <Typography variant="caption" color="error.main" fontWeight={600}>
                  −{formatCurrency(discountTotal)}
                </Typography>
              </Stack>
            </PriceComparisonPanel>
          )}
          {hint && (
            <Typography variant="body2" color="error.main">
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
            {`Aprobar ${formatCurrency(
              granular
                ? discountTotal
                : evaluateDraft(saleTotal, { mode: legacyMode, value: legacyValue }).amount,
            )}`}
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
        size="small"
        onChange={(_event, next: ApproveDiscountRequestMode | null) => {
          if (next) onMode(next);
        }}
        sx={{ "& .MuiToggleButton-root": { minHeight: 40, px: 1.5 } }}
      >
        <ToggleButton value="pct" aria-label="Porcentaje">%</ToggleButton>
        <ToggleButton value="amount" aria-label="Monto fijo">$</ToggleButton>
      </ToggleButtonGroup>
      <TextField
        size="small"
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
