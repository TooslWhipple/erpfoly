"use client";

import { useCallback } from "react";
import { Button, Typography } from "@mui/material";
import { BiometricCaptureHint } from "@/components/BiometricCaptureModal";
import { NubariumCapturePreview } from "@/components/NubariumCapturePreview";
import {
  CaptureErrorState,
  CaptureHost,
  CaptureStepRoot,
  CaptureViewport,
} from "@/components/NubariumCapturePreview/styles";
import { useNubariumCapture } from "@/hooks/useNubariumCapture";
import {
  extractFaceCaptureImage,
  extractNubariumExecutionId,
  NUBARIUM_FACE_CAPTURE_CONFIG,
  translateNubariumError,
  translateNubariumFailReason,
} from "@/utils/nubarium";
import type { CameraFacingHint } from "@/utils/cameraDevices";

export interface NubariumFaceCaptureResult {
  executionId: string;
  faceDataUrl: string;
}

export interface NubariumFaceComparisonImage {
  src: string;
  label?: string;
  alt?: string;
}

interface NubariumFaceCaptureProps {
  token: string;
  active: boolean;
  completed?: boolean;
  completedResult?: NubariumFaceCaptureResult | null;
  comparisonImage?: NubariumFaceComparisonImage | null;
  videoDeviceId?: string | null;
  cameraFacing?: CameraFacingHint;
  acceptFailedLiveness?: boolean;
  fillParent?: boolean;
  onInitialized?: () => void;
  onSuccess: (result: NubariumFaceCaptureResult) => void;
  onReset?: () => void;
}

function tryFinishFaceCapture(payload: unknown): NubariumFaceCaptureResult | null {
  const faceDataUrl = extractFaceCaptureImage(
    payload && typeof payload === "object"
      ? payload as Parameters<typeof extractFaceCaptureImage>[0]
      : {},
  );
  const executionId = extractNubariumExecutionId(payload);
  if (!faceDataUrl || !executionId) return null;
  return { executionId, faceDataUrl };
}

export function NubariumFaceCapture({
  token,
  active,
  completed = false,
  completedResult = null,
  comparisonImage = null,
  videoDeviceId = null,
  cameraFacing,
  acceptFailedLiveness = false,
  fillParent = false,
  onInitialized,
  onSuccess,
  onReset,
}: NubariumFaceCaptureProps) {
  const handleSdkSuccess = useCallback((data: unknown) => {
    const result = tryFinishFaceCapture(data);
    if (!result) return "La prueba de vida no devolvió una imagen válida.";
    onSuccess(result);
    return true;
  }, [onSuccess]);

  const handleSdkFail = useCallback((fail: unknown) => {
    if (!acceptFailedLiveness) return false;
    const result = tryFinishFaceCapture(fail);
    if (!result) return false;
    onSuccess(result);
    return true;
  }, [acceptFailedLiveness, onSuccess]);

  const { rootElementId, viewportRef, errorMessage, retry } = useNubariumCapture({
    kind: "face",
    token,
    active,
    completed,
    videoDeviceId,
    cameraFacing,
    initConfig: { ...NUBARIUM_FACE_CAPTURE_CONFIG },
    createCapture: () => new FaceCapture() as never,
    onSdkSuccess: handleSdkSuccess,
    onSdkFail: handleSdkFail,
    translateError: translateNubariumError,
    translateFail: translateNubariumFailReason,
    deferMount: true,
    onInitialized,
    fallbackMountError: "No fue posible iniciar la prueba de vida.",
  });

  const handleRetry = () => {
    retry();
    onReset?.();
  };

  const host = <CaptureHost id={rootElementId} data-nubarium-host="" />;
  const showPreview = Boolean(completed && completedResult?.faceDataUrl);

  if (showPreview && completedResult) {
    const images = [
      {
        label: "Selfie",
        alt: "Rostro capturado",
        src: completedResult.faceDataUrl,
      },
    ];
    if (comparisonImage?.src) {
      images.push({
        label: comparisonImage.label ?? "INE frontal",
        alt: comparisonImage.alt ?? "INE frontal",
        src: comparisonImage.src,
      });
    }

    return (
      <NubariumCapturePreview
        bannerTitle="Rostro capturado"
        bannerSubtitle="Compara la selfie con la foto de la INE."
        images={images}
        onRetry={handleRetry}
      />
    );
  }

  if (fillParent) {
    return (
      <div ref={viewportRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {host}
      </div>
    );
  }

  return (
    <CaptureStepRoot>
      <CaptureViewport ref={viewportRef}>
        {host}
      </CaptureViewport>

      {!errorMessage ? (
        <BiometricCaptureHint>
          Pide al cliente que mire a la cámara y se mantenga quieto.
        </BiometricCaptureHint>
      ) : null}

      {errorMessage ? (
        <CaptureErrorState>
          <Typography variant="body2" color="error.main" textAlign="center">
            {errorMessage}
          </Typography>
          <Button variant="outlined" onClick={handleRetry}>
            Reintentar captura
          </Button>
        </CaptureErrorState>
      ) : null}
    </CaptureStepRoot>
  );
}
