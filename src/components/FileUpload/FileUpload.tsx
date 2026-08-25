import { useCallback, useId, useState } from "react";
import { Stack, Typography, IconButton, Button, useTheme } from "@mui/material";
import { Upload, Trash2, Download, Eye, Image as ImageIcon, Clock9 } from "lucide-react";
import { ImageViewerModal } from "@/components/ImageViewerModal";
import {
  DropZoneRoot,
  FileItemRow,
  FileItemInfo,
  FileItemActions,
  FileIconContainer
} from "./styles";

export interface UploadedFileItem {
  id: string;
  name: string;
  file?: File;
  url?: string;
  /**
   * URL del archivo servida **en línea**, para mostrarlo dentro de la
   * aplicación. Solo hace falta cuando `url` se sirve con
   * `Content-Disposition: attachment` (ver `urlForcesDownload`), porque esa
   * cabecera hace que el visor descargue el archivo en vez de mostrarlo.
   */
  previewUrl?: string;
  uploadedAt?: string;
}

export interface FileUploadProps {
  value: UploadedFileItem[];
  onChange: (files: UploadedFileItem[]) => void;
  accept?: string[];
  maxFileSizeBytes?: number;
  /** Maximum number of files. Defaults to 1 (replace mode). */
  maxFiles?: number;
  placeholder?: string;
  /** Secondary hint under the placeholder. Defaults to images/PDF copy. */
  hint?: string;
  fileLabel?: string;
  disabled?: boolean;
  error?: string;
  /** Makes the upload area fill the full height of its parent container. */
  fullHeight?: boolean;
  /**
   * Shows the delete icon on each file card. Defaults to `true`. Set it to
   * `false` where the attachment is mandatory and removing it would leave the
   * record in an invalid state.
   */
  allowRemove?: boolean;
  /**
   * Shows a "Reemplazar" action on each file card, which reopens the file
   * picker. Defaults to `false`; only useful with `maxFiles = 1`, where the
   * drop zone disappears as soon as there is a file.
   */
  allowReplace?: boolean;
  /**
   * Declara que las `url` de los archivos ya subidos se sirven con
   * `Content-Disposition: attachment`. Con `true`, "Descargar" guarda el
   * archivo a disco sin abrir pestaña ni navegar. Por defecto `false`, que
   * abre la URL en otra pestaña: es lo único seguro si el servidor devuelve
   * el archivo en línea, porque entonces un enlace directo se llevaría la
   * página actual.
   */
  urlForcesDownload?: boolean;
  /**
   * Muestra una acción "Ver" en cada card, que abre el archivo dentro de la
   * aplicación (imagen o PDF) sin descargarlo ni abrir pestaña. Por defecto
   * `false`. La acción se oculta en los archivos que no se pueden previsualizar:
   * los ya almacenados necesitan una `previewUrl`, o una `url` que no fuerce la
   * descarga.
   */
  allowPreview?: boolean;
  style?: React.CSSProperties;
}

const DEFAULT_ACCEPT = ["image/*", "image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const DEFAULT_HINT = "Imagenes y PDF. Max {maxMb} MB.";

const MIME_EXTENSIONS: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "application/xml": [".xml"],
  "text/xml": [".xml"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
};

function getFileExtension(fileName: string): string {
  const index = fileName.lastIndexOf(".");
  return index >= 0 ? fileName.slice(index).toLowerCase() : "";
}

function isAccepted(file: File, accept: string[]): boolean {
  const mime = file.type;
  const extension = getFileExtension(file.name);

  for (const pattern of accept) {
    if (pattern.startsWith(".")) {
      if (extension === pattern.toLowerCase()) return true;
      continue;
    }
    if (pattern.endsWith("/*")) {
      const [category] = pattern.split("/");
      if (mime.startsWith(`${category}/`)) return true;
      continue;
    }
    if (pattern === mime) return true;
    if (MIME_EXTENSIONS[pattern]?.includes(extension)) return true;
  }
  return false;
}

type PreviewState = {
  url: string;
  name: string;
  /** Los object URL de un archivo local hay que revocarlos al cerrar el visor. */
  isObjectUrl: boolean;
};

/**
 * URL con la que se puede mostrar el archivo embebido, o `undefined` si no hay
 * ninguna. Un archivo ya almacenado solo es previsualizable si el servidor lo
 * sirve en línea: con `Content-Disposition: attachment` el visor lo bajaría a
 * disco en vez de pintarlo, así que ahí hace falta una `previewUrl` aparte.
 */
function resolveRemotePreviewUrl(
  item: UploadedFileItem,
  urlForcesDownload: boolean,
): string | undefined {
  return item.previewUrl ?? (urlForcesDownload ? undefined : item.url);
}

function toUploadedItem(file: File): UploadedFileItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: file.name,
    file,
    uploadedAt: "Just now",
  };
}

