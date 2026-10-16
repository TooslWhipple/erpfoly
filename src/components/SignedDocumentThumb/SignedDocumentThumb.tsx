import type { CSSProperties } from "react";
import { Box, useTheme } from "@mui/material";
import { useLazySignedDocumentFileUrl } from "@/hooks/useSignedDocumentFileUrl";
import { VerifiedThumb } from "@/styles/solicitudes-credito.styles";
import type { RemoteDocumentFile } from "@/types/document-file.types";

interface SignedDocumentThumbProps {
  file: RemoteDocumentFile;
  alt: string;
  /** Estilos de la imagen ya cargada. */
  style?: CSSProperties;
}

/**
 * Miniatura de un archivo almacenado. Pide su URL firmada solo cuando entra en
 * pantalla y, mientras tanto, muestra un hueco del mismo tamaño.
 */
export function SignedDocumentThumb({ file, alt, style }: SignedDocumentThumbProps) {
  const theme = useTheme();
  const { observeRef, url } = useLazySignedDocumentFileUrl(file);

  if (url) {
    return <VerifiedThumb src={url} alt={alt} style={style} />;
  }

  return (
    <Box
      ref={observeRef}
      aria-label={alt}
      sx={{
        width: 48,
        height: 48,
        borderRadius: "6px",
        marginLeft: "auto",
        flexShrink: 0,
        backgroundColor: theme.palette.app.chip.background,
      }}
    />
  );
}
