import { Button } from "@mui/material";
import { FileUpload } from "@/components/FileUpload";
import type { CreditApplicationDocumentFile } from "@/types/credit-application-form.types";
import type { UploadedFileItem } from "@/components/FileUpload";
import { Card } from "./styles";

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
