import { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Stack,
  Button,
  Slider,
  InputAdornment,
  Grid,
} from "@mui/material";
import { FormTextField } from "@/components/Form";
import { colors } from "@/styles/theme";
import { PriceComparisonPanel } from "./styles";
import { ChevronRight } from "lucide-react";

const DISCOUNT_MARKS = [2, 5, 10, 15, 20, 25, 30, 35, 40] as const;

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
  onApprove?: (approvedDiscountPercent: number) => void;
}

export function ApproveDiscountRequestModal({
  open,
  onClose,
  saleTotal,
  suggestedDiscountPercent = 5,
  onApprove,
}: ApproveDiscountRequestModalProps) {
  const [discountPercent, setDiscountPercent] = useState(() =>
    snapToNearestMark(suggestedDiscountPercent)
  );
  const [percentInputDraft, setPercentInputDraft] = useState(() =>
    String(snapToNearestMark(suggestedDiscountPercent))
  );

  const discountedTotal = useMemo(
    () => saleTotal * (1 - discountPercent / 100),
    [saleTotal, discountPercent]
  );

  const sliderMarks = useMemo(
    () =>
      DISCOUNT_MARKS.map((value) => ({
        value,
        label: (
          <Typography
            component="span"
            variant="caption"
            fontWeight={value === discountPercent ? 700 : 400}
            color="text.secondary"
          >
            {value}%
          </Typography>
        ),
      })),
    [discountPercent]
  );

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
    onApprove?.(discountPercent);
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
        },
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          overflow: "hidden",
        },
      }}
    >
      <DialogContent sx={{ padding: "24px" }}>
        <Stack spacing={3}>
          <Stack spacing={0.5}>
            <Typography variant="h5" fontWeight={600}>Aprobar descuento especial</Typography>
            <Typography variant="body2" color="text.secondary">Selecciona el descuento a aplicar para esta venta.</Typography>
          </Stack>

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

          <div style={{ display: "block" }}>
            <Slider
              value={discountPercent}
              onChange={handleSliderChange}
              min={DISCOUNT_MARKS[0]}
              max={DISCOUNT_MARKS[DISCOUNT_MARKS.length - 1]}
              step={null}
              marks={sliderMarks}
              valueLabelDisplay="off"
              sx={{
                color: colors.sidebar.textSelected,
              }}
            />
          </div>

          <PriceComparisonPanel>
            <Stack spacing={0.5} flex={1}>
              <Typography variant="body2" color="text.secondary">Antes de descuento</Typography>
              <Typography variant="subtitle1" color="text.primary" fontWeight={600} style={{ textDecoration: "line-through" }}>
                {formatCurrency(saleTotal)}
              </Typography>
            </Stack>
            <ChevronRight size={24} color={colors.text.secondary} />
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
            Aprobar descuento [{discountPercent}%]
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
