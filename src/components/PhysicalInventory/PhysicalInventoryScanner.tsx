"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Scan } from "lucide-react";
import { CameraDeviceSelect, CameraSwitchControl } from "@/components/CameraDeviceSelect";
import { useCameraDevices } from "@/hooks/useCameraDevices";
import { normalizeScannedProductCode } from "@/utils/productCode";
import type { IDetectedBarcode, IScannerError, IScannerProps } from "@yudiel/react-qr-scanner";
import {
  ScannerStage,
  ScannerViewport,
} from "@/components/ProductCodeScannerDialog/styles";

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
      return "La cámara solo funciona con conexión segura (HTTPS).";
    case "unsupported":
      return "Tu navegador no permite acceder a la cámara.";
    default:
      return "No fue posible iniciar el escáner. Intenta de nuevo.";
  }
}

export interface PhysicalInventoryScannerProps {
  enabled?: boolean;
  onCodeScanned: (code: string) => void;
}

export function PhysicalInventoryScanner({
  enabled = true,
  onCodeScanned,
}: PhysicalInventoryScannerProps) {
  const cameras = useCameraDevices({
    enabled,
    preferFacing: "environment",
  });
  const [scanStarted, setScanStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scannerSessionKey, setScannerSessionKey] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setScanStarted(false);
      setPaused(false);
      setScannerError(null);
    }
  }, [enabled]);

  const canAutoStart =
    cameras.preferenceHydrated &&
    cameras.permissionGranted &&
    Boolean(cameras.selectedDeviceId) &&
    (cameras.hasRememberedPreference || cameras.devices.length === 1);

  const scanLive =
    enabled && Boolean(cameras.selectedDeviceId) && (scanStarted || canAutoStart);

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
      window.setTimeout(() => setPaused(false), 900);
    },
    [onCodeScanned, paused],
  );

  return (
    <Stack spacing={2}>
      <TextField
        select
        size="small"
        label="Método de escaneo"
        value="device_camera"
        fullWidth
        InputProps={{
          startAdornment: (
            <Scan size={16} style={{ marginRight: 8, flexShrink: 0 }} />
          ),
        }}
      >
        <MenuItem value="device_camera">Cámara del dispositivo</MenuItem>
      </TextField>

      {!scanLive ? (
        <CameraDeviceSelect
          devices={cameras.devices}
          value={cameras.selectedDeviceId}
          onChange={cameras.selectDevice}
          helperText="Preferimos la cámara trasera. Puedes cambiarla si lo necesitas."
          loading={cameras.isLoading}
          errorMessage={cameras.errorMessage}
          needsPermission={
            !cameras.isLoading &&
            (cameras.needsUserGesture || !cameras.permissionGranted)
          }
          onRequestPermission={() => void cameras.requestPermission()}
          onStart={handleStartScan}
          startLabel="Iniciar escaneo"
        />
      ) : (
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="flex-end">
            <CameraSwitchControl
              devices={cameras.devices}
              value={cameras.selectedDeviceId}
              onChange={cameras.selectAndRemember}
            />
          </Stack>
          {scannerError ? (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setScannerError(null);
                    setScannerSessionKey((key) => key + 1);
                  }}
                >
                  Reintentar
                </Button>
              }
            >
              {scannerError}
            </Alert>
          ) : null}
          <ScannerStage sx={{ minHeight: 280, borderRadius: 2, overflow: "hidden" }}>
            <ScannerViewport>
              <Scanner
                key={`${scannerSessionKey}-${cameras.selectedDeviceId}`}
                onScan={handleScan}
                onError={(error) => setScannerError(scannerErrorMessage(error))}
                paused={paused}
                formats={PRODUCT_CODE_SCAN_FORMATS}
                constraints={{ deviceId: cameras.selectedDeviceId }}
                components={{ finder: true }}
                styles={{
                  container: { width: "100%", height: "100%" },
                  video: { objectFit: "cover" },
                }}
              />
            </ScannerViewport>
          </ScannerStage>
        </Stack>
      )}
    </Stack>
  );
}
