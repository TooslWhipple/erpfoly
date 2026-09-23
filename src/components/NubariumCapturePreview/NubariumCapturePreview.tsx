"use client";

import { BiometricCaptureSuccessBanner } from "@/components/BiometricCaptureModal";
import {
  PreviewGrid,
  PreviewImage,
  PreviewImageFrame,
  PreviewItem,
  PreviewLabel,
  PreviewRoot,
} from "./styles";

export interface NubariumCapturePreviewImage {
  label: string;
  alt: string;
  src: string;
}

interface NubariumCapturePreviewProps {
  bannerTitle: string;
  bannerSubtitle?: string;
  images: NubariumCapturePreviewImage[];
  retryLabel?: string;
  onRetry: () => void;
}

export function NubariumCapturePreview({
  bannerTitle,
  bannerSubtitle,
  images,
  retryLabel = "Repetir",
  onRetry,
}: NubariumCapturePreviewProps) {
  return (
    <PreviewRoot>
      <BiometricCaptureSuccessBanner
        title={bannerTitle}
        subtitle={bannerSubtitle}
        retryLabel={retryLabel}
        onRetry={onRetry}
      />
      <PreviewGrid
        sx={{
          gridTemplateColumns: images.length > 1 ? undefined : "1fr",
        }}
      >
        {images.map((image) => (
          <PreviewItem key={image.label}>
            <PreviewImageFrame>
              <PreviewImage src={image.src} alt={image.alt} />
            </PreviewImageFrame>
            <PreviewLabel variant="caption">{image.label}</PreviewLabel>
          </PreviewItem>
        ))}
      </PreviewGrid>
    </PreviewRoot>
  );
}
