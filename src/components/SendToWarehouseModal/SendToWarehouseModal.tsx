import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Stack,
  Button,
  CircularProgress,
} from "@mui/material";
import { updateOrderStatus } from "@/services/orders.service";

export interface SendToWarehouseModalProps {
  open: boolean;
  onClose: () => void;
  orderId: number;
  onSuccess?: () => void;
}

export function SendToWarehouseModal({
  open,
  onClose,
  orderId,
  onSuccess,
}: SendToWarehouseModalProps) {
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setSubmitting(false);
  }, [open, orderId]);

  const handleDialogClose = useCallback(() => {
    if (submitting) {
      return;
    }
    onClose();
  }, [onClose, submitting]);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await updateOrderStatus(orderId, "partially_delivered");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("[SendToWarehouseModal] Error sending to warehouse:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="xs"
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
        <Stack spacing={2.5}>
          <Stack spacing={0.5}>
            <Typography variant="h5" fontWeight={600}>
              Enviar pedido a Almacén
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Al realizar esta acción los artículos ahora serán gestionados por el área de Recepción de Mercancía.
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              sx={{ width: "208px" }}
              onClick={() => void handleConfirm()}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress color="inherit" size={18} /> : undefined}
            >
              {submitting ? "Enviando..." : "Enviar"}
            </Button>
            <Button
              variant="white"
              onClick={handleDialogClose}
              disabled={submitting}
            >
              Cancelar
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
