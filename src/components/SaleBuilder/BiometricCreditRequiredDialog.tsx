import { Button, Dialog, Stack } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { AlertTriangle } from "lucide-react";
import {
  CloseButton,
  DialogContent,
  IconBadge,
  ModalDescription,
  ModalHeader,
  ModalHeaderContent,
  ModalTextBlock,
  ModalTitle,
} from "@/components/ConfirmModal/styles";

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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogContent>
        <ModalHeader>
          <ModalHeaderContent>
            <IconBadge modalType="warning">
              <AlertTriangle size={22} aria-hidden />
            </IconBadge>
            <ModalTextBlock>
              <ModalTitle>Biometría pendiente</ModalTitle>
              <ModalDescription>
                El cliente no tiene biometría registrada. Captúrala ahora en su
                perfil, o registra la venta pero necesitarás la autorización de un supervisor.
              </ModalDescription>
            </ModalTextBlock>
          </ModalHeaderContent>
          <CloseButton onClick={onClose} size="small" aria-label="Cerrar">
            <CloseIcon fontSize="small" />
          </CloseButton>
        </ModalHeader>

        <Stack spacing={1.25}>
          <Button variant="contained" onClick={onGoToProfile} fullWidth>
            Capturar ahora
          </Button>
          <Button color="inherit" onClick={onClose} fullWidth>
            Continuar
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