export function FileUpload({
  value,
  onChange,
  accept = DEFAULT_ACCEPT,
  maxFileSizeBytes = DEFAULT_MAX_SIZE,
  maxFiles = 1,
  placeholder = "Drag and drop files here or click to browse",
  hint,
  fileLabel,
  disabled = false,
  error,
  fullHeight = false,
  allowRemove = true,
  allowReplace = false,
  urlForcesDownload = false,
  allowPreview = false,
  style,
}: FileUploadProps) {
  const theme = useTheme();
  const inputId = useId();
  const maxMb = Math.round(maxFileSizeBytes / 1024 / 1024);
  const resolvedHint = (hint ?? DEFAULT_HINT).replace("{maxMb}", String(maxMb));
  const allowMultiple = maxFiles > 1;

  const [isDragActive, setIsDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; error?: string } => {
      const valid: File[] = [];
      for (const file of files) {
        if (!isAccepted(file, accept)) {
          return { valid: [], error: `Tipo no permitido: ${file.name}.` };
        }
        if (file.size > maxFileSizeBytes) {
          return {
            valid: [],
            error: `Archivo demasiado grande: ${file.name}. Máximo ${maxMb} MB.`,
          };
        }
        valid.push(file);
      }
      return { valid };
    },
    [accept, maxFileSizeBytes, maxMb]
  );

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const { valid, error: err } = validateFiles(newFiles);
      if (err) {
        setValidationError(err);
        return;
      }
      setValidationError(null);

      if (!allowMultiple) {
        onChange([toUploadedItem(valid[0])]);
        return;
      }

      // Multi-file: replace existing item with the same extension; otherwise append.
      let next = [...value];
      for (const file of valid) {
        const extension = getFileExtension(file.name);
        const item = toUploadedItem(file);
        const existingIndex = next.findIndex(
          (current) => getFileExtension(current.name) === extension,
        );

        if (existingIndex >= 0) {
          next[existingIndex] = item;
          continue;
        }

        if (next.length >= maxFiles) {
          setValidationError(`Máximo ${maxFiles} archivos.`);
          return;
        }
        next = [...next, item];
      }

      onChange(next);
    },
    [allowMultiple, maxFiles, onChange, validateFiles, value]
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

  const openFilePicker = useCallback(() => {
    if (disabled) return;
    document.getElementById(inputId)?.click();
  }, [disabled, inputId]);

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
        return;
      }
      if (!item.url) return;

      if (!urlForcesDownload) {
        window.open(item.url, "_blank", "noopener,noreferrer");
        return;
      }

      // Sin `target` y sin `download`: quien decide que esto baja a disco en
      // vez de navegar es la cabecera `Content-Disposition: attachment` de la
      // respuesta. El atributo `download` no sirve aquí —el navegador lo
      // ignora en enlaces de otro origen, y las URLs firmadas de GCS lo son—
      // y `target="_blank"` abre una pestaña aunque la respuesta sea attachment.
      const a = document.createElement("a");
      a.href = item.url;
      a.rel = "noopener";
      a.click();
    },
    [urlForcesDownload]
  );

  const canPreview = useCallback(
    (item: UploadedFileItem) =>
      item.file != null ||
      resolveRemotePreviewUrl(item, urlForcesDownload) != null,
    [urlForcesDownload]
  );

  const openPreview = useCallback(
    (item: UploadedFileItem) => {
      if (item.file) {
        setPreview({
          url: URL.createObjectURL(item.file),
          name: item.name,
          isObjectUrl: true,
        });
        return;
      }
      const url = resolveRemotePreviewUrl(item, urlForcesDownload);
      if (!url) return;
      setPreview({ url, name: item.name, isObjectUrl: false });
    },
    [urlForcesDownload]
  );

  const closePreview = useCallback(() => {
    if (preview?.isObjectUrl) {
      URL.revokeObjectURL(preview.url);
    }
    setPreview(null);
  }, [preview]);

  const displayError = error ?? validationError;
  const hasFile = value.length > 0;
  const canAddMore = value.length < maxFiles;
  const showDropZone = !hasFile || (allowMultiple && canAddMore);

  return (
    <Stack
      spacing={1.5}
      style={style}
      sx={
        fullHeight
          ? { height: "100%", flex: 1, minHeight: 0 }
          : undefined
      }
    >
      {/*
        El input vive fuera del `DropZoneRoot`: la zona de arrastre deja de
        renderizarse en cuanto hay archivo (con `maxFiles = 1`), y anidarlo ahí
        dejaba a «Reemplazar» sin nada que abrir.
      */}
      <input
        id={inputId}
        type="file"
        accept={accept.join(",")}
        multiple={allowMultiple}
        onChange={handleInputChange}
        disabled={disabled}
        style={{ display: "none" }}
      />

      {showDropZone && (
        <DropZoneRoot
          isDragActive={isDragActive}
          isError={!!displayError}
          fullHeight={fullHeight && !hasFile}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFilePicker}
        >
          <Stack alignItems="center" spacing={0.5}>
            <Upload size={16} color={theme.palette.primary.main} strokeWidth={2} />
            <Typography variant="body1" fontWeight={500} color="primary.main">{placeholder}</Typography>
            <Typography variant="body1" fontWeight={400} color="primary.main">{resolvedHint}</Typography>
          </Stack>
        </DropZoneRoot>
      )}

      {value.map((item, index) => (
        <FileItemRow key={item.id}>
          <FileItemInfo>
            <FileIconContainer>
              <ImageIcon size={20} />
            </FileIconContainer>
            <Stack minWidth={0}>
              <Typography variant="subtitle2" noWrap title={item.name}>
                {index === 0 ? (fileLabel ?? item.name) : item.name}
              </Typography>
              {
                item.uploadedAt &&
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Clock9 size={14} color={theme.palette.text.secondary} />
                  <Typography variant="caption">{item.uploadedAt}</Typography>
                </Stack>
              }
            </Stack>
          </FileItemInfo>
          <FileItemActions>
            {allowRemove && (
              <IconButton
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(item.id);
                }}>
                <Trash2 size={16} color={theme.palette.text.secondary} />
              </IconButton>
            )}
            {allowReplace && (
              <Button
                variant="text"
                color="primary"
                size="small"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  openFilePicker();
                }}>
                Reemplazar
              </Button>
            )}
            {allowPreview && canPreview(item) && (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<Eye size={16} color={theme.palette.text.secondary} />}
                onClick={(e) => {
                  e.stopPropagation();
                  openPreview(item);
                }}>
                Ver
              </Button>
            )}
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<Download size={16} color={theme.palette.text.secondary} />}
              onClick={(e) => {
                e.stopPropagation();
                downloadFile(item);
              }}>
              Descargar
            </Button>
          </FileItemActions>
        </FileItemRow>
      ))}

      {displayError && (
        <Typography variant="caption" sx={{ color: theme.palette.app.chip.variants.error.color }}>
          {displayError}
        </Typography>
      )}

      {preview && (
        <ImageViewerModal
          open
          onClose={closePreview}
          title={preview.name}
          imageUrl={preview.url}
          imageAlt={preview.name}
          fileName={preview.name}
        />
      )}
    </Stack>
  );
}
