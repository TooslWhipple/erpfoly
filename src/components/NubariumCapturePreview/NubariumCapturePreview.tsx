"use client";

import { Button } from "@mui/material";
import {
  PreviewGrid,
  PreviewImage,
  PreviewImageFrame,
  PreviewItem,
  PreviewLabel,
  PreviewRoot,
  PreviewTitle,
} from "./styles";

export interface NubariumCapturePreviewImage {
  label: string;
  alt: string;
  src: string;
}

interface NubariumCapturePreviewProps {
  title?: string;
  images: NubariumCapturePreviewImage[];
  retryLabel: string;
  onRetry: () => void;
}

export function NubariumCapturePreview({
  title,
  images,
  retryLabel,
  onRetry,
}: NubariumCapturePreviewProps) {
  return (
    <PreviewRoot>
      {title ? <PreviewTitle variant="subtitle1">{title}</PreviewTitle> : null}
      <PreviewGrid
        sx={{
          gridTemplateColumns: images.length > 1 ? undefined : "1fr",
        }}
      >
        {images.map((image) => (
          <PreviewItem key={image.label}>
            <PreviewLabel variant="caption">{image.label}</PreviewLabel>
            <PreviewImageFrame>
              <PreviewImage src={image.src} alt={image.alt} />
            </PreviewImageFrame>
          </PreviewItem>
        ))}
      </PreviewGrid>
      <Button variant="outlined" onClick={onRetry} fullWidth>
        {retryLabel}
      </Button>
    </PreviewRoot>
  );
}
