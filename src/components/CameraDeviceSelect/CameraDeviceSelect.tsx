"use client";

import { Alert, Button, CircularProgress, Typography } from "@mui/material";
import { Camera } from "lucide-react";
import { FormSelect } from "@/components/Form";
import type { CameraDeviceOption } from "@/utils/cameraDevices";
import {
  CAMERA_MENU_PROPS,
  CameraIconBadge,
  CameraSelectField,
  CameraSetupCard,
  CameraSetupRoot,
} from "./styles";

interface CameraDeviceSelectProps {
  devices: CameraDeviceOption[];
  value: string;
  onChange: (deviceId: string) => void;
  helperText?: string;
  disabled?: boolean;
  loading?: boolean;
  errorMessage?: string | null;
  needsPermission?: boolean;
  onRequestPermission?: () => void;
  started?: boolean;
  onStart?: () => void;
  startLabel?: string;
}

const ACTION_BUTTON_SX = {
  minHeight: 44,
  py: 1.25,
} as const;

export function CameraDeviceSelect({
  devices,
  value,
  onChange,
  helperText,
  disabled = false,
  loading = false,
  errorMessage = null,
  needsPermission = false,
  onRequestPermission,
  started = false,
  onStart,
  startLabel = "Iniciar captura",
}: CameraDeviceSelectProps) {
  const selectField = (
    <CameraSelectField>
      <FormSelect
        label="Cámara"
        placeholder="Selecciona una cámara"
        options={devices.map((device) => ({
          value: device.deviceId,
          label: device.label,
        }))}
        value={devices.some((device) => device.deviceId === value) ? value : ""}
        onChange={(event) => {
          const nextValue = event.target.value;
          if (typeof nextValue === "string" && nextValue) onChange(nextValue);
        }}
        disabled={disabled || loading || devices.length === 0}
        MenuProps={CAMERA_MENU_PROPS}
      />
    </CameraSelectField>
  );

  if (loading && devices.length === 0 && !errorMessage) {
    return (
      <CameraSetupRoot>
        <CircularProgress size={28} />
        <Typography variant="body2" color="text.secondary">
          Buscando cámaras...
        </Typography>
      </CameraSetupRoot>
    );
  }

  if (needsPermission && !devices.length) {
    return (
      <CameraSetupRoot>
        <CameraSetupCard>
          <CameraIconBadge>
            <Camera size={24} />
          </CameraIconBadge>
          <Typography variant="subtitle1" textAlign="center">
            Acceso a la cámara
          </Typography>
          {errorMessage ? (
            <Alert severity="error">{errorMessage}</Alert>
          ) : (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Permite el acceso a la cámara para elegir la que te
              parezca mejor.
            </Typography>
          )}
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Camera size={18} />}
            onClick={onRequestPermission}
            disabled={loading || disabled}
            fullWidth
            sx={ACTION_BUTTON_SX}
          >
            {errorMessage ? "Reintentar acceso a la cámara" : "Elegir cámara"}
          </Button>
        </CameraSetupCard>
      </CameraSetupRoot>
    );
  }

  if (started) return errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null;

  if (devices.length <= 1 && !errorMessage) return null;

  return (
    <CameraSetupRoot>
      <CameraSetupCard>
        <CameraIconBadge>
          <Camera size={24} />
        </CameraIconBadge>
        <Typography variant="subtitle1" textAlign="center">
          Selecciona la cámara
        </Typography>
        {errorMessage ? (
          <Alert severity="error">{errorMessage}</Alert>
        ) : helperText ? (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {helperText}
          </Typography>
        ) : null}
        {selectField}
        {onStart ? (
          <Button
            variant="contained"
            startIcon={<Camera size={18} />}
            onClick={onStart}
            disabled={disabled || loading || !value}
            fullWidth
            sx={ACTION_BUTTON_SX}
          >
            {startLabel}
          </Button>
        ) : null}
      </CameraSetupCard>
    </CameraSetupRoot>
  );
}
