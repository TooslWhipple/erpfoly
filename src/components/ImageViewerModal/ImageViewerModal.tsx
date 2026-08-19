import { Dialog, DialogContent, IconButton, Typography, Stack } from "@mui/material";
import { X } from "lucide-react";
import { Check } from "lucide-react";
import { theme } from "@/styles/theme";
import { hasImageExtension, hasPdfExtension } from "@/utils/file-types";

export interface ImageViewerModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /**
   * URL del archivo a mostrar. Admite imagen y PDF; el nombre de la prop se
   * conserva porque el componente nació como visor de imágenes y sus
   * consumidores anteriores la usan.
   */
  imageUrl: string;
  imageAlt?: string;
  /**
   * Nombre real del archivo. Solo hace falta cuando la URL no delata el tipo
   * —un `blob:` de un archivo recién elegido no tiene extensión—: es lo que
   * permite elegir entre imagen y PDF. Si no se pasa, decide la URL, y en
   * último término se asume imagen (el comportamiento histórico).
   */
  fileName?: string;
  /** Background color for the preview area. Useful for transparent PNGs (e.g. dark signatures). */
  previewBackgroundColor?: string;
}

function isPdf(imageUrl: string, fileName?: string): boolean {
  if (fileName) {
    if (hasPdfExtension(fileName)) return true;
    if (hasImageExtension(fileName)) return false;
  }
  return hasPdfExtension(imageUrl);
}

export function ImageViewerModal({
  open,
  onClose,
  title,
  subtitle,
  imageUrl,
  imageAlt = title,
  fileName,
  previewBackgroundColor = "#1a1a1a",
}: ImageViewerModalProps) {
  const showPdf = isPdf(imageUrl, fileName);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
        },
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: `1px solid ${theme.palette.app.border}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {subtitle && (
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  backgroundColor: theme.palette.app.chip.variants.success.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={10} color="#fff" strokeWidth={3} />
              </div>
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            </Stack>
          )}
        </Stack>
        <IconButton onClick={onClose} size="small" aria-label="Cerrar">
          <X size={20} />
        </IconButton>
      </div>
      <DialogContent
        sx={{
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: previewBackgroundColor,
          minHeight: 400,
        }}
      >
        {showPdf ? (
          // `<object>` en vez de `<iframe>` por el contenido alternativo: si el
          // navegador no trae visor de PDF, en vez de un marco en blanco se
          // pinta el enlace de abajo.
          <object
            data={imageUrl}
            type="application/pdf"
            aria-label={imageAlt}
            style={{ width: "100%", height: "70vh", border: "none" }}
          >
            <Stack alignItems="center" spacing={1} sx={{ padding: 3 }}>
              <Typography variant="body2" color="#fff">
                Tu navegador no puede mostrar este PDF.
              </Typography>
              <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                Abrirlo en otra pestaña
              </a>
            </Stack>
          </object>
        ) : (
          <img
            src={imageUrl}
            alt={imageAlt}
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              objectFit: "contain",
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
