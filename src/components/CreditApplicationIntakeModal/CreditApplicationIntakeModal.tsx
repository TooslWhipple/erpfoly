import { useCallback, useMemo, useRef, useState } from "react";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { Fingerprint, PenSquare } from "lucide-react";
import { SideModal } from "@/components/SideModal";
import { NubariumFaceCapture } from "@/components/NubariumFaceCapture";
import { NubariumIdCapture, type NubariumIdCaptureResult } from "@/components/NubariumIdCapture";
import { useNubariumSdk } from "@/hooks/useNubariumSdk";
import { theme } from "@/styles/theme";
import type { CreditApplicationBiometricsData } from "@/types/credit-application-form.types";

interface CreditApplicationIntakeModalProps {
  open: boolean;
  onClose: () => void;
  /** Persist intake to the server; on failure, throw so the modal stays open for retry. */
  onFinalize: (payload: CreditApplicationBiometricsData) => Promise<void>;
}

type IntakeStepId = "ine-capture" | "liveness" | "fingerprint" | "signature";

const STEP_ORDER: IntakeStepId[] = [
  "ine-capture",
  "liveness",
  "fingerprint",
  "signature",
];

const STEP_TITLES: Record<IntakeStepId, { title: string; subtitle: string }> = {
  "ine-capture": {
    title: "Nuevo cliente",
    subtitle: "Captura la INE del cliente (frente y reverso)",
  },
  liveness: {
    title: "Nuevo cliente",
    subtitle: "Realiza la prueba de vida del cliente",
  },
  fingerprint: {
    title: "Nuevo cliente",
    subtitle: "Captura de huella digital",
  },
  signature: {
    title: "Nuevo cliente",
    subtitle: "Revisión de Buró de Crédito",
  },
};

