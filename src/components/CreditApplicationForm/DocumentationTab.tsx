import { Button, CircularProgress } from "@mui/material";
import { FileUpload } from "@/components/FileUpload";
import type { CreditApplicationDocumentFile } from "@/types/credit-application-form.types";
import type { UploadedFileItem } from "@/components/FileUpload";
import { Card } from "./styles";

interface DocumentationTabProps {
  values: {
    requiredAlertVisible: boolean;
    requiredAlertMessage: string;
    incomeProofFiles: CreditApplicationDocumentFile[];
    employmentProofLetterFiles: CreditApplicationDocumentFile[];
    ineFrontFiles: CreditApplicationDocumentFile[];
    ineBackFiles: CreditApplicationDocumentFile[];
  };
  showIncomeProof: boolean;
  showEmploymentProofLetter: boolean;
  requireIncomeProof: boolean;
  requireEmploymentProofLetter: boolean;
  onIncomeProofChange: (files: CreditApplicationDocumentFile[]) => void;
  onEmploymentProofLetterChange: (files: CreditApplicationDocumentFile[]) => void;
  onIneFrontChange: (files: CreditApplicationDocumentFile[]) => void;
  onIneBackChange: (files: CreditApplicationDocumentFile[]) => void;
  onSave: () => Promise<boolean>;
  saving: boolean;
}

export function DocumentationTab({
  values,
  showIncomeProof,
  showEmploymentProofLetter,
  requireIncomeProof,
  requireEmploymentProofLetter,
  onIncomeProofChange,
  onEmploymentProofLetterChange,
  onIneFrontChange,
  onIneBackChange,
  onSave,
  saving,
}: DocumentationTabProps) {
  const requiredErrorMessage = "Documento obligatorio.";
  const incomeProofRequiredAndMissing = requireIncomeProof && values.incomeProofFiles.length === 0;
  const employmentProofLetterRequiredAndMissing =
    requireEmploymentProofLetter && values.employmentProofLetterFiles.length === 0;
  const ineFrontRequiredAndMissing = values.ineFrontFiles.length === 0;
  const ineBackRequiredAndMissing = values.ineBackFiles.length === 0;

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
      {showIncomeProof && (
        <FileUpload
          value={mapStoredToUploadItems(values.incomeProofFiles)}
          onChange={(files) => onIncomeProofChange(mapUploadToStoredItems(files))}
          placeholder="Comprobante de ingresos"
          fileLabel="Comprobante de ingresos"
          disabled={saving}
          accept={["image/*", "image/jpeg", "image/png", "image/webp", "application/pdf"]}
          error={incomeProofRequiredAndMissing ? requiredErrorMessage : undefined}
        />
      )}
      {showEmploymentProofLetter && (
        <FileUpload
          value={mapStoredToUploadItems(values.employmentProofLetterFiles)}
          onChange={(files) => onEmploymentProofLetterChange(mapUploadToStoredItems(files))}
          placeholder="Carta de comprobante laboral"
          fileLabel="Carta de comprobante laboral"
          disabled={saving}
          accept={["image/*", "image/jpeg", "image/png", "image/webp", "application/pdf"]}
          error={employmentProofLetterRequiredAndMissing ? requiredErrorMessage : undefined}
        />
      )}
      <FileUpload
        value={mapStoredToUploadItems(values.ineFrontFiles)}
        onChange={(files) => onIneFrontChange(mapUploadToStoredItems(files))}
        placeholder="INE frontal"
        fileLabel="INE frontal"
        disabled={saving}
        accept={["image/*", "image/jpeg", "image/png", "image/webp"]}
        error={ineFrontRequiredAndMissing ? requiredErrorMessage : undefined}
      />
      <FileUpload
        value={mapStoredToUploadItems(values.ineBackFiles)}
        onChange={(files) => onIneBackChange(mapUploadToStoredItems(files))}
        placeholder="INE posterior"
        fileLabel="INE posterior"
        disabled={saving}
        accept={["image/*", "image/jpeg", "image/png", "image/webp"]}
        error={ineBackRequiredAndMissing ? requiredErrorMessage : undefined}
      />

      <Button
        variant="contained"
        sx={{ alignSelf: "flex-start" }}
        onClick={onSave}
        disabled={saving}>
        {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
      </Button>
    </Card>
  );
}
