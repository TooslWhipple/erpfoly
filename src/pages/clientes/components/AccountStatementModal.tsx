import { useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  Stack,
  Typography,
} from "@mui/material";
import {
  Download,
  MessageCircle,
  Printer,
  FileText,
  X as CloseIcon,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  DialogContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  CloseButton,
} from "@/components/ModalForm/styles";
import {
  getClientAccountStatementPdf,
  sendClientAccountStatementWhatsapp,
} from "@/services/clients.service";
import { getApiErrorMessage, unwrapOrThrow } from "@/lib/axios";
import { downloadBlob, printPdfBlob } from "@/lib/printing/print-pdf";
import { useSnackbarStore } from "@/store/useSnackbarStore";

export interface AccountStatementModalProps {
  open: boolean;
  clientId: number;
  onClose: () => void;
}

type PdfAction = "print" | "download" | null;

function buildFilename(clientId: number): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `estado-de-cuenta-${clientId}-${stamp}.pdf`;
}

export function AccountStatementModal({
  open,
  clientId,
  onClose,
}: AccountStatementModalProps) {
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const showError = useSnackbarStore((state) => state.showError);
  const [pdfAction, setPdfAction] = useState<PdfAction>(null);

  const whatsappMutation = useMutation({
    mutationFn: async () => {
      const result = await sendClientAccountStatementWhatsapp(clientId);
      return unwrapOrThrow(result);
    },
    onSuccess: (data) => {
      showSuccess(`Estado de cuenta enviado a ${data.sentTo}`);
      onClose();
    },
    onError: (error) => {
      showError(
        getApiErrorMessage(error) ||
          "No se pudo enviar por WhatsApp. Usa la impresión o descarga manual.",
      );
    },
  });

  const busy = pdfAction != null || whatsappMutation.isPending;

  const handlePdfAction = async (action: Exclude<PdfAction, null>) => {
    if (busy) return;
    setPdfAction(action);
    try {
      const blob = await getClientAccountStatementPdf(clientId);
      if (action === "print") {
        await printPdfBlob(blob);
      } else {
        downloadBlob(blob, buildFilename(clientId));
        showSuccess("Estado de cuenta descargado.");
      }
      onClose();
    } catch (error) {
      showError(
        getApiErrorMessage(error) ||
          "No se pudo generar el estado de cuenta. Intenta de nuevo.",
      );
    } finally {
      setPdfAction(null);
    }
  };

  const handleClose = () => {
    if (busy) return;
    onClose();
  };

  const loadingLabel = whatsappMutation.isPending
    ? "Enviando documento..."
    : pdfAction === "print"
      ? "Preparando impresión..."
      : pdfAction === "download"
        ? "Generando PDF..."
        : null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogContent>
        <ModalHeader>
          <Stack direction="row" spacing={1.5} alignItems="flex-start" flex={1}>
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: "grey.100",
                flexShrink: 0,
              }}
            >
              <FileText size={20} />
            </Stack>
            <Stack spacing={0.5} flex={1}>
              <ModalTitle>Estado de cuenta</ModalTitle>
              <ModalDescription>
                ¿Qué deseas hacer con el estado de cuenta?
              </ModalDescription>
            </Stack>
          </Stack>
          <CloseButton
            aria-label="Cerrar"
            onClick={handleClose}
            disabled={busy}
          >
            <CloseIcon size={18} />
          </CloseButton>
        </ModalHeader>

        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={
              pdfAction === "print" ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Printer size={18} />
              )
            }
            disabled={busy}
            onClick={() => {
              void handlePdfAction("print");
            }}
            sx={{ justifyContent: "flex-start", textTransform: "none", py: 1.25 }}
          >
            Imprimir
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={
              pdfAction === "download" ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Download size={18} />
              )
            }
            disabled={busy}
            onClick={() => {
              void handlePdfAction("download");
            }}
            sx={{ justifyContent: "flex-start", textTransform: "none", py: 1.25 }}
          >
            Descargar PDF
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={
              whatsappMutation.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <MessageCircle size={18} />
              )
            }
            disabled={busy}
            onClick={() => {
              whatsappMutation.mutate();
            }}
            sx={{ justifyContent: "flex-start", textTransform: "none", py: 1.25 }}
          >
            Enviar por WhatsApp
          </Button>
          {loadingLabel ? (
            <Typography variant="caption" color="text.secondary" textAlign="center">
              {loadingLabel}
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

const AccountStatementModalPage = () => null;

export default AccountStatementModalPage;
