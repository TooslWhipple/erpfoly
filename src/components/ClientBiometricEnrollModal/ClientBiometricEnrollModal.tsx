import { useCallback, useMemo, useState } from "react";
import { Button, CircularProgress, Typography, useMediaQuery } from "@mui/material";
import { CameraDeviceSelect, CameraSwitchControl } from "@/components/CameraDeviceSelect";
import { SideModal } from "@/components/SideModal";
import { SALES_POS_BREAKPOINT } from "@/lib/layoutBreakpoints";
import { NubariumFaceCapture } from "@/components/NubariumFaceCapture";
import { NubariumIdCapture, type NubariumIdCaptureResult } from "@/components/NubariumIdCapture";
import { CaptureStepRoot, CaptureErrorState } from "@/components/NubariumCapturePreview/styles";
import {
  FooterActions,
  SdkBootstrapState,
  StepContainer,
  StepContent,
  StepProgress,
  StepProgressRow,
} from "@/components/CreditApplicationIntakeModal/styles";
import { useCameraDevices } from "@/hooks/useCameraDevices";
import { useNubariumSdk } from "@/hooks/useNubariumSdk";
import { compareIneFace } from "@/services/nubarium.service";
import { enrollClientBiometrics } from "@/services/clients.service";
import { releaseCameraHardware } from "@/utils/cameraDevices";
import {
  FACE_MATCH_FAILURE_MESSAGE,
  formatFaceMatchScoreHint,
} from "@/utils/creditApplicationFaceMatch";

