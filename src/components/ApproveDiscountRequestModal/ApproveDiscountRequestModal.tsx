import { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Stack,
  Button,
  InputAdornment,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { FormTextField } from "@/components/Form";
import { TrackSlider } from "@/components/TrackSlider";
import { theme } from "@/styles/theme";
import { PriceComparisonPanel } from "./styles";
import { ChevronRight } from "lucide-react";

const DISCOUNT_MARKS = [2, 5, 10, 15, 20, 25, 30, 35, 40] as const;
const MAX_SPECIAL_DISCOUNT_PCT = 40;

export type ApproveDiscountRequestMode = "pct" | "amount";

export type ApproveDiscountRequestResult =
  | { mode: "pct"; value: number }
  | { mode: "amount"; value: number };

function snapToNearestMark(value: number): number {
  return DISCOUNT_MARKS.reduce((closest, mark) =>
    Math.abs(mark - value) < Math.abs(closest - value) ? mark : closest
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export interface ApproveDiscountRequestModalProps {
  open: boolean;
  onClose: () => void;
  saleTotal: number;
  suggestedDiscountPercent?: number;
  onApprove?: (result: ApproveDiscountRequestResult) => void;
}

export function ApproveDiscountRequestModal({
  open,
  onClose,
  saleTotal,
  suggestedDiscountPercent = 5,
  onApprove,
}: ApproveDiscountRequestModalProps) {
  const [mode, setMode] = useState<ApproveDiscountRequestMode>("pct");
  const maxAmount = useMemo(
    () => saleTotal * (MAX_SPECIAL_DISCOUNT_PCT / 100),
    [saleTotal]
  );

  const [discountPercent, setDiscountPercent] = useState(() =>
    snapToNearestMark(suggestedDiscountPercent)
  );
  const [percentInputDraft, setPercentInputDraft] = useState(() =>
    String(snapToNearestMark(suggestedDiscountPercent))
  );

  const [discountAmount, setDiscountAmount] = useState(() => maxAmount);
  const [amountInputDraft, setAmountInputDraft] = useState(() =>
    maxAmount.toFixed(2)
  );

  const discountedTotal = useMemo(() => {
    if (mode === "amount") {
      return saleTotal - discountAmount;
    }
    return saleTotal * (1 - discountPercent / 100);
  }, [mode, saleTotal, discountPercent, discountAmount]);

  const handleModeChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, value: ApproveDiscountRequestMode | null) => {
      if (value) setMode(value);
    },
    []
  );

  const handleAmountInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setAmountInputDraft(event.target.value.replace(/[^\d.]/g, ""));
    },
    []
  );

  const handleAmountInputBlur = useCallback(() => {
    const parsed = Number.parseFloat(amountInputDraft);
    if (Number.isNaN(parsed)) {
      setAmountInputDraft(discountAmount.toFixed(2));
      return;
    }
    const clamped = Math.min(Math.max(parsed, 0), maxAmount);
    setDiscountAmount(clamped);
    setAmountInputDraft(clamped.toFixed(2));
  }, [amountInputDraft, discountAmount, maxAmount]);

  const syncPercentFromNumber = useCallback((value: number) => {
    const snapped = snapToNearestMark(value);
    setDiscountPercent(snapped);
    setPercentInputDraft(String(snapped));
  }, []);

  const handleSliderChange = useCallback(
    (_: Event, value: number | number[]) => {
      const next = Array.isArray(value) ? value[0] : value;
      syncPercentFromNumber(next);
    },
    [syncPercentFromNumber]
  );

  const handlePercentInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPercentInputDraft(event.target.value.replace(/[^\d]/g, ""));
  }, []);

  const handlePercentInputBlur = useCallback(() => {
    const parsed = Number.parseInt(percentInputDraft, 10);
    if (Number.isNaN(parsed)) {
      setPercentInputDraft(String(discountPercent));
      return;
    }
    const min = DISCOUNT_MARKS[0];
    const max = DISCOUNT_MARKS[DISCOUNT_MARKS.length - 1];
    syncPercentFromNumber(Math.min(Math.max(parsed, min), max));
  }, [percentInputDraft, discountPercent, syncPercentFromNumber]);

  const handleApproveClick = () => {
    if (mode === "amount") {
      onApprove?.({ mode: "amount", value: discountAmount });
    } else {
      onApprove?.({ mode: "pct", value: discountPercent });
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionProps={{
        onEnter: () => {
          const snapped = snapToNearestMark(suggestedDiscountPercent);
          setDiscountPercent(snapped);
          setPercentInputDraft(String(snapped));
          setMode("pct");
          setDiscountAmount(maxAmount);
          setAmountInputDraft(maxAmount.toFixed(2));
        },
      }}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-container": {
          alignItems: "flex-start",
          justifyContent: "flex-end",
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: "12px",
          overflow: "hidden",
          m: 0,
          mt: 2,
          mr: 2,
        },
      }}
    >
      <DialogContent sx={{ padding: "24px" }}>
        <Stack spacing={3}>
          <Stack spacing={0.5}>
            <Typography variant="h5" fontWeight={600}>Aprobar descuento especial</Typography>
            <Typography variant="body2" color="text.secondary">Selecciona el descuento a aplicar para esta venta.</Typography>
          </Stack>

          <ToggleButtonGroup
            value={mode}
            exclusive
            fullWidth
            size="small"
            onChange={handleModeChange}
            sx={{
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

          {mode === "pct" ? (
            <>
              <Grid container spacing={1} alignItems="center">
                <Grid size={{ xs: "grow" }}>
                  <Typography variant="body2" fontWeight={600}>Descuento aplicado:</Typography>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <FormTextField
                    size="small"
                    value={percentInputDraft}
                    onChange={handlePercentInputChange}
                    onBlur={handlePercentInputBlur}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>

              <TrackSlider
                value={discountPercent}
                onChange={handleSliderChange}
                min={DISCOUNT_MARKS[0]}
                max={DISCOUNT_MARKS[DISCOUNT_MARKS.length - 1]}
                marks={DISCOUNT_MARKS}
                getMarkLabel={(markValue) => (
                  <Typography
                    component="span"
                    variant="caption"
                    fontWeight={markValue === discountPercent ? 700 : 400}
                    color="text.secondary"
                  >
                    {markValue}%
                  </Typography>
                )}
              />
            </>
          ) : (
            <Grid container spacing={1} alignItems="center">
              <Grid size={{ xs: "grow" }}>
                <Typography variant="body2" fontWeight={600}>Monto de descuento:</Typography>
                <Typography variant="caption" color="text.secondary">
                  Máximo {formatCurrency(maxAmount)} ({MAX_SPECIAL_DISCOUNT_PCT}% del total)
                </Typography>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <FormTextField
                  size="small"
                  value={amountInputDraft}
                  onChange={handleAmountInputChange}
                  onBlur={handleAmountInputBlur}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
          )}

          <PriceComparisonPanel>
            <Stack spacing={0.5} flex={1}>
              <Typography variant="body2" color="text.secondary">Antes de descuento</Typography>
              <Typography variant="subtitle1" color="text.primary" fontWeight={600} style={{ textDecoration: "line-through" }}>
                {formatCurrency(saleTotal)}
              </Typography>
            </Stack>
            <ChevronRight size={24} color={theme.palette.text.secondary} />
            <Stack spacing={0.5} flex={1}>
              <Typography variant="body2" color="text.secondary" align="right">
                Con descuento
              </Typography>
              <Typography variant="subtitle1" color="text.primary" fontWeight={700} align="right">
                {formatCurrency(discountedTotal)}
              </Typography>
            </Stack>
          </PriceComparisonPanel>

          <Button variant="contained" color="primary" fullWidth onClick={handleApproveClick} sx={{ mt: 1 }}>
            {mode === "amount"
              ? `Aprobar descuento [${formatCurrency(discountAmount)}]`
              : `Aprobar descuento [${discountPercent}%]`}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
