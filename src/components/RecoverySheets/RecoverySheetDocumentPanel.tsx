import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import { Download, Printer } from "lucide-react";
import { fetchRecoverySheetPdf } from "@/services/recovery-sheets.service";
import { formatDateOnly } from "@/utils/date";
import {
  DocumentActionsRow,
  DocumentPanel,
  DocumentPanelHeader,
  DocumentPanelPadded,
  DocumentPreview,
  DocumentPreviewSheet,
  printIconButtonSx,
} from "./styles";

export interface RecoverySheetDocumentPanelProps {
  sheetId: string;
  folio: string;
  createdAt: string;
  onDownload: () => void;
  onPrint: () => void;
  disabled?: boolean;
  isPrinting?: boolean;
}

export function RecoverySheetDocumentPanel({
  sheetId,
  folio,
  createdAt,
  onDownload,
  onPrint,
  disabled = false,
  isPrinting = false,
}: RecoverySheetDocumentPanelProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const pdfQuery = useQuery({
    queryKey: ["recovery-sheet-pdf", sheetId],
    queryFn: () => fetchRecoverySheetPdf(sheetId),
    enabled: Boolean(sheetId),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (!pdfQuery.data?.blob) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pdfQuery.data.blob);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [pdfQuery.data?.blob]);

  return (
    <DocumentPanel>
      <DocumentPanelPadded>
        <DocumentPanelHeader>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Documento
          </Typography>
          <Typography
            component="span"
            variant="caption"
            fontWeight={700}
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 1,
              bgcolor: "app.background.lowerGray",
              color: "text.secondary",
              letterSpacing: 0.4,
            }}
          >
            PDF
          </Typography>
        </DocumentPanelHeader>
      </DocumentPanelPadded>

      <DocumentPreview>
        {pdfQuery.isLoading ? (
          <CircularProgress size={28} aria-label="Cargando vista previa" />
        ) : pdfQuery.isError || !previewUrl ? (
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ px: 2 }}
          >
            {pdfQuery.isError
              ? "No se pudo cargar la vista previa."
              : "Vista previa no disponible."}
          </Typography>
        ) : (
          <DocumentPreviewSheet>
            <object
              data={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
              type="application/pdf"
              aria-label="Vista previa de la hoja de recuperación"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                display: "block",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ p: 2 }}
              >
                Tu navegador no puede mostrar este PDF aquí. Usa Descargar.
              </Typography>
            </object>
          </DocumentPreviewSheet>
        )}
      </DocumentPreview>

      <DocumentPanelPadded spacing={2}>
        <div>
          <Typography variant="body1" fontWeight={600} textAlign="center">
            Reporte de recuperación de mercancía
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center">
            Folio {folio} • {formatDateOnly(createdAt, "dateLong")}
          </Typography>
        </div>

        <DocumentActionsRow>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={onDownload}
            disabled={disabled}
            startIcon={<Download size={16} />}>
            Descargar
          </Button>
          <IconButton
            onClick={onPrint}
            disabled={disabled || isPrinting}
            sx={printIconButtonSx}>
            {(isPrinting) ? <CircularProgress size={18} /> : <Printer size={18} />}
          </IconButton>
        </DocumentActionsRow>
      </DocumentPanelPadded>
    </DocumentPanel>
  );
}
