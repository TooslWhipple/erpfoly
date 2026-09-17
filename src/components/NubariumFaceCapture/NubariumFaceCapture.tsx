"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button, Typography } from "@mui/material";
import { NubariumCapturePreview } from "@/components/NubariumCapturePreview";
import { CaptureErrorState, CaptureHost, CaptureStepRoot, CaptureViewport } from "@/components/NubariumCapturePreview/styles";
import {
  extractFaceCaptureImage,
  getCameraAccessErrorMessage,
  getNubariumCameraOptions,
  NUBARIUM_FACE_CAPTURE_CONFIG,
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

export interface NubariumFaceCaptureResult {
  executionId: string;
  faceDataUrl: string;
}

interface NubariumFaceCaptureProps {
  token: string;
  active: boolean;
  completed?: boolean;
  completedResult?: NubariumFaceCaptureResult | null;
  videoDeviceId?: string | null;
  cameraFacing?: CameraFacingHint;
  acceptFailedLiveness?: boolean;
  fillParent?: boolean;
  onInitialized?: () => void;
  onSuccess: (result: NubariumFaceCaptureResult) => void;
  onReset?: () => void;
}

export function NubariumFaceCapture({
  token,
  active,
  completed = false,
  completedResult = null,
  videoDeviceId = null,
  cameraFacing,
  acceptFailedLiveness = false,
  fillParent = false,
  onInitialized,
  onSuccess,
  onReset,
}: NubariumFaceCaptureProps) {
  const reactId = useId().replace(/:/g, "");
  const rootElementId = `nubarium-face-capture-${reactId}`;
  const captureRef = useRef<FaceCapture | null>(null);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onInitializedRef = useRef(onInitialized);
  onInitializedRef.current = onInitialized;
  const tokenRef = useRef(token);
  tokenRef.current = token;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    installCameraDeviceConstraintInterceptor();
    setPreferredCameraDeviceId(videoDeviceId ?? null);
    return () => {
      setPreferredCameraDeviceId(null);
    };
  }, [videoDeviceId]);

  useEffect(() => {
    if (!active || completed || !tokenRef.current.trim()) return;

    let cancelled = false;
    setErrorMessage(null);

    const mountCapture = () => {
      if (cancelled || captureRef.current) return;

      const cameraAccessError = getCameraAccessErrorMessage();
      if (cameraAccessError) {
        setErrorMessage(cameraAccessError);
        return;
      }

      try {
        const capture = new FaceCapture();
        captureRef.current = capture;
        const sessionToken = tokenRef.current;

        capture.init({
          ...NUBARIUM_FACE_CAPTURE_CONFIG,
          cameras: cameraFacing
            ? facingHintToNubarium(cameraFacing)
            : getNubariumCameraOptions(),
          rootElement: rootElementId,
        });

        capture.setToken(sessionToken);

        capture
          .onSuccess((data) => {
            if (cancelled) return;
            const faceDataUrl = extractFaceCaptureImage(data);
            const executionId = data.id?.trim();

            if (!faceDataUrl || !executionId) {
              safeClearNubariumCapture(capture, rootElementId);
              captureRef.current = null;
              releaseCameraHardware();
              setErrorMessage("La prueba de vida no devolvió una imagen válida.");
              return;
            }

            safeClearNubariumCapture(capture, rootElementId);
            captureRef.current = null;
            releaseCameraHardware();
            onSuccessRef.current({ executionId, faceDataUrl });
          })
          .onFail((fail) => {
            if (cancelled) return;
            const faceDataUrl = extractFaceCaptureImage(fail);
            const executionId = fail.id?.trim();
            if (acceptFailedLiveness && faceDataUrl && executionId) {
              safeClearNubariumCapture(capture, rootElementId);
              captureRef.current = null;
              releaseCameraHardware();
              onSuccessRef.current({ executionId, faceDataUrl });
              return;
            }

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
            onInitializedRef.current?.();
          });

        capture.load(() => {
          if (cancelled || captureRef.current !== capture) return;
          capture.start();
          onInitializedRef.current?.();
        });
      } catch (mountError) {
        const rawMessage = mountError instanceof Error ? mountError.message : "";
        setErrorMessage(
          rawMessage.toLowerCase().includes("getusermedia")
            ? (getCameraAccessErrorMessage() ?? "No fue posible acceder a la cámara del dispositivo.")
            : (rawMessage || "No fue posible iniciar la prueba de vida."),
        );
        onInitializedRef.current?.();
      }
    };

    // Defer past React Strict Mode's discarded first effect so FaceCapture is
    // not started, torn down, and started again (looks like the camera opened twice).
    const startTimer = window.setTimeout(mountCapture, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      safeClearNubariumCapture(captureRef.current, rootElementId);
      captureRef.current = null;
      releaseCameraHardware();
    };
  }, [acceptFailedLiveness, active, cameraFacing, completed, rootElementId, videoDeviceId]);

  const handleRetry = () => {
    safeClearNubariumCapture(captureRef.current, rootElementId);
    captureRef.current = null;
    releaseCameraHardware();
    setErrorMessage(null);
    onReset?.();
  };

  const host = <CaptureHost id={rootElementId} />;
  const showPreview = Boolean(completed && completedResult?.faceDataUrl);

  if (showPreview && completedResult) {
    return (
      <NubariumCapturePreview
        title="Rostro capturado"
        images={[
          {
            label: "Selfie",
            alt: "Rostro capturado",
            src: completedResult.faceDataUrl,
          },
        ]}
        retryLabel="Repetir captura"
        onRetry={handleRetry}
      />
    );
  }

  if (fillParent) {
    return host;
  }

  return (
    <CaptureStepRoot>
      <CaptureViewport>
        {host}
      </CaptureViewport>

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
