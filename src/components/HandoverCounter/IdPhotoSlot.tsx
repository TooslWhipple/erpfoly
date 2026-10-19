import { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { Camera, Trash2 } from "lucide-react";
import { uploadHandoverFile } from "@/services/sale-handover.service";
import type { HandoverFileKind } from "@/types/saleHandover.types";

export const ID_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

export interface IdPhotoSlotProps {
  label: string;
  kind: Extract<HandoverFileKind, "INE_FRONT" | "INE_BACK">;
  fileId: number | null;
  onFileIdChange: (fileId: number | null) => void;
  disabled?: boolean;
}

export function IdPhotoSlot({
  label,
  kind,
  fileId,
  onFileIdChange,
  disabled = false,
}: IdPhotoSlotProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const handleFile = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Usa una imagen JPG o PNG.");
      return;
    }
    if (file.size > ID_PHOTO_MAX_BYTES) {
      setError("La imagen supera los 5 MB.");
      return;
    }
    setError(null);
    setUploading(true);
    const result = await uploadHandoverFile(file, kind, file.name);
    setUploading(false);
    if (result.error || !result.data) {
      setError(result.error?.message ?? "No se pudo subir la imagen.");
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    onFileIdChange(result.data.fileId);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    onFileIdChange(null);
  };

  return (
    <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="body2" fontWeight={600}>
        {label}
      </Typography>
      <Box
        sx={{
          height: 140,
          borderRadius: 2,
          border: 1,
          borderStyle: fileId ? "solid" : "dashed",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {uploading ? (
          <CircularProgress size={24} />
        ) : previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:)
          <img
            src={previewUrl}
            alt={label}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Typography variant="caption" color="text.secondary">
            Sin foto
          </Typography>
        )}
      </Box>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        capture="environment"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void handleFile(file);
        }}
      />
      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Camera size={16} aria-hidden />}
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {fileId ? "Cambiar" : "Tomar foto"}
        </Button>
        {fileId ? (
          <Button
            size="small"
            color="inherit"
            startIcon={<Trash2 size={16} aria-hidden />}
            disabled={disabled || uploading}
            onClick={handleRemove}
          >
            Quitar
          </Button>
        ) : null}
      </Stack>
      {error ? (
        <Alert severity="error" sx={{ py: 0 }}>
          {error}
        </Alert>
      ) : null}
    </Stack>
  );
}
