import { useState } from "react";
import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { getApiErrorMessage } from "@/lib/axios";
import { printTransferDocument } from "@/services/transfers.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type { TransferDetail, TransferDocumentKind } from "@/types/transfers.types";
import { getTransferButtons, type TransferViewer } from "@/utils/transfers";
import type { TransferDialog } from "./TransferDialogs";

export interface TransferActionsProps {
  detail: TransferDetail;
  viewer: TransferViewer;
  onOpenDialog: (dialog: TransferDialog) => void;
}

const DOCUMENT_BUTTONS: Array<{ kind: TransferDocumentKind; label: string }> = [
  { kind: "salida", label: "Imprimir salida" },
  { kind: "entrada", label: "Imprimir entrada" },
];

/** Botones de acción del traspaso: salen de `allowed_actions` y del permiso del usuario. */
export function TransferActions({ detail, viewer, onOpenDialog }: TransferActionsProps) {
  const { showError } = useSnackbarStore();
  const [printing, setPrinting] = useState<TransferDocumentKind | null>(null);
  const buttons = getTransferButtons(detail, viewer);

  const handlePrint = async (kind: TransferDocumentKind) => {
    setPrinting(kind);
    try {
      await printTransferDocument(detail.id, kind);
    } catch (err) {
      showError(getApiErrorMessage(err));
    } finally {
      setPrinting(null);
    }
  };

  return (
    <Stack spacing={1} alignItems={{ xs: "stretch", sm: "flex-end" }}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {buttons.ship && (
          <Button variant="contained" onClick={() => onOpenDialog({ kind: "ship" })}>
            Enviar
          </Button>
        )}
        {buttons.receive && (
          <Button variant="contained" onClick={() => onOpenDialog({ kind: "receive" })}>
            Confirmar recepción
          </Button>
        )}
        {buttons.reportIncident && (
          <Button variant="outlined" onClick={() => onOpenDialog({ kind: "report_incident" })}>
            Reportar diferencia
          </Button>
        )}
        {buttons.returnToOrigin && (
          <Button variant="outlined" color="error" onClick={() => onOpenDialog({ kind: "return_to_origin" })}>
            Regresar al origen
          </Button>
        )}
        {buttons.cancel && (
          <Button variant="outlined" color="error" onClick={() => onOpenDialog({ kind: "cancel" })}>
            Cancelar
          </Button>
        )}
        {buttons.print &&
          DOCUMENT_BUTTONS.map(({ kind, label }) => (
            <Button
              key={kind}
              variant="outlined"
              onClick={() => handlePrint(kind)}
              disabled={printing !== null}
            >
              {printing === kind ? <CircularProgress size={20} color="inherit" /> : label}
            </Button>
          ))}
      </Stack>
      {buttons.linkedCancelNote && detail.sale && (
        <Typography variant="caption" color="text.secondary">
          Se cancela al cancelar o regularizar la venta {detail.sale.folio}
        </Typography>
      )}
    </Stack>
  );
}
