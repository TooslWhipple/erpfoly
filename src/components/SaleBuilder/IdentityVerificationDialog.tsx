"use client";

import { memo, useEffect, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import {
  NubariumFaceCapture,
  type NubariumFaceCaptureResult,
} from "@/components/NubariumFaceCapture";
import { useNubariumSdk } from "@/hooks/useNubariumSdk";
import {
  skipSaleIdentityVerification,
  verifySaleIdentity,
} from "@/services/ventas.service";
import {
  CameraOverlay,
  CameraOverlayStill,
  CameraStage,
  IdentityDialogContent,
} from "./IdentityVerificationDialog.styles";

type DialogView = "camera" | "skip";

interface IdentityVerificationDialogProps {
  open: boolean;
  saleId: number | null;
  onVerified: () => void;
  onClose: () => void;
}

export const IdentityVerificationDialog = memo(
  function IdentityVerificationDialog({
    open,
    saleId,
    onVerified,
    onClose,
  }: IdentityVerificationDialogProps) {
    const [view, setView] = useState<DialogView>("camera");
    const [captureSessionKey, setCaptureSessionKey] = useState(0);
    const [cameraInitialized, setCameraInitialized] = useState(false);

    const cameraViewActive = open && view === "camera";
    const {
      isLoading: sdkLoading,
      token: sdkToken,
      error: sdkError,
      reloadToken,
    } = useNubariumSdk({ enabled: cameraViewActive });

    useEffect(() => {
      if (!open) {
        setView("camera");
        setCameraInitialized(false);
      }
    }, [open]);

    useEffect(() => {
      if (!sdkToken) {
        setCameraInitialized(false);
      }
    }, [sdkToken]);

    const verifyMutation = useMutation({
      mutationFn: async (result: NubariumFaceCaptureResult) => {
        if (saleId == null) {
          throw new Error("No hay una venta activa para verificar identidad");
        }
        const res = await verifySaleIdentity(
          saleId,
          result.faceDataUrl,
          result.executionId,
        );
        if (res.error) throw new Error(res.error.message);
        return res.data!;
      },
      onSuccess: onVerified,
      onError: () => {
        setCameraInitialized(false);
        setCaptureSessionKey((current) => current + 1);
      },
    });

    const handleClose = () => {
      if (verifyMutation.isPending) return;
      onClose();
    };

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={view === "skip" ? "sm" : "md"}
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        <IdentityDialogContent>
          {view === "camera" ? (
            <CameraView
              sdkLoading={sdkLoading}
              sdkToken={sdkToken}
              sdkError={sdkError}
              reloadToken={reloadToken}
              captureSessionKey={captureSessionKey}
              cameraLive={cameraViewActive && Boolean(sdkToken)}
              cameraInitialized={cameraInitialized}
              onCameraInitialized={() => setCameraInitialized(true)}
              verifyPending={verifyMutation.isPending}
              verifyError={
                verifyMutation.isError ? verifyMutation.error.message : null
              }
              onSuccess={(result) => verifyMutation.mutate(result)}
              onResetCapture={() => {
                verifyMutation.reset();
                setCameraInitialized(false);
                setCaptureSessionKey((current) => current + 1);
              }}
              onOpenSkip={() => {
                verifyMutation.reset();
                setView("skip");
              }}
            />
          ) : (
            <SkipView
              saleId={saleId}
              onVerified={onVerified}
              onBack={() => setView("camera")}
            />
          )}
        </IdentityDialogContent>
      </Dialog>
    );
  },
);

