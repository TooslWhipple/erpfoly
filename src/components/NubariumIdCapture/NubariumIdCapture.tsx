"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button, Typography } from "@mui/material";
import { NubariumCapturePreview } from "@/components/NubariumCapturePreview";
import { CaptureErrorState, CaptureStepRoot, CaptureViewport } from "@/components/NubariumCapturePreview/styles";
import {
  extractIdCaptureImages,
  extractNubariumExecutionId,
  getCameraAccessErrorMessage,
  getNubariumCameraOptions,
  NUBARIUM_ID_CAPTURE_CONFIG,
  safeClearNubariumCapture,
  translateNubariumError,
  translateNubariumFailReason,
} from "@/utils/nubariumSdk";
import {
  facingHintToNubarium,
  installCameraDeviceConstraintInterceptor,
  releaseCameraHardware,
  setPreferredCameraDeviceId,
  type CameraFacingHint,
} from "@/utils/cameraDevices";

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
  const reactId = useId().replace(/:/g, "");
  const rootElementId = `nubarium-id-capture-${reactId}`;
  const captureRef = useRef<IdCapture | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    installCameraDeviceConstraintInterceptor();
    setPreferredCameraDeviceId(videoDeviceId ?? null);
    return () => {
      setPreferredCameraDeviceId(null);
    };
  }, [videoDeviceId]);

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

        const finishIdCapture = (instance: IdCapture, payload: unknown): boolean => {
          const { frontDataUrl, backDataUrl } = extractIdCaptureImages(
            payload && typeof payload === "object"
              ? payload as Parameters<typeof extractIdCaptureImages>[0]
              : {},
          );
          const executionId = extractNubariumExecutionId(payload);
          if (!frontDataUrl || !backDataUrl || !executionId) return false;

          safeClearNubariumCapture(instance, rootElementId);
          captureRef.current = null;
          releaseCameraHardware();
          onSuccess({ executionId, frontDataUrl, backDataUrl });
          return true;
        };

        capture.init({
          ...NUBARIUM_ID_CAPTURE_CONFIG,
          cameras: cameraFacing
            ? facingHintToNubarium(cameraFacing)
            : getNubariumCameraOptions(),
          rootElement: rootElementId,
        });

        capture.setToken(token);

        capture
          .onSuccess((data) => {
            if (cancelled) return;
            if (finishIdCapture(capture, data)) return;

            safeClearNubariumCapture(capture, rootElementId);
            captureRef.current = null;
            releaseCameraHardware();
            setErrorMessage("La captura de la INE no devolvió imágenes válidas.");
          })
          .onFail((fail) => {
            if (cancelled) return;
            if (finishIdCapture(capture, fail)) return;

            safeClearNubariumCapture(capture, rootElementId);
            captureRef.current = null;
            releaseCameraHardware();
            setErrorMessage(translateNubariumFailReason(fail.reason));
          })
          .onError((sdkError) => {
            if (cancelled) return;
            safeClearNubariumCapture(capture, rootElementId);
            captureRef.current = null;
            releaseCameraHardware();
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
      releaseCameraHardware();
    };
  }, [active, cameraFacing, completed, onSuccess, rootElementId, token, videoDeviceId]);

  const handleRetry = () => {
    safeClearNubariumCapture(captureRef.current, rootElementId);
    captureRef.current = null;
    releaseCameraHardware();
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
    <CaptureStepRoot>
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
    </CaptureStepRoot>
  );
}
