import { useCallback, useEffect, useId, useState } from "react";
import { Box, Button, CircularProgress, IconButton, Stack, Typography, useTheme } from "@mui/material";
import { Check, Trash2, Upload } from "lucide-react";
import { ImageViewerModal } from "@/components/ImageViewerModal";
import { DropZoneRoot } from "@/components/FileUpload/styles";
import type { CreditApplicationDocumentFile } from "@/types/credit-application-form.types";
import {
  isImageDocument,
  resolveDocumentPreviewUrl,
} from "@/utils/credit-application-documents";
import { VerifiedCheck, VerifiedRow, VerifiedThumb } from "@/styles/solicitudes-credito.styles";
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

interface DocumentSlotConfig {
  key: string;
  label: string;
  files: CreditApplicationDocumentFile[];
  onChange: (files: CreditApplicationDocumentFile[]) => void;
  visible: boolean;
  required: boolean;
  allowRemove: boolean;
  imageOnlySlot: boolean;
  accept: string[];
}

const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024;
const VERIFIED_BY_LABEL = "Verificado por el sistema";

function isAccepted(file: File, accept: string[]): boolean {
  const mime = file.type;
  for (const pattern of accept) {
    if (pattern.endsWith("/*")) {
      const [category] = pattern.split("/");
      if (mime.startsWith(`${category}/`)) return true;
    }
    if (pattern === mime) return true;
  }
  return false;
}