export function CreditApplicationIntakeModal({
  open,
  onClose,
  onFinalize,
}: CreditApplicationIntakeModalProps) {
  const [activeStep, setActiveStep] = useState<IntakeStepId>("ine-capture");
  const [ineExecutionId, setIneExecutionId] = useState<string | null>(null);
  const [ineFrontImage, setIneFrontImage] = useState<string | null>(null);
  const [ineBackImage, setIneBackImage] = useState<string | null>(null);
  const [ocrPreview, setOcrPreview] = useState<CreditApplicationBiometricsData["ocrPreview"]>(null);
  const [livenessExecutionId, setLivenessExecutionId] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [fingerprintConfirmed, setFingerprintConfirmed] = useState(false);
  const [signatureDrawn, setSignatureDrawn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ineCaptureSessionKey, setIneCaptureSessionKey] = useState(0);
  const [livenessCaptureSessionKey, setLivenessCaptureSessionKey] = useState(0);

  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  const clearSignatureCanvas = () => {
    const canvas = signatureCanvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDrawn(false);
  };

  const { isReady: sdkReady, isLoading: sdkLoading, token: sdkToken, error: sdkError, reloadToken } =
    useNubariumSdk({ enabled: open });

  const currentStepIndex = STEP_ORDER.indexOf(activeStep);
  const isLastStep = currentStepIndex === STEP_ORDER.length - 1;
  const stepContent = STEP_TITLES[activeStep];

  const canContinue = useMemo(() => {
    if (activeStep === "ine-capture") return Boolean(ineFrontImage && ineBackImage);
    if (activeStep === "liveness") return Boolean(selfieImage);
    if (activeStep === "fingerprint") return fingerprintConfirmed;
    return signatureDrawn;
  }, [
    activeStep,
    fingerprintConfirmed,
    ineBackImage,
    ineFrontImage,
    selfieImage,
    signatureDrawn,
  ]);

  const resetModalState = useCallback(() => {
    setActiveStep("ine-capture");
    setIneExecutionId(null);
    setIneFrontImage(null);
    setIneBackImage(null);
    setOcrPreview(null);
    setLivenessExecutionId(null);
    setSelfieImage(null);
    setFingerprintConfirmed(false);
    setSignatureDrawn(false);
    setIneCaptureSessionKey(0);
    setLivenessCaptureSessionKey(0);
    clearSignatureCanvas();
  }, []);

  const handleCloseModal = () => {
    if (saving) return;
    onClose();
    resetModalState();
  };

  const handleIneCaptureSuccess = useCallback((result: NubariumIdCaptureResult) => {
    setIneExecutionId(result.executionId);
    setIneFrontImage(result.frontDataUrl);
    setIneBackImage(result.backDataUrl);
    setOcrPreview(result.ocrPreview);
  }, []);

  const handleIneCaptureReset = useCallback(() => {
    setIneExecutionId(null);
    setIneFrontImage(null);
    setIneBackImage(null);
    setOcrPreview(null);
    setIneCaptureSessionKey((current) => current + 1);
  }, []);

  const handleLivenessSuccess = useCallback((result: { executionId: string; faceDataUrl: string }) => {
    setLivenessExecutionId(result.executionId);
    setSelfieImage(result.faceDataUrl);
  }, []);

  const handleLivenessReset = useCallback(() => {
    setLivenessExecutionId(null);
    setSelfieImage(null);
    setLivenessCaptureSessionKey((current) => current + 1);
  }, []);

  const goToNextStep = async (): Promise<void> => {
    if (!canContinue) return;

    if (activeStep === "ine-capture" && !sdkToken) {
      await reloadToken();
    }

    if (activeStep === "liveness" && !sdkToken) {
      await reloadToken();
    }

    if (isLastStep) {
      setSaving(true);
      try {
        await onFinalize({
          ineFrontImage,
          ineBackImage,
          selfieImage,
          ineExecutionId,
          livenessExecutionId,
          ocrPreview,
          fingerprintConfirmed,
          signatureDataUrl: signatureCanvasRef.current?.toDataURL("image/png") ?? null,
          completedAt: new Date().toISOString(),
        });
        resetModalState();
        onClose();
      } catch {
      } finally {
        setSaving(false);
      }
      return;
    }

    const nextStep = STEP_ORDER[currentStepIndex + 1];
    setActiveStep(nextStep);
  };

  const getCanvasCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const handleStartDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const { x, y } = getCanvasCoordinates(event);
    context.beginPath();
    context.moveTo(x, y);
    isDrawingRef.current = true;
  };

  const handleDraw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = signatureCanvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const { x, y } = getCanvasCoordinates(event);
    context.lineTo(x, y);
    context.strokeStyle = "#111827";
    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
    setSignatureDrawn(true);
  };

  const handleEndDrawing = () => {
    isDrawingRef.current = false;
  };

  const renderSdkBootstrapState = () => (
    <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ minHeight: "420px" }}>
      {sdkLoading && <CircularProgress />}
      <Typography variant="body2" textAlign="center">
        {sdkLoading
          ? "Preparando captura biométrica de Nubarium..."
          : (sdkError ?? "No fue posible inicializar el SDK de Nubarium.")}
      </Typography>
      {!sdkLoading && sdkError && (
        <Button variant="outlined" onClick={() => void reloadToken()}>
          Reintentar
        </Button>
      )}
    </Stack>
  );

  return (
    <SideModal
      open={open}
      onClose={handleCloseModal}
      title={stepContent.title}
      description={stepContent.subtitle}
      disableClose={saving}
      maxWidth="lg"
      fullWidth
      contentSx={{
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        spacing={3}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        <Stack spacing={3} sx={{ minHeight: "600px" }}>
          {activeStep === "ine-capture" && (
            <Stack spacing={3}>
              {!sdkReady || !sdkToken
                ? renderSdkBootstrapState()
                : (
                  <NubariumIdCapture
                    key={ineCaptureSessionKey}
                    token={sdkToken}
                    active={open && activeStep === "ine-capture"}
                    completed={Boolean(ineFrontImage && ineBackImage)}
                    completedResult={
                      ineFrontImage && ineBackImage
                        ? {
                          executionId: ineExecutionId ?? "",
                          frontDataUrl: ineFrontImage,
                          backDataUrl: ineBackImage,
                          ocrPreview: ocrPreview ?? null,
                        }
                        : null
                    }
                    onSuccess={handleIneCaptureSuccess}
                    onReset={handleIneCaptureReset}
                  />
                )}
            </Stack>
          )}

          {activeStep === "liveness" && (
            <Stack spacing={3}>
              {!sdkReady || !sdkToken
                ? renderSdkBootstrapState()
                : (
                  <NubariumFaceCapture
                    key={livenessCaptureSessionKey}
                    token={sdkToken}
                    active={open && activeStep === "liveness"}
                    completed={Boolean(selfieImage)}
                    completedResult={
                      selfieImage
                        ? {
                          executionId: livenessExecutionId ?? "",
                          faceDataUrl: selfieImage,
                        }
                        : null
                    }
                    onSuccess={handleLivenessSuccess}
                    onReset={handleLivenessReset}
                  />
                )}
            </Stack>
          )}

          {activeStep === "fingerprint" && (
            <Stack spacing={3} alignItems="center" justifyContent="center" sx={{ flex: 1 }}>
              <Fingerprint size={160} color="#22c55e" />
              <Typography variant="h5">Dedo índice registrado</Typography>
              <Button
                variant={fingerprintConfirmed ? "contained" : "outlined"}
                onClick={() => setFingerprintConfirmed(true)}
              >
                {fingerprintConfirmed ? "Huella confirmada" : "Confirmar huella"}
              </Button>
            </Stack>
          )}

          {activeStep === "signature" && (
            <Stack spacing={3} alignItems="flex-end">
              <Typography variant="h5">
                Para continuar con el proceso, solicita la autorización para revisar el
                historial crediticio del cliente a través del Buró de Crédito.
              </Typography>
              <Stack style={{ borderRadius: "16px", overflow: "hidden" }}>
                <canvas
                  ref={signatureCanvasRef}
                  width={900}
                  height={400}
                  style={{
                    width: "100%",
                    backgroundColor: theme.palette.background.paper,
                    cursor: saving ? "not-allowed" : "crosshair",
                  }}
                  onMouseDown={saving ? undefined : handleStartDrawing}
                  onMouseMove={saving ? undefined : handleDraw}
                  onMouseUp={saving ? undefined : handleEndDrawing}
                  onMouseLeave={saving ? undefined : handleEndDrawing}
                />
              </Stack>
              <Typography variant="body1" textAlign="center" alignSelf="center">
                Autorizo la revisión y consulta de mi historial crediticio a Foly Muebles
                S.A. de C.V.
              </Typography>
              <Button
                variant="text"
                startIcon={<PenSquare size={16} />}
                onClick={clearSignatureCanvas}
                disabled={saving}
              >
                Limpiar firma
              </Button>
            </Stack>
          )}
        </Stack>
      </Stack>

      <Box
        sx={{
          flexShrink: 0,
          backgroundColor: theme.palette.background.paper,
          py: 1,
          zIndex: 2,
          position: "relative",
        }}
      >
        <Button
          fullWidth
          variant="contained"
          onClick={goToNextStep}
          disabled={!canContinue || saving || (activeStep !== "fingerprint" && activeStep !== "signature" && sdkLoading)}
        >
          {saving
            ? <CircularProgress size={20} color="inherit" />
            : (isLastStep ? "Finalizar" : "Siguiente")}
        </Button>
      </Box>
    </SideModal>
  );
}
