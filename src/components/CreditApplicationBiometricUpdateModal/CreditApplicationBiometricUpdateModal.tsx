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
import {
  updateCreditApplicationFaceBiometrics,
  updateCreditApplicationIneBiometrics,
} from "@/services/creditApplications.service";
import { releaseCameraHardware } from "@/utils/cameraDevices";
import {
  FACE_MATCH_FAILURE_MESSAGE,
  formatFaceMatchScoreHint,
  imageUrlToDataUrl,
} from "@/utils/creditApplicationFaceMatch";
import { useSnackbarStore } from "@/store/useSnackbarStore";

export type BiometricUpdateMode = "ine" | "face";

interface CreditApplicationBiometricUpdateModalProps {
  open: boolean;
  mode: BiometricUpdateMode;
  applicationId: string;
  /** Signed URL of the current INE front image; required for face mode client-side compare. */
  existingIneFrontUrl?: string | null;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

export function CreditApplicationBiometricUpdateModal({
  open,
  mode,
  applicationId,
  existingIneFrontUrl,
  onClose,
  onSuccess,
}: CreditApplicationBiometricUpdateModalProps) {
  const isCoarsePointer = useMediaQuery("(pointer: coarse)");
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

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

  const preferFacing = mode === "face" ? "user" : "environment";
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
    && mode === "ine"
    && !ineCompleted
    && (ineCaptureStarted || canAutoStartCapture);
  const livenessCaptureLive =
    open
    && mode === "face"
    && !livenessCompleted
    && !verifyingFaceMatch
    && !faceMatchError
    && (livenessCaptureStarted || canAutoStartCapture);

  const title = mode === "ine" ? "Actualizar INE" : "Actualizar prueba de vida";
  const subtitle =
    mode === "ine"
      ? "Vuelve a capturar la identificación oficial del cliente"
      : "Confirma la identidad del cliente contra el INE frontal";

  const canSave = useMemo(() => {
    if (mode === "ine") return Boolean(ineFrontImage && ineBackImage);
    return Boolean(selfieImage) && !verifyingFaceMatch && !faceMatchError;
  }, [faceMatchError, ineBackImage, ineFrontImage, mode, selfieImage, verifyingFaceMatch]);

  const resetModalState = useCallback(() => {
    releaseCameraHardware();
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
      const ineFrontForCompare = existingIneFrontUrl?.trim();
      if (!ineFrontForCompare) {
        setFaceMatchError(
          "Falta la captura del INE frontal para verificar la identidad.",
        );
        setFaceMatchScoreHint(null);
        return;
      }

      setVerifyingFaceMatch(true);
      setFaceMatchError(null);
      setFaceMatchScoreHint(null);
      try {
        const ineFrontDataUrl = await imageUrlToDataUrl(ineFrontForCompare);
        const match = await compareIneFace(ineFrontDataUrl, result.faceDataUrl);
        if (!match.isMatch) {
          setFaceMatchError(match.message ?? FACE_MATCH_FAILURE_MESSAGE);
          setFaceMatchScoreHint(
            formatFaceMatchScoreHint(match.score, match.threshold),
          );
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
    [existingIneFrontUrl],
  );

  const handleSave = async () => {
    if (!canSave || saving || verifyingFaceMatch) return;
    setSaving(true);
    setSubmitError(null);
    try {
      if (mode === "ine") {
        if (!ineFrontImage || !ineBackImage) return;
        const result = await updateCreditApplicationIneBiometrics(applicationId, {
          ineExecutionId,
          ineFrontImage,
          ineBackImage,
        });
        showSuccess(result.message);
      } else {
        if (!selfieImage) return;
        const result = await updateCreditApplicationFaceBiometrics(applicationId, {
          livenessExecutionId,
          faceCaptureImage: selfieImage,
        });
        showSuccess(result.message);
      }
      await onSuccess();
      resetModalState();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo guardar la captura biométrica. Intenta nuevamente.";
      setSubmitError(message);
      showError(message);
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
        {mode === "ine" ? "Identificación oficial" : "Prueba de vida"}
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

  const missingIneFrontForFace = mode === "face" && !existingIneFrontUrl?.trim();

  return (
    <SideModal
      open={open}
      onClose={handleCloseModal}
      title={title}
      description={subtitle}
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
          overflowY: "hidden",
        }}
      >
        {missingIneFrontForFace ? (
          <StepContent>
            <CaptureErrorState>
              <Typography variant="body2" color="error.main" textAlign="center">
                Debe existir el INE frontal antes de capturar la prueba de vida.
              </Typography>
            </CaptureErrorState>
          </StepContent>
        ) : null}

        {mode === "ine" && !missingIneFrontForFace ? (
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
        ) : null}

        {mode === "face" && !missingIneFrontForFace ? (
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
                    onSuccess={(result) => {
                      void handleLivenessSuccess(result);
                    }}
                    onReset={handleLivenessReset}
                  />
                ) : null}
              </CaptureStepRoot>
            )}
          </StepContent>
        ) : null}

        {submitError ? (
          <Typography variant="body2" color="error.main" sx={{ px: 2, pb: 1 }}>
            {submitError}
          </Typography>
        ) : null}
      </StepContainer>

      <FooterActions>
        <Button
          variant="outlined"
          onClick={handleCloseModal}
          disabled={saving || verifyingFaceMatch}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSave()}
          disabled={!canSave || saving || verifyingFaceMatch || missingIneFrontForFace}
          sx={{ minWidth: 140 }}
        >
          {saving ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Guardar captura"
          )}
        </Button>
      </FooterActions>
    </SideModal>
  );
}
