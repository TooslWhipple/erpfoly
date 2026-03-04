import { useCallback, useState } from "react";
import { Stack, Typography, IconButton } from "@mui/material";
import { Upload, FileText, Trash2, Download, Image } from "lucide-react";
import {
  DropZoneRoot,
  FileListContainer,
  FileItemRow,
  FileItemLeft,
  FileItemActions,
} from "./styles";
import { colors } from "@/styles/theme";

// ============================================================================
// TYPES
// ============================================================================

export interface UploadedFileItem {
  id: string;
  name: string;
  /** File object when just added (for preview/delete before submit) */
  file?: File;
  /** Optional URL for already-uploaded files (e.g. for download) */
  url?: string;
  /** Optional timestamp for "uploaded X ago" display */
  uploadedAt?: string;
}

export interface FileUploadProps {
  /** Current list of files */
  value: UploadedFileItem[];
  /** Called when files are added or removed */
  onChange: (files: UploadedFileItem[]) => void;
  /** Allowed MIME types (e.g. ["image/*", "application/pdf"]) */
  accept?: string[];
  /** Max file size in bytes */
  maxFileSizeBytes?: number;
  /** Placeholder text in drop zone */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Error message to show (e.g. validation) */
  error?: string;
}

const DEFAULT_ACCEPT = ["image/*", "image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function getMimeCategory(mime: string): "image" | "pdf" | "other" {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  return "other";
}

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

// ============================================================================
// COMPONENT
// ============================================================================

export function FileUpload({
  value,
  onChange,
  accept = DEFAULT_ACCEPT,
  maxFileSizeBytes = DEFAULT_MAX_SIZE,
  placeholder = "Drag and drop files here or click to browse",
  disabled = false,
  error,
}: FileUploadProps) {
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
      const newItems: UploadedFileItem[] = valid.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        file,
        uploadedAt: "Just now",
      }));
      onChange([...value, ...newItems]);
    },
    [value, onChange, validateFiles]
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

  return (
    <Stack spacing={1.5}>
      <DropZoneRoot
        isDragActive={isDragActive}
        isError={!!displayError}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && document.getElementById("file-upload-input")?.click()}
      >
        <input
          id="file-upload-input"
          type="file"
          multiple
          accept={accept.join(",")}
          onChange={handleInputChange}
          disabled={disabled}
          style={{ display: "none" }}
        />
        <Stack alignItems="center" spacing={1}>
          <Upload size={32} color={colors.text.secondary} strokeWidth={1.5} />
          <Typography variant="body2" color="text.secondary">
            {placeholder}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Images and PDF. Max {Math.round(maxFileSizeBytes / 1024 / 1024)} MB.
          </Typography>
        </Stack>
      </DropZoneRoot>

      {displayError && (
        <Typography variant="caption" sx={{ color: colors.chip.variants.error.color }}>
          {displayError}
        </Typography>
      )}

      {value.length > 0 && (
        <FileListContainer>
          {value.map((item) => {
            const isPdf = item.file?.type === "application/pdf" || item.name.toLowerCase().endsWith(".pdf");
            const Icon = isPdf ? FileText : Image;
            return (
              <FileItemRow key={item.id}>
                <FileItemLeft>
                  <Icon size={20} color={colors.text.secondary} />
                  <Stack minWidth={0}>
                    <Typography variant="body2" noWrap>
                      {item.name}
                    </Typography>
                    {item.uploadedAt && (
                      <Typography variant="caption" color="text.secondary">
                        {item.uploadedAt}
                      </Typography>
                    )}
                  </Stack>
                </FileItemLeft>
                <FileItemActions>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadFile(item);
                    }}
                    title="Download"
                    disabled={!item.file && !item.url}
                  >
                    <Download size={18} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(item.id);
                    }}
                    title="Remove"
                    color="error"
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </FileItemActions>
              </FileItemRow>
            );
          })}
        </FileListContainer>
      )}
    </Stack>
  );
}
