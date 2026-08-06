"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button, Stack, Typography } from "@mui/material";
import { NubariumCapturePreview } from "@/components/NubariumCapturePreview";
import { CaptureViewport, CaptureErrorState } from "@/components/NubariumCapturePreview/styles";
import {
  extractIdCaptureImages,
  getCameraAccessErrorMessage,
  getNubariumCameraOptions,
  NUBARIUM_ID_CAPTURE_CONFIG,
  safeClearNubariumCapture,
  translateNubariumError,
  translateNubariumFailReason,
} from "@/utils/nubariumSdk";

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
  onSuccess: (result: NubariumIdCaptureResult) => void;
  onReset?: () => void;
}

export function NubariumIdCapture({
  token,
  active,
  completed = false,
  completedResult = null,
  onSuccess,
  onReset,
}: NubariumIdCaptureProps) {
  const reactId = useId().replace(/:/g, "");
  const rootElementId = `nubarium-id-capture-${reactId}`;
  const captureRef = useRef<IdCapture | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!active || completed || !token.trim()) return;

    let cancelled = false;
    setErrorMessage(null);

    const mountCapture = () => {
      if (cancelled) return;

      const cameraAccessError = getCameraAccessErrorMessage();
      if (cameraAccessError) {
        setErrorMessage(cameraAccessError);
        return;
      }

      try {
        const capture = new IdCapture();
        captureRef.current = capture;

        capture.init({
          ...NUBARIUM_ID_CAPTURE_CONFIG,
          cameras: getNubariumCameraOptions(),
          rootElement: rootElementId,
        });

        capture.setToken(token);

        capture
          .onSuccess((data) => {
            const { frontDataUrl, backDataUrl } = extractIdCaptureImages(data);

            if (!frontDataUrl || !backDataUrl || !data.id) {
              setErrorMessage("La captura de la INE no devolvió imágenes válidas.");
              return;
            }

            safeClearNubariumCapture(capture, rootElementId);
            captureRef.current = null;

            onSuccess({
              executionId: data.id,
              frontDataUrl,
              backDataUrl,
            });
          })
          .onFail((fail) => {
            setErrorMessage(translateNubariumFailReason(fail.reason));
          })
          .onError((sdkError) => {
            setErrorMessage(translateNubariumError(sdkError));
          });

        capture.load(() => {
          if (cancelled) return;
          capture.start();
        });
      } catch (mountError) {
        const rawMessage = mountError instanceof Error ? mountError.message : "";
        setErrorMessage(
          rawMessage.toLowerCase().includes("getusermedia")
            ? (getCameraAccessErrorMessage() ?? "No fue posible acceder a la cámara del dispositivo.")
            : (rawMessage || "No fue posible iniciar la captura de la INE."),
        );
      }
    };

    mountCapture();

    return () => {
      cancelled = true;
      safeClearNubariumCapture(captureRef.current, rootElementId);
      captureRef.current = null;
    };
  }, [active, completed, onSuccess, rootElementId, token]);

  const handleRetry = () => {
    safeClearNubariumCapture(captureRef.current, rootElementId);
    captureRef.current = null;
    setErrorMessage(null);
    onReset?.();
  };

  const showPreview = Boolean(completed && completedResult?.frontDataUrl && completedResult?.backDataUrl);

  if (showPreview && completedResult) {
    return (
      <NubariumCapturePreview
        title="INE capturada"
        images={[
          { label: "Frontal", alt: "INE frontal", src: completedResult.frontDataUrl },
          { label: "Posterior", alt: "INE posterior", src: completedResult.backDataUrl },
        ]}
        retryLabel="Volver a capturar INE"
        onRetry={handleRetry}
      />
    );
  }

  return (
    <Stack spacing={2} alignItems="center">
      <CaptureViewport id={rootElementId} />

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
    </Stack>
  );
}
