import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { X } from "lucide-react";
import { CameraDeviceSelect, CameraSwitchControl } from "@/components/CameraDeviceSelect";
import { useCameraDevices } from "@/hooks/useCameraDevices";
import { SALES_POS_BREAKPOINT } from "@/lib/layoutBreakpoints";
import { normalizeScannedProductCode } from "@/utils/productCode";
import type { IDetectedBarcode, IScannerError, IScannerProps } from "@yudiel/react-qr-scanner";
import {
  ScannerCloseButton,
  ScannerDialogContent,
  ScannerDialogHeader,
  ScannerHeaderText,
  ScannerStage,
  ScannerViewport,
} from "./styles";

const Scanner = dynamic<IScannerProps>(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
  {
    ssr: false,
    loading: () => (
      <Stack alignItems="center" justifyContent="center" minHeight={240} spacing={1.5}>
        <CircularProgress size={28} />
        <Typography variant="body2" color="text.secondary">
          Preparando cámara...
        </Typography>
      </Stack>
    ),
  },
);

const PRODUCT_CODE_SCAN_FORMATS: NonNullable<IScannerProps["formats"]> = [
  "qr_code",
  "code_128",
  "code_39",
  "ean_13",
  "ean_8",
  "upc_a",
  "upc_e",
];

export interface ProductCodeScannerDialogProps {
  open: boolean;
  onClose: () => void;
  onCodeScanned: (code: string) => void;
}

function scannerErrorMessage(error: IScannerError): string {
  switch (error.kind) {
    case "permission-denied":
      return "Necesitas permitir el acceso a la cámara para continuar.";
    case "no-camera":
      return "No se encontró ninguna cámara en este dispositivo.";
    case "in-use":
      return "La cámara está en uso por otra aplicación. Ciérrala e intenta de nuevo.";
    case "overconstrained":
      return "La cámara seleccionada no está disponible. Elige otra e intenta de nuevo.";
    case "insecure-context":
      return "La cámara solo funciona con conexión segura (HTTPS). Abre la aplicación con https:// e intenta de nuevo.";
    case "unsupported":
      return "Tu navegador no permite acceder a la cámara. Usa Chrome o Safari actualizado.";
    default:
      return "No fue posible iniciar el escáner. Intenta de nuevo.";
  }
}

export function ProductCodeScannerDialog({
  open,
  onClose,
  onCodeScanned,
}: ProductCodeScannerDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down(SALES_POS_BREAKPOINT));
  const [mediaSessionOpen, setMediaSessionOpen] = useState(false);
  const cameras = useCameraDevices({
    enabled: mediaSessionOpen,
    preferFacing: "environment",
  });

  const [scanStarted, setScanStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scannerSessionKey, setScannerSessionKey] = useState(0);

  useEffect(() => {
    if (open) setMediaSessionOpen(true);
  }, [open]);

  const handleExited = () => {
    setMediaSessionOpen(false);
    setScanStarted(false);
    setPaused(false);
    setScannerError(null);
  };

  const canAutoStart =
    cameras.preferenceHydrated
    && cameras.permissionGranted
    && Boolean(cameras.selectedDeviceId)
    && (cameras.hasRememberedPreference || cameras.devices.length === 1);

  const scanLive = Boolean(cameras.selectedDeviceId) && (scanStarted || canAutoStart);

  const handleStartScan = () => {
    cameras.commitPreferredDevice();
    setScannerError(null);
    setPaused(false);
    setScanStarted(true);
  };

  const handleScan = useCallback(
    (detectedCodes: IDetectedBarcode[]) => {
      if (paused) return;
      const rawValue = detectedCodes.find((code) => code.rawValue.trim())?.rawValue;
      if (!rawValue) return;
      const code = normalizeScannedProductCode(rawValue);
      if (!code) return;
      setPaused(true);
      onCodeScanned(code);
      onClose();
    },
    [onClose, onCodeScanned, paused],
  );

  const handleScannerError = useCallback((error: IScannerError) => {
    setScannerError(scannerErrorMessage(error));
  }, []);

  const handleRetryScanner = () => {
    setScannerError(null);
    setPaused(false);
    setScannerSessionKey((key) => key + 1);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      TransitionProps={{ onExited: handleExited }}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 2,
          // ScannerViewport sizes with cqi/cqb; those units are 0 unless
          // the paper has a definite height (size containment ignores children).
          height: fullScreen ? "100%" : scanLive ? "min(720px, 90dvh)" : "auto",
          maxHeight: fullScreen ? "100%" : "90dvh",
          ...(fullScreen ? { minHeight: "100%" } : {}),
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      <ScannerDialogContent>
        <ScannerDialogHeader>
          <ScannerHeaderText>
            <Typography variant="h6" fontWeight={600}>
              Escanear artículo
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{
                "@media (orientation: landscape) and (max-height: 560px)": {
                  display: "none",
                },
              }}
            >
              Apunta al código de barras o QR del producto
            </Typography>
          </ScannerHeaderText>
          {scanLive ? (
            <CameraSwitchControl
              devices={cameras.devices}
              value={cameras.selectedDeviceId}
              onChange={cameras.selectAndRemember}
            />
          ) : null}
          <ScannerCloseButton onClick={onClose} aria-label="Cerrar" size="small">
            <X size={18} />
          </ScannerCloseButton>
        </ScannerDialogHeader>

        {!scanLive ? (
          <Stack flex={1} minHeight={0} width="100%" overflow="auto">
            <CameraDeviceSelect
              devices={cameras.devices}
              value={cameras.selectedDeviceId}
              onChange={cameras.selectDevice}
              helperText="Elige la cámara que te parezca mejor. La recordaremos en este dispositivo."
              loading={cameras.isLoading}
              errorMessage={cameras.errorMessage}
              needsPermission={
                !cameras.isLoading && (cameras.needsUserGesture || !cameras.permissionGranted)
              }
              onRequestPermission={() => void cameras.requestPermission()}
              onStart={handleStartScan}
              startLabel="Iniciar escaneo"
            />
          </Stack>
        ) : (
          <ScannerStage>
            <ScannerViewport>
              <Scanner
                key={`${scannerSessionKey}-${cameras.selectedDeviceId}`}
                onScan={handleScan}
                onError={handleScannerError}
                paused={paused}
                formats={PRODUCT_CODE_SCAN_FORMATS}
                constraints={{
                  deviceId: { exact: cameras.selectedDeviceId },
                }}
                components={{ finder: true, torch: true }}
                sound
                styles={{
                  container: {
                    width: "100%",
                    height: "100%",
                    aspectRatio: "unset",
                    overflow: "hidden",
                  },
                  video: {
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  },
                }}
              />
            </ScannerViewport>
            {scannerError ? (
              <Alert
                severity="error"
                sx={{ width: "100%", flexShrink: 0 }}
                action={
                  <Button color="inherit" size="small" onClick={handleRetryScanner}>
                    Reintentar
                  </Button>
                }
              >
                {scannerError}
              </Alert>
            ) : null}
          </ScannerStage>
        )}
      </ScannerDialogContent>
    </Dialog>
  );
}
