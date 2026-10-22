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
  extractIdCaptureImages,
  extractNubariumExecutionId,
  NUBARIUM_ID_CAPTURE_CONFIG,
  translateNubariumError,
  translateNubariumFailReason,
} from "@/utils/nubarium";
import type { CameraFacingHint } from "@/utils/cameraDevices";

export interface NubariumIdCaptureResult {
  executionId: string;
  frontDataUrl: string;
  backDataUrl: string;
}

interface NubariumIdCaptureProps {
  token: string;
  active: boolean;
  completed?: boolean;
  completedResult?: NubariumIdCaptureResult | null;
  videoDeviceId?: string | null;
  cameraFacing?: CameraFacingHint;
  onSuccess: (result: NubariumIdCaptureResult) => void;
  onReset?: () => void;
}

function tryFinishIdCapture(payload: unknown): NubariumIdCaptureResult | null {
  const { frontDataUrl, backDataUrl } = extractIdCaptureImages(
    payload && typeof payload === "object"
      ? payload as Parameters<typeof extractIdCaptureImages>[0]
      : {},
  );
  const executionId = extractNubariumExecutionId(payload);
  if (!frontDataUrl || !backDataUrl || !executionId) return null;
  return { executionId, frontDataUrl, backDataUrl };
}

export function NubariumIdCapture({
  token,
  active,
  completed = false,
  completedResult = null,
  videoDeviceId = null,
  cameraFacing,
  onSuccess,
  onReset,
}: NubariumIdCaptureProps) {
  const handleSdkSuccess = useCallback((data: unknown) => {
    const result = tryFinishIdCapture(data);
    if (!result) return "La captura de la INE no devolvió imágenes válidas.";
    onSuccess(result);
    return true;
  }, [onSuccess]);

  const handleSdkFail = useCallback((fail: unknown) => {
    const result = tryFinishIdCapture(fail);
    if (result) {
      onSuccess(result);
      return true;
    }
    return false;
  }, [onSuccess]);

  const { rootElementId, viewportRef, errorMessage, retry } = useNubariumCapture({
    kind: "id",
    token,
    active,
    completed,
    videoDeviceId,
    cameraFacing,
    initConfig: { ...NUBARIUM_ID_CAPTURE_CONFIG },
    createCapture: () => new IdCapture() as never,
    onSdkSuccess: handleSdkSuccess,
    onSdkFail: handleSdkFail,
    translateError: translateNubariumError,
    translateFail: translateNubariumFailReason,
    fallbackMountError: "No fue posible iniciar la captura de la INE.",
  });

  const handleRetry = () => {
    retry();
    onReset?.();
  };

  const showPreview = Boolean(completed && completedResult?.frontDataUrl && completedResult?.backDataUrl);

  if (showPreview && completedResult) {
    return (
      <NubariumCapturePreview
        bannerTitle="INE capturada"
        bannerSubtitle="Verifica que ambos lados se lean con claridad."
        images={[
          { label: "Frontal", alt: "INE frontal", src: completedResult.frontDataUrl },
          { label: "Posterior", alt: "INE posterior", src: completedResult.backDataUrl },
        ]}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <CaptureStepRoot>
      <CaptureViewport ref={viewportRef}>
        <CaptureHost id={rootElementId} />
      </CaptureViewport>

      {!errorMessage ? (
        <BiometricCaptureHint>
          Coloca la INE dentro del marco, con buena luz y sin reflejos.
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
