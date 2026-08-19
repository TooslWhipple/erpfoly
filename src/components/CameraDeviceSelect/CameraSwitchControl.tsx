"use client";

import { FormControl, InputAdornment, MenuItem, Select, type SelectChangeEvent } from "@mui/material";
import { Camera } from "lucide-react";
import type { CameraDeviceOption } from "@/utils/cameraDevices";
import { CameraHeaderSelectControl } from "./styles";

interface CameraSwitchControlProps {
  devices: CameraDeviceOption[];
  value: string;
  onChange: (deviceId: string) => void;
  disabled?: boolean;
}

export function CameraSwitchControl({
  devices,
  value,
  onChange,
  disabled = false,
}: CameraSwitchControlProps) {
  if (devices.length <= 1) return null;

  const selectedValue = devices.some((device) => device.deviceId === value) ? value : "";

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    const nextValue = event.target.value;
    if (typeof nextValue === "string" && nextValue) onChange(nextValue);
  };

  return (
    <CameraHeaderSelectControl>
      <FormControl size="small" fullWidth disabled={disabled}>
        <Select
          aria-label="Cambiar cámara"
          value={selectedValue}
          onChange={handleChange}
          displayEmpty
          disabled={disabled}
          startAdornment={
            <InputAdornment position="start">
              <Camera size={16} />
            </InputAdornment>
          }
          renderValue={(selected) => {
            if (typeof selected !== "string" || !selected) return "Cámara";
            return devices.find((device) => device.deviceId === selected)?.label ?? "Cámara";
          }}
        >
          {devices.map((device) => (
            <MenuItem key={device.deviceId} value={device.deviceId}>
              {device.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </CameraHeaderSelectControl>
  );
}
