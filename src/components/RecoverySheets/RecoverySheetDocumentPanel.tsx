import { Button, Typography } from "@mui/material";
import {
  DocumentPanel,
  DocumentPreview,
  DocumentPreviewLine,
  DocumentPreviewLines,
} from "./styles";

export interface RecoverySheetDocumentPanelProps {
  onDownload: () => void;
  disabled?: boolean;
}

export function RecoverySheetDocumentPanel({
  onDownload,
  disabled = false,
}: RecoverySheetDocumentPanelProps) {
  return (
    <DocumentPanel>
      <DocumentPreview aria-hidden>
        <DocumentPreviewLines>
          <DocumentPreviewLine style={{ width: "38%" }} />
          <DocumentPreviewLine style={{ width: "62%" }} />
          <DocumentPreviewLine style={{ width: "48%" }} />
          <DocumentPreviewLine
            style={{ width: "92%", marginTop: 12, height: 56 }}
          />
          <DocumentPreviewLine style={{ width: "76%" }} />
          <DocumentPreviewLine style={{ width: "34%" }} />
        </DocumentPreviewLines>
      </DocumentPreview>

      <Typography variant="body1" fontWeight={600} textAlign="center">
        Hoja de recuperación
      </Typography>

      <Button
        variant="outlined"
        color="primary"
        fullWidth
        onClick={onDownload}
        disabled={disabled}
        sx={{
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 2,
          py: 1.1,
        }}
      >
        Descargar
      </Button>
    </DocumentPanel>
  );
}
