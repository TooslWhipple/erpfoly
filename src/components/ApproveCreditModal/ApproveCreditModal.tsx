import { useState, useCallback, useEffect } from "react";
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

export interface ApproveCreditModalProps {
  open: boolean;
  onClose: () => void;
  suggestedAmount: number;
  minAmount: number;
  maxAmount: number;
  onApprove?: (approvedAmount: number) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function ApproveCreditModal({
  open,
  onClose,
  suggestedAmount,
  minAmount,
  maxAmount,
  onApprove,
}: ApproveCreditModalProps) {
  const [creditLine, setCreditLine] = useState(suggestedAmount);

  useEffect(() => {
    if (open) {
      setCreditLine(suggestedAmount);
    }
  }, [open, suggestedAmount]);

  const handleSliderChange = useCallback(
    (_: Event, value: number | number[]) => {
      setCreditLine(Array.isArray(value) ? value[0] : value);
    },
    []
  );

  const handleApproveClick = () => {
    onApprove?.(creditLine);
    onClose();
  };

  const midValue = Math.round((minAmount + maxAmount) / 2);
  const hasMidMark = midValue > minAmount && midValue < maxAmount;
  const range = maxAmount - minAmount;
  const midLabelLeftPercent =
    range > 0 ? ((midValue - minAmount) / range) * 100 : 50;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          overflow: "hidden",
        },
      }}
    >
      <DialogContent
        style={{ padding: "24px" }}>
        <Stack spacing={2.5}>
          <Stack spacing={0.5}>
            <Typography variant="h5" fontWeight={600}>Aprobar solicitud</Typography>
            <Typography variant="body2" color="text.secondary">Al realizar esta acción se creará un perfil y se abrirá una nueva línea de crédito para este cliente.</Typography>
          </Stack>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px",
              backgroundColor: "#DCFCE7",
              borderRadius: "12px",
            }}
          >
            <Typography variant="body2" fontWeight={500}>Monto sugerido:</Typography>
            <Typography variant="body2" fontWeight={500} color="success">${formatCurrency(suggestedAmount)}</Typography>
          </div>

          <Grid container spacing={1} alignItems="center">
            <Grid size={{ xs: 'grow' }}>
              <Typography variant="body2" fontWeight={500} flex={1}>Línea de crédito:</Typography>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <FormTextField
                value={formatCurrency(creditLine)}
                disabled
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
          <Stack spacing={1}>
            <Slider
              value={creditLine}
              onChange={handleSliderChange}
              min={minAmount}
              max={maxAmount}
              step={500}
              valueLabelDisplay="off"
              sx={{
                color: colors.sidebar.textSelected,
              }}
            />
            <Stack
              direction="row"
              sx={{
                position: "relative",
                width: "100%",
                mt: 0.5,
                alignItems: "flex-start",
                minHeight: 18,
              }}
            >
              <Typography variant="body1" color="text.secondary" sx={{ flex: "1 1 0", textAlign: "left" }}>${formatCurrency(minAmount)}</Typography>
              {
                hasMidMark &&
                <Typography variant="body1" sx={{ position: "absolute", left: `${midLabelLeftPercent}%`, transform: "translateX(-50%)" }}>${formatCurrency(midValue)}</Typography>
              }
              <Typography variant="body1" color="text.secondary" sx={{ flex: "1 1 0", textAlign: "right" }}>${formatCurrency(maxAmount)}</Typography>
            </Stack>
          </Stack>

          <Button
            variant="contained"
            fullWidth
            onClick={handleApproveClick}
            sx={{ mt: 1 }}
          >
            Aprobar solicitud
          </Button>
        </Stack>
      </DialogContent >
    </Dialog >
  );
}
