"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button, Stack, Typography } from "@mui/material";
import { NubariumCapturePreview } from "@/components/NubariumCapturePreview";
import { CaptureViewport, CaptureErrorState } from "@/components/NubariumCapturePreview/styles";
import {
  extractFaceCaptureImage,
  getCameraAccessErrorMessage,
  getNubariumCameraOptions,
  NUBARIUM_FACE_CAPTURE_CONFIG,
  safeClearNubariumCapture,
  translateNubariumError,
  translateNubariumFailReason,
} from "@/utils/nubariumSdk";

export interface NubariumFaceCaptureResult {
  executionId: string;
  faceDataUrl: string;
}

interface NubariumFaceCaptureProps {
  token: string;
  active: boolean;
  completed?: boolean;
  completedResult?: NubariumFaceCaptureResult | null;
  onSuccess: (result: NubariumFaceCaptureResult) => void;
  onReset?: () => void;
}

export function NubariumFaceCapture({
  token,
  active,
  completed = false,
  completedResult = null,
  onSuccess,
  onReset,
}: NubariumFaceCaptureProps) {
  const reactId = useId().replace(/:/g, "");
  const rootElementId = `nubarium-face-capture-${reactId}`;
  const captureRef = useRef<FaceCapture | null>(null);
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
        const capture = new FaceCapture();
        captureRef.current = capture;

        capture.init({
          ...NUBARIUM_FACE_CAPTURE_CONFIG,
          cameras: getNubariumCameraOptions(),
          rootElement: rootElementId,
        });

        capture.setToken(token);

        capture
          .onSuccess((data) => {
            const faceDataUrl = extractFaceCaptureImage(data);

            if (!faceDataUrl || !data.id) {
              setErrorMessage("La prueba de vida no devolvió una imagen válida.");
              return;
            }

            safeClearNubariumCapture(capture, rootElementId);
            captureRef.current = null;

            onSuccess({
              executionId: data.id,
              faceDataUrl,
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
            : (rawMessage || "No fue posible iniciar la prueba de vida."),
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

  const showPreview = Boolean(completed && completedResult?.faceDataUrl);

  if (showPreview && completedResult) {
    return (
      <NubariumCapturePreview
        title="Prueba de vida completada"
        images={[
          { label: "Selfie", alt: "Selfie del cliente", src: completedResult.faceDataUrl },
        ]}
        retryLabel="Repetir prueba de vida"
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
