import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Stack,
  Button,
  InputAdornment,
  Grid,
} from "@mui/material";
import { FormTextField } from "@/components/Form";
import { TrackSlider } from "@/components/TrackSlider";

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

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          <TrackSlider
            value={creditLine}
            onChange={handleSliderChange}
            min={minAmount}
            max={maxAmount}
            step={500}
            startLabel={
              <Typography variant="body1" color="text.secondary">
                ${formatCurrency(minAmount)}
              </Typography>
            }
            endLabel={
              <Typography variant="body1" color="text.secondary">
                ${formatCurrency(maxAmount)}
              </Typography>
            }
            middleLabel={
              hasMidMark
                ? {
                    value: midValue,
                    content: (
                      <Typography variant="body1">
                        ${formatCurrency(midValue)}
                      </Typography>
                    ),
                  }
                : undefined
            }
          />

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
