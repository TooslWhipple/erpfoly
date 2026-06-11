import { useCallback, useId, useState } from "react";
import { Stack, Typography, IconButton, Button, useTheme } from "@mui/material";
import { Upload, Trash2, Download, Image as ImageIcon, Clock9 } from "lucide-react";
import {
  DropZoneRoot,
  FileItemRow,
  FileIconContainer
} from "./styles";

export interface UploadedFileItem {
  id: string;
  name: string;
  file?: File;
  url?: string;
  uploadedAt?: string;
}

export interface FileUploadProps {
  value: UploadedFileItem[];
  onChange: (files: UploadedFileItem[]) => void;
  accept?: string[];
  maxFileSizeBytes?: number;
  placeholder?: string;
  fileLabel?: string;
  disabled?: boolean;
  error?: string;
}

const DEFAULT_ACCEPT = ["image/*", "image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function isAccepted(file: File, accept: string[]): boolean {
  const mime = file.type;
  for (const pattern of accept) {
    if (pattern.endsWith("/*")) {
      const [category] = pattern.split("/");
      if (mime.startsWith(category + "/")) return true;
    }
    if (pattern === mime) return true;
  }
  return false;
}

export function FileUpload({
  value,
  onChange,
  accept = DEFAULT_ACCEPT,
  maxFileSizeBytes = DEFAULT_MAX_SIZE,
  placeholder = "Drag and drop files here or click to browse",
  fileLabel,
  disabled = false,
  error,
}: FileUploadProps) {
  const theme = useTheme();
  const inputId = useId();

  const [isDragActive, setIsDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; error?: string } => {
      const valid: File[] = [];
      for (const file of files) {
        if (!isAccepted(file, accept)) {
          return { valid: [], error: `Type not allowed: ${file.name}. Use images or PDF.` };
        }
        if (file.size > maxFileSizeBytes) {
          return {
            valid: [],
            error: `File too large: ${file.name}. Max ${Math.round(maxFileSizeBytes / 1024 / 1024)} MB.`,
          };
        }
        valid.push(file);
      }
      return { valid };
    },
    [accept, maxFileSizeBytes]
  );

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const { valid, error: err } = validateFiles(newFiles);
      if (err) {
        setValidationError(err);
        return;
      }
      setValidationError(null);
      const file = valid[0];
      const newItem: UploadedFileItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        file,
        uploadedAt: "Just now",
      };
      onChange([newItem]);
    },
    [onChange, validateFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      if (disabled) return;
      const files = Array.from(e.dataTransfer.files);
      if (files.length) addFiles(files);
    },
    [disabled, addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length) addFiles(files);
      e.target.value = "";
    },
    [addFiles]
  );

  const removeFile = useCallback(
    (id: string) => {
      onChange(value.filter((f) => f.id !== id));
    },
    [value, onChange]
  );

  const downloadFile = useCallback(
    (item: UploadedFileItem) => {
      if (item.file) {
        const url = URL.createObjectURL(item.file);
        const a = document.createElement("a");
        a.href = url;
        a.download = item.name;
        a.click();
        URL.revokeObjectURL(url);
      } else if (item.url) {
        window.open(item.url, "_blank");
      }
    },
    []
  );

  const displayError = error ?? validationError;
  const hasFile = value.length > 0;
  const currentFile = hasFile ? value[0] : null;

  return (
    <Stack spacing={1.5}>
      {!hasFile && (
        <DropZoneRoot
          isDragActive={isDragActive}
          isError={!!displayError}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
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
            <Typography variant="body1" fontWeight={500} color="primary.main">{placeholder}</Typography>
            <Typography variant="body1" fontWeight={400} color="primary.main">Imagenes y PDF. Max {Math.round(maxFileSizeBytes / 1024 / 1024)} MB.</Typography>
          </Stack>
        </DropZoneRoot>
      )}

      {hasFile && currentFile && (
        <FileItemRow>
          <Stack direction="row" alignItems="center" gap="12px">
            <FileIconContainer>
              <ImageIcon size={20} />
            </FileIconContainer>
            <Stack spacing={0.5}>
              <Stack minWidth={0}>
                <Typography variant="subtitle2">{fileLabel ?? currentFile.name}</Typography>
                {
                  currentFile.uploadedAt &&
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Clock9 size={14} color={theme.palette.text.secondary} />
                    <Typography variant="caption">{currentFile.uploadedAt}</Typography>
                  </Stack>
                }
              </Stack>
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" gap="12px">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                removeFile(currentFile.id);
              }}>
              <Trash2 size={16} color={theme.palette.text.secondary} />
            </IconButton>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<Download size={16} color={theme.palette.text.secondary} />}
              onClick={(e) => {
                e.stopPropagation();
                downloadFile(currentFile);
              }}>
              Descargar
            </Button>
          </Stack>
        </FileItemRow>
      )}

      {displayError && (
        <Typography variant="caption" sx={{ color: theme.palette.app.chip.variants.error.color }}>
          {displayError}
        </Typography>
      )}
    </Stack>
  );
}