function CameraView({
  sdkLoading,
  sdkToken,
  sdkError,
  reloadToken,
  captureSessionKey,
  cameraLive,
  cameraInitialized,
  onCameraInitialized,
  verifyPending,
  verifyError,
  onSuccess,
  onResetCapture,
  onOpenSkip,
}: {
  sdkLoading: boolean;
  sdkToken: string | null;
  sdkError: string | null;
  reloadToken: () => void;
  captureSessionKey: number;
  cameraLive: boolean;
  cameraInitialized: boolean;
  onCameraInitialized: () => void;
  verifyPending: boolean;
  verifyError: string | null;
  onSuccess: (result: NubariumFaceCaptureResult) => void;
  onResetCapture: () => void;
  onOpenSkip: () => void;
}) {
  const [comparePreview, setComparePreview] = useState<string | null>(null);
  const showBootstrapOverlay =
    !verifyPending && (!sdkToken || Boolean(sdkError) || !cameraInitialized);
  const showOverlay = showBootstrapOverlay || verifyPending;
  const canSkip =
    Boolean(sdkError) ||
    (verifyError != null && /omisión de supervisor/i.test(verifyError));

  useEffect(() => {
    setComparePreview(null);
  }, [captureSessionKey]);

  return (
    <Stack spacing={3} alignItems="center" textAlign="center">
      <Typography variant="h5" fontWeight={600}>
        Validación de identidad
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Capture el rostro del cliente para verificar que coincida con la
        fotografía de su INE.
      </Typography>

      <CameraStage>
        <NubariumFaceCapture
          key={captureSessionKey}
          token={sdkToken ?? ""}
          active={cameraLive && !verifyPending}
          fillParent
          onInitialized={onCameraInitialized}
          onSuccess={(result) => {
            setComparePreview(result.faceDataUrl);
            onSuccess(result);
          }}
          onReset={onResetCapture}
        />
        {showOverlay ? (
          <CameraOverlay dimmed={verifyPending && Boolean(comparePreview)}>
            {verifyPending && comparePreview ? (
              <CameraOverlayStill src={comparePreview} alt="" />
            ) : null}
            {sdkLoading || !sdkError || verifyPending ? (
              <CircularProgress />
            ) : null}
            <Typography variant="subtitle1" fontWeight={600} sx={{ position: "relative" }}>
              {verifyPending
                ? "Comparando identidad"
                : sdkLoading || !sdkError
                  ? "Preparando captura biométrica"
                  : "No se pudo iniciar la captura"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ position: "relative", maxWidth: 320 }}
            >
              {verifyPending
                ? "Estamos verificando que el rostro coincida con el titular del crédito. Esto puede tardar unos segundos."
                : sdkLoading || !sdkError
                  ? "Un momento, por favor."
                  : sdkError}
            </Typography>
            {!sdkLoading && sdkError && !verifyPending ? (
              <Button variant="outlined" onClick={() => void reloadToken()}>
                Reintentar
              </Button>
            ) : null}
          </CameraOverlay>
        ) : null}
      </CameraStage>

      {verifyError ? <Alert severity="error">{verifyError}</Alert> : null}

      {verifyPending ? null : canSkip ? (
        <Button
          variant="text"
          size="small"
          sx={{ textTransform: "none" }}
          onClick={onOpenSkip}
        >
          ¿Problemas con la cámara?
        </Button>
      ) : null}
    </Stack>
  );
}

function SkipView({
  saleId,
  onVerified,
  onBack,
}: {
  saleId: number | null;
  onVerified: () => void;
  onBack: () => void;
}) {
  const [reason, setReason] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const skipMutation = useMutation({
    mutationFn: async () => {
      if (saleId == null) {
        throw new Error("No hay una venta activa para omitir la verificación");
      }
      if (!reason.trim()) {
        throw new Error("El motivo es requerido");
      }
      if (!username.trim() || !password) {
        throw new Error("Usuario y contraseña del supervisor son requeridos");
      }

      const skipRes = await skipSaleIdentityVerification(saleId, reason.trim(), {
        username: username.trim(),
        password,
      });
      if (skipRes.error) throw new Error(skipRes.error.message);
      return skipRes.data!;
    },
    onSuccess: onVerified,
  });

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={600}>
        Omitir validación de identidad
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Requiere autorización de un supervisor (Administrador o Gerente)
        por falla técnica (cámara o proveedor). Un no-match facial no se
        puede omitir.
      </Typography>

      <TextField
        label="Motivo"
        placeholder="Ej. Cámara no disponible en la sucursal"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        multiline
        minRows={2}
        disabled={skipMutation.isPending}
        fullWidth
      />
      <TextField
        label="Usuario del supervisor"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={skipMutation.isPending}
        fullWidth
      />
      <TextField
        label="Contraseña del supervisor"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={skipMutation.isPending}
        fullWidth
        autoComplete="current-password"
      />

      {skipMutation.isError ? (
        <Alert severity="error">{skipMutation.error.message}</Alert>
      ) : null}

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          variant="text"
          disabled={skipMutation.isPending}
          onClick={onBack}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          sx={{ borderRadius: 2, textTransform: "none" }}
          disabled={skipMutation.isPending}
          onClick={() => skipMutation.mutate()}
        >
          {skipMutation.isPending ? (
            <CircularProgress size={16} />
          ) : (
            "Autorizar y continuar"
          )}
        </Button>
      </Stack>
    </Stack>
  );
}
