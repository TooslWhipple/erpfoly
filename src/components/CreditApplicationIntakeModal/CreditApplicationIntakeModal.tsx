import { useCallback, useMemo, useRef, useState } from "react";
import { Button, CircularProgress, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Fingerprint, PenSquare } from "lucide-react";
import { SideModal } from "@/components/SideModal";
import { NubariumFaceCapture } from "@/components/NubariumFaceCapture";
import { NubariumIdCapture, type NubariumIdCaptureResult } from "@/components/NubariumIdCapture";
import { useNubariumSdk } from "@/hooks/useNubariumSdk";
import type { CreditApplicationBiometricsData } from "@/types/credit-application-form.types";
import {
  FingerprintIconWrapper,
  FooterActions,
  SdkBootstrapState,
  SignatureCanvas,
  SignatureCanvasWrapper,
  SignatureLegalText,
  SignatureSection,
  StepContainer,
  StepContent,
  StepProgress,
  StepSection,
} from "./styles";

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

const STEP_TITLES: Record<IntakeStepId, { title: string; subtitle: string; progressLabel: string }> = {
  "ine-capture": {
    title: "Identificación oficial",
    subtitle: "Verifica la INE del cliente",
    progressLabel: "Identificación oficial",
  },
  liveness: {
    title: "Prueba de vida",
    subtitle: "Confirma la identidad del cliente",
    progressLabel: "Prueba de vida",
  },
  fingerprint: {
    title: "Huella digital",
    subtitle: "Registra la huella del cliente",
    progressLabel: "Huella digital",
  },
  signature: {
    title: "Autorización de Buró",
    subtitle: "Firma del cliente para consulta crediticia",
    progressLabel: "Autorización de Buró",
  },
};

export function CreditApplicationIntakeModal({
  open,
  onClose,
  onFinalize,
}: CreditApplicationIntakeModalProps) {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState<IntakeStepId>("ine-capture");
  const [ineExecutionId, setIneExecutionId] = useState<string | null>(null);
  const [ineFrontImage, setIneFrontImage] = useState<string | null>(null);
  const [ineBackImage, setIneBackImage] = useState<string | null>(null);
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
  }, []);

  const handleIneCaptureReset = useCallback(() => {
    setIneExecutionId(null);
    setIneFrontImage(null);
    setIneBackImage(null);
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
    context.strokeStyle = theme.palette.text.primary;
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
    <SdkBootstrapState>
      {sdkLoading ? <CircularProgress /> : null}
      <Typography variant="body2" textAlign="center">
        {sdkLoading
          ? "Preparando captura biométrica..."
          : (sdkError ?? "No fue posible inicializar la captura biométrica.")}
      </Typography>
      {!sdkLoading && sdkError ? (
        <Button variant="outlined" onClick={() => void reloadToken()}>
          Reintentar
        </Button>
      ) : null}
    </SdkBootstrapState>
  );

  const stepProgressHeader = (
    <StepProgress variant="body2">
      {`Paso ${currentStepIndex + 1} de ${STEP_ORDER.length} · ${stepContent.progressLabel}`}
    </StepProgress>
  );

  return (
    <SideModal
      open={open}
      onClose={handleCloseModal}
      title={stepContent.title}
      description={stepContent.subtitle}
      headerContent={stepProgressHeader}
      disableClose={saving}
      maxWidth="md"
      fullWidth
      contentSx={{
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <StepContainer sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        {activeStep === "ine-capture" && (
          <StepContent>
            {!sdkReady || !sdkToken ? (
              renderSdkBootstrapState()
            ) : (
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
                      }
                    : null
                }
                onSuccess={handleIneCaptureSuccess}
                onReset={handleIneCaptureReset}
              />
            )}
          </StepContent>
        )}

        {activeStep === "liveness" && (
          <StepContent>
            {!sdkReady || !sdkToken ? (
              renderSdkBootstrapState()
            ) : (
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
          </StepContent>
        )}

        {activeStep === "fingerprint" && (
          <StepSection>
            <FingerprintIconWrapper>
              <Fingerprint size={120} strokeWidth={1.25} />
            </FingerprintIconWrapper>
            <Typography variant="subtitle1">Dedo índice</Typography>
            <Button
              variant={fingerprintConfirmed ? "contained" : "outlined"}
              onClick={() => setFingerprintConfirmed(true)}
            >
              {fingerprintConfirmed ? "Huella confirmada" : "Confirmar huella"}
            </Button>
          </StepSection>
        )}

        {activeStep === "signature" && (
          <SignatureSection>
            <Typography variant="body2" color="text.secondary">
              Solicita la autorización del cliente para revisar su historial crediticio
              a través del Buró de Crédito.
            </Typography>
            <SignatureCanvasWrapper>
              <SignatureCanvas
                ref={signatureCanvasRef}
                width={900}
                height={296}
                disabled={saving}
                onMouseDown={saving ? undefined : handleStartDrawing}
                onMouseMove={saving ? undefined : handleDraw}
                onMouseUp={saving ? undefined : handleEndDrawing}
                onMouseLeave={saving ? undefined : handleEndDrawing}
              />
            </SignatureCanvasWrapper>
            <SignatureLegalText variant="body2">
              Autorizo la revisión y consulta de mi historial crediticio a Foly Muebles
              S.A. de C.V.
            </SignatureLegalText>
            <Button
              variant="text"
              startIcon={<PenSquare size={16} />}
              onClick={clearSignatureCanvas}
              disabled={saving}
              sx={{ alignSelf: "flex-end" }}
            >
              Limpiar firma
            </Button>
          </SignatureSection>
        )}
      </StepContainer>

      <FooterActions>
        <Button
          fullWidth
          variant="contained"
          onClick={goToNextStep}
          disabled={
            !canContinue
            || saving
            || (activeStep !== "fingerprint" && activeStep !== "signature" && sdkLoading)
          }
        >
          {saving ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            isLastStep ? "Finalizar" : "Siguiente"
          )}
        </Button>
      </FooterActions>
    </SideModal>
  );
}
