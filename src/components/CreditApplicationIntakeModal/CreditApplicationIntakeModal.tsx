import { useCallback, useMemo, useRef, useState } from "react";
import { Button, CircularProgress, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { PenSquare } from "lucide-react";
import { CameraDeviceSelect, CameraSwitchControl } from "@/components/CameraDeviceSelect";
import { SideModal } from "@/components/SideModal";
import { SALES_POS_BREAKPOINT } from "@/lib/layoutBreakpoints";
import { NubariumFaceCapture } from "@/components/NubariumFaceCapture";
import { NubariumIdCapture, type NubariumIdCaptureResult } from "@/components/NubariumIdCapture";
import { CaptureStepRoot } from "@/components/NubariumCapturePreview/styles";
import { useCameraDevices } from "@/hooks/useCameraDevices";
import { useNubariumSdk } from "@/hooks/useNubariumSdk";
import { releaseCameraHardware } from "@/utils/cameraDevices";
import type { CreditApplicationBiometricsData } from "@/types/credit-application-form.types";
import {
  FooterActions,
  SdkBootstrapState,
  SignatureCanvas,
  SignatureCanvasWrapper,
  SignatureLegalText,
  SignatureSection,
  StepContainer,
  StepContent,
  StepProgress,
  StepProgressRow,
} from "./styles";

interface CreditApplicationIntakeModalProps {
  open: boolean;
  onClose: () => void;
  /** Persist intake to the server; on failure, throw so the modal stays open for retry. */
  onFinalize: (payload: CreditApplicationBiometricsData) => Promise<void>;
}

type IntakeStepId = "ine-capture" | "liveness" | "signature";

const STEP_ORDER: IntakeStepId[] = [
  "ine-capture",
  "liveness",
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
  const isCoarsePointer = useMediaQuery("(pointer: coarse)");
  const [activeStep, setActiveStep] = useState<IntakeStepId>("ine-capture");
  const [ineExecutionId, setIneExecutionId] = useState<string | null>(null);
  const [ineFrontImage, setIneFrontImage] = useState<string | null>(null);
  const [ineBackImage, setIneBackImage] = useState<string | null>(null);
  const [livenessExecutionId, setLivenessExecutionId] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [signatureDrawn, setSignatureDrawn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ineCaptureSessionKey, setIneCaptureSessionKey] = useState(0);
  const [livenessCaptureSessionKey, setLivenessCaptureSessionKey] = useState(0);
  const [ineCaptureStarted, setIneCaptureStarted] = useState(false);
  const [livenessCaptureStarted, setLivenessCaptureStarted] = useState(false);

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

  const preferFacing = activeStep === "liveness" ? "user" : "environment";
  const cameras = useCameraDevices({
    enabled: open && activeStep !== "signature",
    preferFacing,
  });

  const ineCompleted = Boolean(ineFrontImage && ineBackImage);
  const livenessCompleted = Boolean(selfieImage);
  const canAutoStartCapture =
    cameras.preferenceHydrated
    && cameras.permissionGranted
    && Boolean(cameras.selectedDeviceId)
    && Boolean(sdkReady && sdkToken)
    && (cameras.hasRememberedPreference || cameras.devices.length === 1);

  const ineCaptureLive =
    open
    && activeStep === "ine-capture"
    && !ineCompleted
    && (ineCaptureStarted || canAutoStartCapture);
  const livenessCaptureLive =
    open
    && activeStep === "liveness"
    && !livenessCompleted
    && (livenessCaptureStarted || canAutoStartCapture);

  const currentStepIndex = STEP_ORDER.indexOf(activeStep);
  const isLastStep = currentStepIndex === STEP_ORDER.length - 1;
  const stepContent = STEP_TITLES[activeStep];

  const canContinue = useMemo(() => {
    if (activeStep === "ine-capture") return Boolean(ineFrontImage && ineBackImage);
    if (activeStep === "liveness") return Boolean(selfieImage);
    return signatureDrawn;
  }, [
    activeStep,
    ineBackImage,
    ineFrontImage,
    selfieImage,
    signatureDrawn,
  ]);

  const resetModalState = useCallback(() => {
    releaseCameraHardware();
    setActiveStep("ine-capture");
    setIneExecutionId(null);
    setIneFrontImage(null);
    setIneBackImage(null);
    setLivenessExecutionId(null);
    setSelfieImage(null);
    setSignatureDrawn(false);
    setIneCaptureSessionKey(0);
    setLivenessCaptureSessionKey(0);
    setIneCaptureStarted(false);
    setLivenessCaptureStarted(false);
    clearSignatureCanvas();
  }, []);

  const handleCloseModal = () => {
    if (saving) return;
    releaseCameraHardware();
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

  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (saving) return;
    const canvas = signatureCanvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const { x, y } = getCanvasCoordinates(event.clientX, event.clientY);
    context.beginPath();
    context.moveTo(x, y);
    isDrawingRef.current = true;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || saving) return;
    const canvas = signatureCanvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    event.preventDefault();
    const { x, y } = getCanvasCoordinates(event.clientX, event.clientY);
    context.lineTo(x, y);
    context.strokeStyle = theme.palette.text.primary;
    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
    setSignatureDrawn(true);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (signatureCanvasRef.current?.hasPointerCapture(event.pointerId)) {
      signatureCanvasRef.current.releasePointerCapture(event.pointerId);
    }
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

  const captureLive = ineCaptureLive || livenessCaptureLive;

  const startIneCapture = () => {
    cameras.commitPreferredDevice();
    setIneCaptureStarted(true);
  };

  const startLivenessCapture = () => {
    cameras.commitPreferredDevice();
    setLivenessCaptureStarted(true);
  };

  const stepProgressHeader = (
    <StepProgressRow>
      <StepProgress variant="body2">
        {`Paso ${currentStepIndex + 1} de ${STEP_ORDER.length} · ${stepContent.progressLabel}`}
      </StepProgress>
      {captureLive ? (
        <CameraSwitchControl
          devices={cameras.devices}
          value={cameras.selectedDeviceId}
          onChange={cameras.selectAndRemember}
          disabled={saving}
        />
      ) : null}
    </StepProgressRow>
  );

  const renderCameraSelect = (onStart: () => void, helperText: string, startLabel: string) => (
    <CameraDeviceSelect
      devices={cameras.devices}
      value={cameras.selectedDeviceId}
      onChange={cameras.selectDevice}
      helperText={helperText}
      loading={cameras.isLoading}
      errorMessage={cameras.errorMessage}
      needsPermission={
        !cameras.isLoading && (cameras.needsUserGesture || !cameras.permissionGranted)
      }
      onRequestPermission={() => void cameras.requestPermission()}
      onStart={onStart}
      startLabel={startLabel}
      disabled={saving}
    />
  );

  return (
    <SideModal
      open={open}
      onClose={handleCloseModal}
      title={stepContent.title}
      description={stepContent.subtitle}
      headerContent={stepProgressHeader}
      disableClose={saving}
      maxWidth="lg"
      fullWidth
      fullScreenBreakpoint={SALES_POS_BREAKPOINT}
      forceFullScreen={isCoarsePointer}
      contentSx={{
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <StepContainer
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: activeStep === "signature" ? "auto" : "hidden",
        }}
      >
        {activeStep === "ine-capture" && (
          <StepContent>
            {!sdkReady || !sdkToken ? (
              renderSdkBootstrapState()
            ) : (
              <CaptureStepRoot>
                {!ineCompleted && !ineCaptureLive
                  ? renderCameraSelect(
                      startIneCapture,
                      "Elige la cámara que te parezca mejor. La recordaremos en este dispositivo.",
                      "Iniciar captura de INE",
                    )
                  : null}
                {ineCaptureLive || ineCompleted ? (
                  <NubariumIdCapture
                    key={`${ineCaptureSessionKey}-${cameras.selectedDeviceId}`}
                    token={sdkToken}
                    active={ineCaptureLive}
                    completed={ineCompleted}
                    completedResult={
                      ineFrontImage && ineBackImage
                        ? {
                            executionId: ineExecutionId ?? "",
                            frontDataUrl: ineFrontImage,
                            backDataUrl: ineBackImage,
                          }
                        : null
                    }
                    videoDeviceId={cameras.selectedDeviceId}
                    cameraFacing={cameras.selectedDevice?.facing}
                    onSuccess={handleIneCaptureSuccess}
                    onReset={handleIneCaptureReset}
                  />
                ) : null}
              </CaptureStepRoot>
            )}
          </StepContent>
        )}

        {activeStep === "liveness" && (
          <StepContent>
            {!sdkReady || !sdkToken ? (
              renderSdkBootstrapState()
            ) : (
              <CaptureStepRoot>
                {!livenessCompleted && !livenessCaptureLive
                  ? renderCameraSelect(
                      startLivenessCapture,
                      "Elige la cámara que te parezca mejor. La recordaremos en este dispositivo.",
                      "Iniciar prueba de vida",
                    )
                  : null}
                {livenessCaptureLive || livenessCompleted ? (
                  <NubariumFaceCapture
                    key={`${livenessCaptureSessionKey}-${cameras.selectedDeviceId}`}
                    token={sdkToken}
                    active={livenessCaptureLive}
                    completed={livenessCompleted}
                    completedResult={
                      selfieImage
                        ? {
                            executionId: livenessExecutionId ?? "",
                            faceDataUrl: selfieImage,
                          }
                        : null
                    }
                    videoDeviceId={cameras.selectedDeviceId}
                    cameraFacing={cameras.selectedDevice?.facing}
                    acceptFailedLiveness
                    onSuccess={handleLivenessSuccess}
                    onReset={handleLivenessReset}
                  />
                ) : null}
              </CaptureStepRoot>
            )}
          </StepContent>
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
                height={480}
                disabled={saving}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
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
            || (activeStep !== "signature" && sdkLoading)
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