interface ClientBiometricEnrollModalProps {
  open: boolean;
  clientId: number;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

type EnrollStepId = "ine-capture" | "liveness";

const STEP_ORDER: EnrollStepId[] = ["ine-capture", "liveness"];

const STEP_TITLES: Record<EnrollStepId, { title: string; subtitle: string; progressLabel: string }> = {
  "ine-capture": {
    title: "Identificación oficial",
    subtitle: "Captura la INE del cliente",
    progressLabel: "Identificación oficial",
  },
  liveness: {
    title: "Prueba de vida",
    subtitle: "Confirma que el rostro coincide con la INE",
    progressLabel: "Prueba de vida",
  },
};

export function ClientBiometricEnrollModal({
  open,
  clientId,
  onClose,
  onSuccess,
}: ClientBiometricEnrollModalProps) {
  const isCoarsePointer = useMediaQuery("(pointer: coarse)");
  const [activeStep, setActiveStep] = useState<EnrollStepId>("ine-capture");
  const [ineExecutionId, setIneExecutionId] = useState<string | null>(null);
  const [ineFrontImage, setIneFrontImage] = useState<string | null>(null);
  const [ineBackImage, setIneBackImage] = useState<string | null>(null);
  const [livenessExecutionId, setLivenessExecutionId] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [ineCaptureSessionKey, setIneCaptureSessionKey] = useState(0);
  const [livenessCaptureSessionKey, setLivenessCaptureSessionKey] = useState(0);
  const [ineCaptureStarted, setIneCaptureStarted] = useState(false);
  const [livenessCaptureStarted, setLivenessCaptureStarted] = useState(false);
  const [verifyingFaceMatch, setVerifyingFaceMatch] = useState(false);
  const [faceMatchError, setFaceMatchError] = useState<string | null>(null);
  const [faceMatchScoreHint, setFaceMatchScoreHint] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { isReady: sdkReady, isLoading: sdkLoading, token: sdkToken, error: sdkError, reloadToken } =
    useNubariumSdk({ enabled: open });

  const preferFacing = activeStep === "liveness" ? "user" : "environment";
  const cameras = useCameraDevices({
    enabled: open,
    preferFacing,
  });

  const ineCompleted = Boolean(ineFrontImage && ineBackImage);
  const livenessCompleted = Boolean(selfieImage) && !verifyingFaceMatch;
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
    && !verifyingFaceMatch
    && !faceMatchError
    && (livenessCaptureStarted || canAutoStartCapture);

  const currentStepIndex = STEP_ORDER.indexOf(activeStep);
  const isLastStep = currentStepIndex === STEP_ORDER.length - 1;
  const stepContent = STEP_TITLES[activeStep];

  const canContinue = useMemo(() => {
    if (activeStep === "ine-capture") return Boolean(ineFrontImage && ineBackImage);
    return Boolean(selfieImage) && !verifyingFaceMatch && !faceMatchError;
  }, [
    activeStep,
    faceMatchError,
    ineBackImage,
    ineFrontImage,
    selfieImage,
    verifyingFaceMatch,
  ]);

  const resetModalState = useCallback(() => {
    releaseCameraHardware();
    setActiveStep("ine-capture");
    setIneExecutionId(null);
    setIneFrontImage(null);
    setIneBackImage(null);
    setLivenessExecutionId(null);
    setSelfieImage(null);
    setIneCaptureSessionKey(0);
    setLivenessCaptureSessionKey(0);
    setIneCaptureStarted(false);
    setLivenessCaptureStarted(false);
    setVerifyingFaceMatch(false);
    setFaceMatchError(null);
    setFaceMatchScoreHint(null);
    setSubmitError(null);
  }, []);

  const handleCloseModal = () => {
    if (saving || verifyingFaceMatch) return;
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

  const handleLivenessReset = useCallback(() => {
    setLivenessExecutionId(null);
    setSelfieImage(null);
    setFaceMatchError(null);
    setFaceMatchScoreHint(null);
    setVerifyingFaceMatch(false);
    setLivenessCaptureSessionKey((current) => current + 1);
  }, []);

  const handleLivenessSuccess = useCallback(
    async (result: { executionId: string; faceDataUrl: string }) => {
      if (!ineFrontImage) {
        setFaceMatchError("Falta la captura del INE para verificar la identidad.");
        setFaceMatchScoreHint(null);
        return;
      }

      setVerifyingFaceMatch(true);
      setFaceMatchError(null);
      setFaceMatchScoreHint(null);
      try {
        const match = await compareIneFace(ineFrontImage, result.faceDataUrl);
        if (!match.isMatch) {
          setFaceMatchError(match.message ?? FACE_MATCH_FAILURE_MESSAGE);
          setFaceMatchScoreHint(formatFaceMatchScoreHint(match.score, match.threshold));
          setLivenessExecutionId(null);
          setSelfieImage(null);
          return;
        }
        setLivenessExecutionId(result.executionId);
        setSelfieImage(result.faceDataUrl);
      } catch (err) {
        setFaceMatchError(
          err instanceof Error ? err.message : FACE_MATCH_FAILURE_MESSAGE,
        );
        setFaceMatchScoreHint(null);
        setLivenessExecutionId(null);
        setSelfieImage(null);
      } finally {
        setVerifyingFaceMatch(false);
      }
    },
    [ineFrontImage],
  );

  const goToNextStep = async (): Promise<void> => {
    if (!canContinue || verifyingFaceMatch) return;

    if (!sdkToken) {
      await reloadToken();
    }

    if (!isLastStep) {
      setActiveStep(STEP_ORDER[currentStepIndex + 1]);
      return;
    }

    if (!ineFrontImage || !ineBackImage || !selfieImage) return;

    setSaving(true);
    setSubmitError(null);
    try {
      await enrollClientBiometrics(clientId, {
        ineFrontImage,
        ineBackImage,
        selfieImage,
        ineExecutionId,
        livenessExecutionId,
      });
      await onSuccess();
      resetModalState();
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la biometría. Intenta nuevamente.",
      );
    } finally {
      setSaving(false);
    }
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
          overflow: "hidden",
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
                {!livenessCompleted && !livenessCaptureLive && !verifyingFaceMatch && !faceMatchError
                  ? renderCameraSelect(
                    startLivenessCapture,
                    "Elige la cámara que te parezca mejor. La recordaremos en este dispositivo.",
                    "Iniciar prueba de vida",
                  )
                  : null}
                {verifyingFaceMatch ? (
                  <SdkBootstrapState>
                    <CircularProgress size={28} />
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Verificando identidad…
                    </Typography>
                  </SdkBootstrapState>
                ) : null}
                {faceMatchError ? (
                  <CaptureErrorState>
                    <Typography variant="body2" color="error.main" textAlign="center">
                      {faceMatchError}
                    </Typography>
                    {faceMatchScoreHint ? (
                      <Typography variant="caption" color="text.secondary" textAlign="center">
                        {faceMatchScoreHint}
                      </Typography>
                    ) : null}
                    <Button variant="outlined" onClick={handleLivenessReset}>
                      Reintentar captura
                    </Button>
                  </CaptureErrorState>
                ) : null}
                {(livenessCaptureLive || livenessCompleted) && !verifyingFaceMatch && !faceMatchError ? (
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
                    onSuccess={handleLivenessSuccess}
                    onReset={handleLivenessReset}
                  />
                ) : null}
              </CaptureStepRoot>
            )}
          </StepContent>
        )}
      </StepContainer>

      <FooterActions>
        {submitError ? (
          <Typography variant="body2" color="error.main" textAlign="center" sx={{ width: "100%" }}>
            {submitError}
          </Typography>
        ) : null}
        <Button
          fullWidth
          variant="contained"
          onClick={() => void goToNextStep()}
          disabled={!canContinue || saving || verifyingFaceMatch || sdkLoading}
        >
          {saving || verifyingFaceMatch ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            isLastStep ? "Guardar biometría" : "Siguiente"
          )}
        </Button>
      </FooterActions>
    </SideModal>
  );
}
