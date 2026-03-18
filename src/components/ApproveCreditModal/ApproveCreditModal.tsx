import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Stack,
  Button,
  Slider,
  InputAdornment,
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
  const marks: { value: number; label: string }[] = [
    { value: minAmount, label: formatCurrency(minAmount) },
    { value: maxAmount, label: formatCurrency(maxAmount) },
  ];
  if (midValue > minAmount && midValue < maxAmount) {
    marks.splice(1, 0, { value: midValue, label: formatCurrency(midValue) });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
        },
      }}
    >
      <DialogContent sx={{ padding: 3 }}>
        <Stack spacing={2.5}>
          <Typography variant="h6" fontWeight={600}>
            Aprobar solicitud
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Al realizar esta acción se creará un perfil y se abrirá una nueva
            línea de crédito para este cliente.
          </Typography>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              backgroundColor: colors.chip.variants.success.background,
              borderRadius: 8,
            }}
          >
            <Typography variant="body2" fontWeight={500}>
              Monto sugerido:
            </Typography>
            <Typography variant="body2" fontWeight={600} color="success.dark">
              ${formatCurrency(suggestedAmount)}
            </Typography>
          </div>

          <div>
            <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
              Línea de crédito:
            </Typography>
            <Stack sx={{ mb: 1 }}>
              <FormTextField
                value={formatCurrency(creditLine)}
                disabled
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
            </Stack>
            <Slider
              value={creditLine}
              onChange={handleSliderChange}
              min={minAmount}
              max={maxAmount}
              step={500}
              valueLabelDisplay="off"
              marks={marks}
              sx={{
                color: colors.sidebar.textSelected,
                "& .MuiSlider-markLabel": {
                  fontSize: 12,
                },
              }}
            />
          </div>

          <Button
            variant="contained"
            fullWidth
            onClick={handleApproveClick}
            sx={{ mt: 1 }}
          >
            Aprobar solicitud
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
