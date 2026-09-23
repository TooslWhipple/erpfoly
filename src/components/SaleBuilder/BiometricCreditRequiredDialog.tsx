import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

interface BiometricCreditRequiredDialogProps {
  open: boolean;
  onClose: () => void;
  onGoToProfile: () => void;
}

export function BiometricCreditRequiredDialog({
  open,
  onClose,
  onGoToProfile,
}: BiometricCreditRequiredDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Biometría pendiente</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          El cliente requiere actualización biométrica para compras a crédito
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cerrar
        </Button>
        <Button variant="contained" onClick={onGoToProfile}>
          Ir al perfil del cliente
        </Button>
      </DialogActions>
    </Dialog>
  );
}
