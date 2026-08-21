import { useState } from "react";
import { Checkbox, Dialog, FormControlLabel, Link } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import type { PrinterProfile } from "@/lib/printing";
import { RT425TT_PROFILE } from "@/lib/printing";
import {
  StyledDialogContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalContent,
  DescriptionText,
  StepsList,
  StepItem,
  ModalActions,
  ConfirmButton,
  CancelButton,
} from "./PrinterSetupDialog.styles";

export interface PrinterSetupDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  printerProfile?: PrinterProfile;
}

export function PrinterSetupDialog({
  open,
  onClose,
  onConfirm,
  printerProfile = RT425TT_PROFILE,
}: PrinterSetupDialogProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  const handleClose = () => {
    setAcknowledged(false);
    onClose();
  };

  const handleConfirm = () => {
    if (!acknowledged) return;
    onConfirm();
    setAcknowledged(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      <StyledDialogContent>
        <ModalHeader>
          <ModalTitle>Configurar impresora de etiquetas</ModalTitle>
          <CloseButton onClick={handleClose} size="small" aria-label="Cerrar">
            <CloseIcon fontSize="small" />
          </CloseButton>
        </ModalHeader>

        <ModalContent>
          <DescriptionText>
            Las etiquetas se imprimirán en la {printerProfile.displayName}. El
            navegador abrirá el diálogo de impresión; selecciona esta impresora
            y el tamaño de papel {printerProfile.widthMm}×
            {printerProfile.heightMm} mm.
          </DescriptionText>

          <StepsList>
            <StepItem>
              Instala el driver {printerProfile.driverName} en Windows.
            </StepItem>
            <StepItem>
              Configura un papel personalizado de {printerProfile.widthMm} mm ×{" "}
              {printerProfile.heightMm} mm ({printerProfile.dpi} DPI).
            </StepItem>
            <StepItem>
              Consulta la{" "}
              <Link
                href={printerProfile.setupGuideUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                guía de instalación Ribetec
              </Link>
              .
            </StepItem>
          </StepsList>

          <FormControlLabel
            control={
              <Checkbox
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.target.checked)}
              />
            }
            label="Confirmo que la impresora está instalada y configurada"
          />

          <ModalActions>
            <ConfirmButton
              type="button"
              variant="contained"
              color="primary"
              onClick={handleConfirm}
              disabled={!acknowledged}
            >
              Continuar
            </ConfirmButton>
            <CancelButton
              type="button"
              variant="outlined"
              color="primary"
              onClick={handleClose}
            >
              Cancelar
            </CancelButton>
          </ModalActions>
        </ModalContent>
      </StyledDialogContent>
    </Dialog>
  );
}