function useDocumentPreviewUrl(file: CreditApplicationDocumentFile | undefined): string | undefined {
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | undefined>();
  const remotePreviewUrl = resolveDocumentPreviewUrl(file);

  useEffect(() => {
    if (!file?.file) {
      setLocalPreviewUrl(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(file.file);
    setLocalPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file?.file, file?.id]);

  return remotePreviewUrl ?? localPreviewUrl;
}

interface DocumentationDocumentSlotProps {
  label: string;
  file?: CreditApplicationDocumentFile;
  required: boolean;
  allowRemove: boolean;
  imageOnlySlot: boolean;
  accept: string[];
  disabled: boolean;
  error?: string;
  onChange: (files: CreditApplicationDocumentFile[]) => void;
  onOpenPreview: (title: string, subtitle: string, url: string) => void;
}

function DocumentationDocumentSlot({
  label,
  file,
  required,
  allowRemove,
  imageOnlySlot,
  accept,
  disabled,
  error,
  onChange,
  onOpenPreview,
}: DocumentationDocumentSlotProps) {
  const theme = useTheme();
  const inputId = useId();
  const previewUrl = useDocumentPreviewUrl(file);
  const [isDragActive, setIsDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const displayError = error ?? validationError;
  const subtitle = file?.uploadedAt ?? VERIFIED_BY_LABEL;
  const showImagePreview = Boolean(file && previewUrl && isImageDocument(file, { imageOnlySlot }));

  const addFile = useCallback(
    (newFiles: File[]) => {
      const candidate = newFiles[0];
      if (!candidate) return;

      if (!isAccepted(candidate, accept)) {
        setValidationError(`Tipo no permitido: ${candidate.name}. Usa los formatos indicados.`);
        return;
      }

      if (candidate.size > DEFAULT_MAX_SIZE_BYTES) {
        setValidationError(
          `Archivo demasiado grande: ${candidate.name}. Máximo ${Math.round(DEFAULT_MAX_SIZE_BYTES / 1024 / 1024)} MB.`,
        );
        return;
      }

      setValidationError(null);
      onChange([
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: candidate.name,
          file: candidate,
          uploadedAt: "Recién cargado",
        },
      ]);
    },
    [accept, onChange],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragActive(false);
      if (disabled) return;
      const files = Array.from(event.dataTransfer.files);
      if (files.length) addFile(files);
    },
    [addFile, disabled],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files ? Array.from(event.target.files) : [];
      if (files.length) addFile(files);
      event.target.value = "";
    },
    [addFile],
  );

  const handleOpenPreview = useCallback(() => {
    if (!file || !previewUrl) return;

    if (isImageDocument(file, { imageOnlySlot })) {
      onOpenPreview(label, subtitle, previewUrl);
      return;
    }

    window.open(previewUrl, "_blank", "noopener,noreferrer");
  }, [file, imageOnlySlot, label, onOpenPreview, previewUrl, subtitle]);

  const handleRemove = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (!allowRemove || disabled) return;
      onChange([]);
    },
    [allowRemove, disabled, onChange],
  );

  if (!file) {
    return (
      <Stack spacing={0.75}>
        <DropZoneRoot
          isDragActive={isDragActive}
          isError={!!displayError}
          onDrop={handleDrop}
          onDragOver={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragActive(false);
          }}
          onClick={() => !disabled && document.getElementById(inputId)?.click()}
        >
          <input
            id={inputId}
            type="file"
            accept={accept.join(",")}
            onChange={handleInputChange}
            disabled={disabled}
            style={{ display: "none" }}
          />
          <Stack alignItems="center" spacing={0.5}>
            <Upload size={16} color={theme.palette.primary.main} strokeWidth={2} />
            <Typography variant="body1" fontWeight={500} color="primary.main">
              {label}
              {required ? " *" : ""}
            </Typography>
            <Typography variant="body2" color="primary.main">
              Imágenes y PDF. Máx. {Math.round(DEFAULT_MAX_SIZE_BYTES / 1024 / 1024)} MB.
            </Typography>
          </Stack>
        </DropZoneRoot>
        {displayError && (
          <Typography variant="caption" sx={{ color: theme.palette.app.chip.variants.error.color }}>
            {displayError}
          </Typography>
        )}
      </Stack>
    );
  }

  return (
    <Stack spacing={0.75}>
      <VerifiedRow
        style={{ cursor: previewUrl ? "pointer" : "default", marginBottom: 0 }}
        onClick={previewUrl ? handleOpenPreview : undefined}
      >
        <VerifiedCheck>
          <Check size={18} color="#059669" strokeWidth={2} />
        </VerifiedCheck>
        <Stack minWidth={0}>
          <Typography variant="subtitle2" fontWeight={600}>
            {label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ marginLeft: "auto" }}>
          {allowRemove && (
            <IconButton
              size="small"
              aria-label={`Eliminar ${label}`}
              disabled={disabled}
              onClick={handleRemove}
            >
              <Trash2 size={16} color={theme.palette.text.secondary} />
            </IconButton>
          )}
          {showImagePreview ? (
            <VerifiedThumb src={previewUrl} alt={label} />
          ) : (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "6px",
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.palette.app.chip.background,
                color: theme.palette.text.secondary,
                fontSize: 11,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              PDF
            </Box>
          )}
        </Stack>
      </VerifiedRow>
      {displayError && (
        <Typography variant="caption" sx={{ color: theme.palette.app.chip.variants.error.color }}>
          {displayError}
        </Typography>
      )}
    </Stack>
  );
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
  const [imageViewer, setImageViewer] = useState<{
    title: string;
    subtitle: string;
    url: string;
  } | null>(null);

  const documentSlots: DocumentSlotConfig[] = [
    {
      key: "income-proof",
      label: "Comprobante de ingresos",
      files: values.incomeProofFiles,
      onChange: onIncomeProofChange,
      visible: showIncomeProof,
      required: requireIncomeProof,
      allowRemove: true,
      imageOnlySlot: false,
      accept: ["image/*", "image/jpeg", "image/png", "image/webp", "application/pdf"],
    },
    {
      key: "employment-proof-letter",
      label: "Carta de comprobante laboral",
      files: values.employmentProofLetterFiles,
      onChange: onEmploymentProofLetterChange,
      visible: showEmploymentProofLetter,
      required: requireEmploymentProofLetter,
      allowRemove: true,
      imageOnlySlot: false,
      accept: ["image/*", "image/jpeg", "image/png", "image/webp", "application/pdf"],
    },
    {
      key: "ine-front",
      label: "INE frontal",
      files: values.ineFrontFiles,
      onChange: onIneFrontChange,
      visible: true,
      required: true,
      allowRemove: false,
      imageOnlySlot: true,
      accept: ["image/*", "image/jpeg", "image/png", "image/webp"],
    },
    {
      key: "ine-back",
      label: "INE posterior",
      files: values.ineBackFiles,
      onChange: onIneBackChange,
      visible: true,
      required: true,
      allowRemove: false,
      imageOnlySlot: true,
      accept: ["image/*", "image/jpeg", "image/png", "image/webp"],
    },
  ];

  return (
    <Card>
      <Stack spacing={2}>
        {documentSlots
          .filter((slot) => slot.visible)
          .map((slot) => (
            <DocumentationDocumentSlot
              key={slot.key}
              label={slot.label}
              file={slot.files[0]}
              required={slot.required}
              allowRemove={slot.allowRemove}
              imageOnlySlot={slot.imageOnlySlot}
              accept={slot.accept}
              disabled={saving}
              error={
                slot.required && slot.files.length === 0 ? requiredErrorMessage : undefined
              }
              onChange={slot.onChange}
              onOpenPreview={(title, subtitle, url) => setImageViewer({ title, subtitle, url })}
            />
          ))}
      </Stack>

      <Button
        variant="contained"
        sx={{ alignSelf: "flex-start" }}
        onClick={onSave}
        disabled={saving}
      >
        {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
      </Button>

      <ImageViewerModal
        open={imageViewer !== null}
        onClose={() => setImageViewer(null)}
        title={imageViewer?.title ?? ""}
        subtitle={imageViewer?.subtitle}
        imageUrl={imageViewer?.url ?? ""}
      />
    </Card>
  );
}
