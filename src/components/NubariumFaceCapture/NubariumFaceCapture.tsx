"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { theme } from "@/styles/theme";
import {
  extractFaceCaptureImage,
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
  const [isInitializing, setIsInitializing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!active || completed || !token.trim()) return;

    let cancelled = false;
    setIsInitializing(true);
    setErrorMessage(null);

    const mountCapture = () => {
      if (cancelled) return;

      try {
        const capture = new FaceCapture();
        captureRef.current = capture;

        capture.init({
          rootElement: rootElementId,
          maxValidations: 3,
          features: {
            disabled: ["glasses", "facemask"],
            enabled: [],
          },
          antispoofing: {
            enabled: true,
            level: 3,
          },
          cameras: "front",
          timeout: 180000,
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
          setIsInitializing(false);
        });
      } catch (mountError) {
        setIsInitializing(false);
        setErrorMessage(
          mountError instanceof Error
            ? mountError.message
            : "No fue posible iniciar la prueba de vida.",
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

  return (
    <Stack spacing={2}>
      {
        showPreview && completedResult &&
        <>
          <Typography variant="subtitle1" textAlign="center">Prueba de vida completada</Typography>
          <Box
            sx={{
              width: "100%",
              minHeight: "296px",
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor: theme.palette.background.default,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={completedResult.faceDataUrl}
              alt="Selfie del cliente"
              style={{
                width: "100%",
                maxHeight: "296px",
                objectFit: "contain",
                display: "block",
              }}
            />
          </Box>
          <Button
            variant="outlined"
            onClick={handleRetry}>Repetir prueba de vida</Button>
        </>
      }

      {
        !showPreview &&
        <Stack spacing={2} alignItems="center">
          <Box
            id={rootElementId}
            sx={{
              width: "100%",
              minHeight: "296px",
              borderRadius: "16px",
              overflow: "hidden",
              backgroundColor: theme.palette.background.default,
            }}
          />

          {
            isInitializing &&
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2">Iniciando prueba de vida...</Typography>
            </Stack>
          }

          {
            errorMessage &&
            <Stack spacing={1} alignItems="center" sx={{ width: "100%" }}>
              <Typography variant="body2" color="error.main" textAlign="center">{errorMessage}</Typography>
              <Button variant="outlined" onClick={handleRetry}>Reintentar captura</Button>
            </Stack>
          }
        </Stack>
      }
    </Stack>
  );
}
