"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { theme } from "@/styles/theme";
import type { NubariumOcrPreview } from "@/services/nubarium.service";
import {
  extractIdCaptureImages,
  mapIdCaptureOcrPreview,
  safeClearNubariumCapture,
  translateNubariumError,
  translateNubariumFailReason,
} from "@/utils/nubariumSdk";

export interface NubariumIdCaptureResult {
  executionId: string;
  frontDataUrl: string;
  backDataUrl: string;
  ocrPreview: NubariumOcrPreview | null;
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
        const capture = new IdCapture();
        captureRef.current = capture;

        capture.init({
          rootElement: rootElementId,
          timeouts: {
            front: 180000,
            back: 180000,
          },
          captureMode: {
            front: { enabled: false },
            back: { enabled: false },
          },
          guide: {
            front: { enabled: true },
            back: { enabled: true, until: 10000 },
          },
          autorotate: true,
          antispoofing: {
            enabled: true,
            level: 3,
          },
          custom: {
            document: "MEX_IdCard",
          },
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
              ocrPreview: mapIdCaptureOcrPreview(data.ocr),
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
            : "No fue posible iniciar la captura de la INE.",
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

  return (
    <Stack spacing={2}>
      {showPreview && completedResult && (
        <>
          <Typography variant="subtitle1" textAlign="center">
            INE capturada correctamente
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <PreviewImage alt="INE frontal" src={completedResult.frontDataUrl} label="Frontal" />
            <PreviewImage alt="INE posterior" src={completedResult.backDataUrl} label="Posterior" />
          </Stack>
          {completedResult.ocrPreview && (
            <Box
              sx={{
                borderRadius: "12px",
                backgroundColor: theme.palette.background.default,
                p: 2,
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Datos leídos de la INE
              </Typography>
              <Stack spacing={0.5}>
                {completedResult.ocrPreview.name && (
                  <Typography variant="body2">Nombre: {completedResult.ocrPreview.name}</Typography>
                )}
                {completedResult.ocrPreview.lastName && (
                  <Typography variant="body2">Apellido paterno: {completedResult.ocrPreview.lastName}</Typography>
                )}
                {completedResult.ocrPreview.secondLastName && (
                  <Typography variant="body2">Apellido materno: {completedResult.ocrPreview.secondLastName}</Typography>
                )}
                {completedResult.ocrPreview.curp && (
                  <Typography variant="body2">CURP: {completedResult.ocrPreview.curp}</Typography>
                )}
                {completedResult.ocrPreview.rfc && (
                  <Typography variant="body2">RFC: {completedResult.ocrPreview.rfc}</Typography>
                )}
              </Stack>
            </Box>
          )}
          <Button variant="outlined" onClick={handleRetry}>
            Volver a capturar INE
          </Button>
        </>
      )}

      {!showPreview && (
        <Stack spacing={2} alignItems="center">
          <Box
            id={rootElementId}
            sx={{
              width: "100%",
              minHeight: "420px",
              borderRadius: "16px",
              overflow: "hidden",
              backgroundColor: theme.palette.background.default,
            }}
          />

          {isInitializing && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2">Iniciando captura de INE...</Typography>
            </Stack>
          )}

          {errorMessage && (
            <Stack spacing={1} alignItems="center" sx={{ width: "100%" }}>
              <Typography variant="body2" color="error.main" textAlign="center">
                {errorMessage}
              </Typography>
              <Button variant="outlined" onClick={handleRetry}>
                Reintentar captura
              </Button>
            </Stack>
          )}

          <Typography variant="subtitle2" textAlign="center">
            Acomoda la INE dentro del marco; la foto se tomará automáticamente cuando la imagen sea óptima.
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}

function PreviewImage({
  alt,
  src,
  label,
}: {
  alt: string;
  src: string;
  label: string;
}) {
  return (
    <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="caption" textAlign="center">
        {label}
      </Typography>
      <Box
        sx={{
          width: "100%",
          minHeight: 220,
          borderRadius: "12px",
          overflow: "hidden",
          backgroundColor: theme.palette.background.default,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          style={{
            width: "100%",
            maxHeight: 280,
            objectFit: "contain",
            display: "block",
          }}
        />
      </Box>
    </Stack>
  );
}
