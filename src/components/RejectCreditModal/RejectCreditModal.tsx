import {
  Dialog,
  DialogContent,
  Typography,
  Stack,
  Button,
} from "@mui/material";

export interface RejectCreditModalProps {
  open: boolean;
  onClose: () => void;
  cooldownMonths?: number;
  onReject?: () => void;
}

export function RejectCreditModal({
  open,
  onClose,
  cooldownMonths = 6,
  onReject,
}: RejectCreditModalProps) {
  const handleConfirmReject = () => {
    onReject?.();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
              Rechazar solicitud
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Al realizar esta acción, esta persona no podrá volver a realizar una nueva solicitud en{" "}
              {cooldownMonths} meses.
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.primary">
            ¿Estás seguro que deseas realizar esta acción?
          </Typography>
          <Button
            variant="contained"
            color="error"
            sx={{ width: "208px" }}
            onClick={handleConfirmReject}>
            Sí, rechazar solicitud
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
