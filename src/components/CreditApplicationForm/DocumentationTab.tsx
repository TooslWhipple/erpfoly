import { Button, Grid, Stack, Typography } from "@mui/material";
import { CircleAlert } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import type { CreditApplicationDocumentFile } from "@/types/credit-application-form.types";
import type { UploadedFileItem } from "@/components/FileUpload";
import { Card, DocumentationAlert } from "./styles";

interface DocumentationTabProps {
  values: {
    requiredAlertVisible: boolean;
    requiredAlertMessage: string;
    incomeProofFiles: CreditApplicationDocumentFile[];
    ineFrontFiles: CreditApplicationDocumentFile[];
    ineBackFiles: CreditApplicationDocumentFile[];
  };
  onIncomeProofChange: (files: CreditApplicationDocumentFile[]) => void;
  onIneFrontChange: (files: CreditApplicationDocumentFile[]) => void;
  onIneBackChange: (files: CreditApplicationDocumentFile[]) => void;
  onSave: () => Promise<boolean>;
}

export function DocumentationTab({
  values,
  onIncomeProofChange,
  onIneFrontChange,
  onIneBackChange,
  onSave,
}: DocumentationTabProps) {
  const mapStoredToUploadItems = (files: CreditApplicationDocumentFile[]): UploadedFileItem[] =>
    files.map((file) => ({
      id: file.id,
      name: file.name,
      file: file.file,
      url: file.url,
      uploadedAt: file.uploadedAt,
    }));

  const mapUploadToStoredItems = (files: UploadedFileItem[]): CreditApplicationDocumentFile[] =>
    files.map((file) => ({
      id: file.id,
      name: file.name,
      file: file.file,
      url: file.url,
      uploadedAt: file.uploadedAt,
    }));

  return (
    <Card>
      {
        values.requiredAlertVisible &&
        <DocumentationAlert>
          <CircleAlert size={18} color="#DC2626" />
          <Stack spacing={0.5}>
            <Typography variant="subtitle1">Documentación adicional requerida</Typography>
            <Typography variant="body2" color="text.secondary">{values.requiredAlertMessage}</Typography>
          </Stack>
        </DocumentationAlert>
      }

      <FileUpload
        value={mapStoredToUploadItems(values.incomeProofFiles)}
        onChange={(files) => onIncomeProofChange(mapUploadToStoredItems(files))}
        placeholder="Comprobante de Ingresos"
        accept={["image/*", "image/jpeg", "image/png", "image/webp"]}
      />
      <FileUpload
        value={mapStoredToUploadItems(values.ineFrontFiles)}
        onChange={(files) => onIneFrontChange(mapUploadToStoredItems(files))}
        placeholder="INE frontal"
        accept={["image/*", "image/jpeg", "image/png", "image/webp"]}
      />
      <FileUpload
        value={mapStoredToUploadItems(values.ineBackFiles)}
        onChange={(files) => onIneBackChange(mapUploadToStoredItems(files))}
        placeholder="INE posterior"
        accept={["image/*", "image/jpeg", "image/png", "image/webp"]}
      />

      <Button
        variant="contained"
        sx={{ alignSelf: "flex-start" }}
        onClick={onSave}>
        Guardar
      </Button>
    </Card>
  );
}
