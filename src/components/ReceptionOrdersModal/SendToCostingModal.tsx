import { useEffect, useState } from "react";
import { CircularProgress, Dialog } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import {
  StyledDialogContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalContent,
  DescriptionText,
  StatsContainer,
  StatRow,
  StatLabel,
  StatValue,
  MismatchBanner,
  MismatchText,
  ReasonTextField,
  ProgressBlock,
  ProgressHeader,
  ProgressLabel,
  ProgressPercent,
  PrintProgressBar,
  ModalActions,
  ConfirmButton,
  CancelButton,
} from "./SendToCostingModal.styles";

export type ReceptionConfirmVariant =
  | "save_labels"
  | "save_extra_labels"
  | "send_to_costing";

export interface SendToCostingModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void | Promise<void>;
  variant?: ReceptionConfirmVariant;
  totalArticles?: number;
  totalLabels?: number;
  extraLabels?: number;
  hasQuantityMismatch?: boolean;
  loading?: boolean;
  /** When set (0–100), shows print progress instead of action buttons. */
  printProgress?: number | null;
}

const VARIANT_COPY: Record<
  ReceptionConfirmVariant,
  { title: string; description: string; confirmLabel: string }
> = {
  save_labels: {
    title: "Guardar e imprimir etiquetas",
    description:
      "¿Estás seguro que deseas confirmar la cantidad de artículos recibidos? Una vez confirmados se imprimirán las etiquetas de control interno",
    confirmLabel: "Guardar e imprimir etiquetas",
  },
  save_extra_labels: {
    title: "Guardar e imprimir etiquetas adicionales",
    description:
      "¿Estás seguro que deseas confirmar la cantidad de artículos recibidos? Una vez confirmados se imprimirán las etiquetas extras que se han identificado.",
    confirmLabel: "Guardar e imprimir etiquetas",
  },
  send_to_costing: {
    title: "Enviar Recepción a Costeos",
    description:
      "¿Estás seguro que deseas confirmar esta acción? Una vez enviado ya no podrás hacer cambios",
    confirmLabel: "Enviar",
  },
};

export function SendToCostingModal({
  open,
  onClose,
  onConfirm,
  variant = "save_labels",
  totalArticles = 0,
  totalLabels = 0,
  extraLabels = 0,
  hasQuantityMismatch = false,
  loading = false,
  printProgress = null,
}: SendToCostingModalProps) {
  const [reason, setReason] = useState("");
  const copy = VARIANT_COPY[variant];
  const isPrinting = printProgress != null;
  const showMismatchReason = variant === "send_to_costing" && hasQuantityMismatch;
  const reasonRequired = showMismatchReason;
  const canConfirm = !reasonRequired || reason.trim().length > 0;
  const disableClose = loading || isPrinting;

  useEffect(() => {
    if (!open) {
      setReason("");
    }
  }, [open]);

  const handleClose = () => {
    if (!disableClose) {
      onClose();
    }
  };

  const handleDialogClose = (_event: object, reason: string) => {
    if (disableClose) return;
    if (reason === "backdropClick") return;
    onClose();
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    await onConfirm(showMismatchReason ? reason.trim() : undefined);
  };

  const showStats =
    variant === "save_labels" || variant === "save_extra_labels";

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="xs"
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
          <ModalTitle>{copy.title}</ModalTitle>
          <CloseButton
            onClick={handleClose}
            disabled={disableClose}
            size="small"
            aria-label="Cerrar"
          >
            <CloseIcon fontSize="small" />
          </CloseButton>
        </ModalHeader>

        <ModalContent>
          <DescriptionText>{copy.description}</DescriptionText>

          {showMismatchReason && (
            <MismatchBanner>
              <MismatchText>
                La cantidad de artículos recibida no coincide con la cantidad
                inicial de los pedidos, describe la razón por la que esto sucedió
              </MismatchText>
              <ReasonTextField
                placeholder="Ingresa aquí"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                multiline
                minRows={3}
                fullWidth
                disabled={disableClose}
              />
            </MismatchBanner>
          )}

          {showStats && !isPrinting && (
            <StatsContainer>
              <StatRow>
                <StatLabel>Total de artículos:</StatLabel>
                <StatValue>{totalArticles}</StatValue>
              </StatRow>
              {variant === "save_extra_labels" ? (
                <StatRow>
                  <StatLabel>Etiquetas extra a imprimir:</StatLabel>
                  <StatValue>{extraLabels}</StatValue>
                </StatRow>
              ) : (
                <StatRow>
                  <StatLabel>Etiquetas a imprimir:</StatLabel>
                  <StatValue>{totalLabels}</StatValue>
                </StatRow>
              )}
            </StatsContainer>
          )}

          {isPrinting && (
            <ProgressBlock>
              <ProgressHeader>
                <ProgressLabel>Imprimiendo etiquetas</ProgressLabel>
                <ProgressPercent>{Math.round(printProgress)}%</ProgressPercent>
              </ProgressHeader>
              <PrintProgressBar variant="determinate" value={printProgress} />
            </ProgressBlock>
          )}

          {!isPrinting && (
            <ModalActions>
              <ConfirmButton
                type="button"
                variant="contained"
                color="primary"
                onClick={handleConfirm}
                disabled={loading || !canConfirm}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  copy.confirmLabel
                )}
              </ConfirmButton>
              <CancelButton
                type="button"
                variant="outlined"
                color="primary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </CancelButton>
            </ModalActions>
          )}
        </ModalContent>
      </StyledDialogContent>
    </Dialog>
  );
}
