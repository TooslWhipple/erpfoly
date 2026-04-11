import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button, Stack, Typography } from "@mui/material";
import { Fingerprint, PenSquare } from "lucide-react";
import { SideModal } from "@/components/SideModal";
import { colors } from "@/styles/theme";
import type { CreditApplicationBiometricsData } from "@/types/credit-application-form.types";

interface CreditApplicationIntakeModalProps {
  open: boolean;
  onClose: () => void;
  /** Persist intake to the server; on failure, throw so the modal stays open for retry. */
  onFinalize: (payload: CreditApplicationBiometricsData) => Promise<void>;
}

type IntakeStepId = "ine-front" | "ine-back" | "selfie" | "fingerprint" | "signature";

const STEP_ORDER: IntakeStepId[] = [
  "ine-front",
  "ine-back",
  "selfie",
  "fingerprint",
  "signature",
];

const STEP_TITLES: Record<IntakeStepId, { title: string; subtitle: string }> = {
  "ine-front": {
    title: "Nuevo cliente",
    subtitle: "Captura la parte frontal de la INE del cliente",
  },
  "ine-back": {
    title: "Nuevo cliente",
    subtitle: "Captura la parte posterior de la INE del cliente",
  },
  selfie: {
    title: "Nuevo cliente",
    subtitle: "Captura una fotografía de la cara de la persona",
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
  const [activeStep, setActiveStep] = useState<IntakeStepId>("ine-front");
  const [ineImageDataUrl, setIneImageDataUrl] = useState<string | null>(null);
  const [ineBackImageDataUrl, setIneBackImageDataUrl] = useState<string | null>(null);
  const [selfieImageDataUrl, setSelfieImageDataUrl] = useState<string | null>(null);
  const [fingerprintConfirmed, setFingerprintConfirmed] = useState(false);
  const [signatureDrawn, setSignatureDrawn] = useState(false);
  const [saving, setSaving] = useState(false);

  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  const currentStepIndex = STEP_ORDER.indexOf(activeStep);
  const isLastStep = currentStepIndex === STEP_ORDER.length - 1;

  const stepContent = STEP_TITLES[activeStep];

  const canContinue = useMemo(() => {
    if (activeStep === "ine-front") return Boolean(ineImageDataUrl);
    if (activeStep === "ine-back") return Boolean(ineBackImageDataUrl);
    if (activeStep === "selfie") return Boolean(selfieImageDataUrl);
    if (activeStep === "fingerprint") return fingerprintConfirmed;
    return signatureDrawn;
  }, [
    activeStep,
    fingerprintConfirmed,
    ineBackImageDataUrl,
    ineImageDataUrl,
    selfieImageDataUrl,
    signatureDrawn,
  ]);

  const goToNextStep = async (): Promise<void> => {
    if (!canContinue) return;

    if (isLastStep) {
      setSaving(true);
      try {
        await onFinalize({
          ineFrontImage: ineImageDataUrl,
          ineBackImage: ineBackImageDataUrl,
          selfieImage: selfieImageDataUrl,
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

  const resetModalState = () => {
    setActiveStep("ine-front");
    setIneImageDataUrl(null);
    setIneBackImageDataUrl(null);
    setSelfieImageDataUrl(null);
    setFingerprintConfirmed(false);
    setSignatureDrawn(false);
    clearSignatureCanvas();
  };

  const handleCloseModal = () => {
    if (saving) return;
    onClose();
    resetModalState();
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

  const clearSignatureCanvas = () => {
    const canvas = signatureCanvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDrawn(false);
  };

  return (
    <SideModal
      open={open}
      onClose={handleCloseModal}
      title={stepContent.title}
      description={stepContent.subtitle}
      disableClose={saving}
      maxWidth="lg"
      fullWidth
    >
      <Stack spacing={3} sx={{ minHeight: 600 }}>
        {activeStep === "ine-front" && (
          <Stack spacing={3}>
            <DeviceCameraCapture
              facingMode="environment"
              capturedImage={ineImageDataUrl}
              onCapture={setIneImageDataUrl}
              onRetake={() => setIneImageDataUrl(null)}
              imageAlt="INE frontal"
              cameraIndication="Acerca más la INE para que sea más legible"
            />
          </Stack>
        )}
        {activeStep === "ine-back" && (
          <Stack spacing={3}>
            <DeviceCameraCapture
              facingMode="environment"
              capturedImage={ineBackImageDataUrl}
              onCapture={setIneBackImageDataUrl}
              onRetake={() => setIneBackImageDataUrl(null)}
              imageAlt="INE posterior"
              cameraIndication="Asegúrate de capturar claramente el reverso de la INE"
            />
          </Stack>
        )}

        {activeStep === "selfie" && (
          <Stack spacing={3}>
            <DeviceCameraCapture
              facingMode="user"
              capturedImage={selfieImageDataUrl}
              onCapture={setSelfieImageDataUrl}
              onRetake={() => setSelfieImageDataUrl(null)}
              imageAlt="Selfie del cliente"
            />
            <Typography variant="h6" textAlign="center">
              Asegúrate de enfocar la cara dentro de la zona marcada
            </Typography>
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
            <Stack
              style={{
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <canvas
                ref={signatureCanvasRef}
                width={900}
                height={400}
                style={{
                  width: "100%",
                  backgroundColor: colors.background.sidebar,
                  cursor: "crosshair",
                }}
                onMouseDown={handleStartDrawing}
                onMouseMove={handleDraw}
                onMouseUp={handleEndDrawing}
                onMouseLeave={handleEndDrawing}
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
            >
              Limpiar firma
            </Button>
          </Stack>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={goToNextStep}
          disabled={!canContinue || saving}
        >
          {isLastStep ? "Finalizar" : "Continuar"}
        </Button>
      </Stack>
    </SideModal>
  );
}

interface DeviceCameraCaptureProps {
  facingMode: "user" | "environment";
  capturedImage: string | null;
  onCapture: (imageDataUrl: string) => void;
  onRetake: () => void;
  imageAlt: string;
  cameraIndication?: string | null;
}

function DeviceCameraCapture({
  facingMode,
  capturedImage,
  onCapture,
  onRetake,
  imageAlt,
  cameraIndication,
}: DeviceCameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const stopCurrentStream = () => {
      if (!streamRef.current) return;
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };

    const startCamera = async () => {
      if (capturedImage) {
        stopCurrentStream();
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Tu dispositivo no soporta captura de cámara en este navegador.");
        return;
      }

      try {
        stopCurrentStream();
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });

        if (isCancelled) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }
        setCameraError(null);
      } catch (error) {
        console.error("[DeviceCameraCapture] Unable to access camera", error);
        if (!isCancelled) {
          setCameraError(
            "No fue posible acceder a la cámara. Revisa permisos del dispositivo.",
          );
        }
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
      stopCurrentStream();
    };
  }, [capturedImage, facingMode]);

  const handleCapture = () => {
    if (capturedImage) {
      onRetake();
      return;
    }

    const videoElement = videoRef.current;
    const canvas = captureCanvasRef.current;
    if (!videoElement || !canvas) return;

    const width = videoElement.videoWidth || 1280;
    const height = videoElement.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(videoElement, 0, 0, width, height);

    onCapture(canvas.toDataURL("image/png"));
  };

  const captureDisabled = !capturedImage && Boolean(cameraError);

  return (
    <Stack spacing={2} alignItems="center">
      <Stack
        justifyContent="center"
        alignItems="center"
        spacing={2}
        sx={{
          borderRadius: "16px",
          width: "100%",
          minHeight: "400px",
          backgroundColor: colors.background.main,
          overflow: "hidden",
        }}
      >
        {capturedImage ? (
          <Image
            src={capturedImage}
            alt={imageAlt}
            width={920}
            height={400}
            unoptimized
            style={{
              width: "100%",
              maxHeight: "400px",
              objectFit: "cover",
              borderRadius: "16px",
              height: "auto",
            }}
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "100%",
              maxHeight: "400px",
              borderRadius: "16px",
              backgroundColor: "#111827",
              objectFit: "cover",
            }}
          />
        )}
      </Stack>

      {cameraError && (
        <Typography variant="body2" color="error.main">
          {cameraError}
        </Typography>
      )}

      {cameraIndication && (
        <Typography variant="subtitle2" textAlign="center">
          {cameraIndication}
        </Typography>
      )}

      <button
        type="button"
        onClick={handleCapture}
        disabled={captureDisabled}
        aria-label={capturedImage ? "Retomar fotografía" : "Tomar fotografía"}
        style={{
          width: "88px",
          height: "88px",
          borderRadius: "50%",
          backgroundColor: "#DC2626",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: captureDisabled ? "not-allowed" : "pointer",
          opacity: captureDisabled ? 0.5 : 1,
        }}
      >
        <span
          style={{
            border: "4px solid #FFFFFF",
            width: "78px",
            height: "78px",
            borderRadius: "50%",
            backgroundColor: "#DC2626",
          }}
        />
      </button>

      <canvas ref={captureCanvasRef} style={{ display: "none" }} />
    </Stack>
  );
}
