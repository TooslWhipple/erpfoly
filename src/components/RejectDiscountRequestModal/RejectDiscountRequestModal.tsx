import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Stack,
  Button,
} from "@mui/material";
import { FormTextField } from "@/components/Form";

export interface RejectDiscountRequestModalProps {
  open: boolean;
  onClose: () => void;
  onReject?: (reason: string) => void;
}

export function RejectDiscountRequestModal({
  open,
  onClose,
  onReject,
}: RejectDiscountRequestModalProps) {
  const [reason, setReason] = useState("");

  const handleReasonChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setReason(event.target.value);
  }, []);

  const handleConfirmReject = () => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    onReject?.(trimmed);
    onClose();
  };

  const isReasonValid = reason.trim().length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionProps={{
        onEnter: () => {
          setReason("");
        },
      }}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          overflow: "hidden",
        },
      }}
    >
      <DialogContent sx={{ padding: "24px" }}>
        <Stack spacing={2.5}>
          <Stack spacing={0.5}>
            <Typography variant="h5" fontWeight={600}>
              Rechazar solicitud
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ingresa un motivo de rechazo para esta solicitud de descuento especial.
            </Typography>
          </Stack>
          <FormTextField
            multiline
            minRows={4}
            fullWidth
            placeholder="Ingresar motivo aquí..."
            value={reason}
            onChange={handleReasonChange}
          />
          <Button
            variant="contained"
            color="error"
            sx={{ width: "fit-content", minWidth: 208 }}
            disabled={!isReasonValid}
            onClick={handleConfirmReject}
          >
            Rechazar solicitud
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
