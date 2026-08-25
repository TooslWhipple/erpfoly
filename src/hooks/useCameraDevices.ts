"use client";

import { useCallback, useEffect, useState } from "react";
import { useCameraPreferenceHydrated, useCameraPreferenceStore } from "@/store/useCameraPreferenceStore";
import {
  type CameraDeviceOption,
  type CameraFacingHint,
  findStoredCamera,
  installCameraDeviceConstraintInterceptor,
  mapVideoInputDevices,
  releaseCameraHardware,
  resolvePreferredCamera,
  setPreferredCameraDeviceId,
  stopMediaStream,
  translateCameraError,
} from "@/utils/cameraDevices";
import { ensureNavigatorMediaDevices, getCameraAccessErrorMessage } from "@/utils/nubariumSdk";

interface UseCameraDevicesOptions {
  enabled?: boolean;
  preferFacing?: CameraFacingHint;
}

interface UseCameraDevicesResult {
  devices: CameraDeviceOption[];
  selectedDeviceId: string;
  selectedDevice: CameraDeviceOption | undefined;
  permissionGranted: boolean;
  needsUserGesture: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  preferenceHydrated: boolean;
  hasRememberedPreference: boolean;
  selectDevice: (deviceId: string) => void;
  selectAndRemember: (deviceId: string) => void;
  commitPreferredDevice: (deviceId?: string) => void;
  requestPermission: () => Promise<boolean>;
  refreshDevices: () => Promise<CameraDeviceOption[]>;
}

export function useCameraDevices(options: UseCameraDevicesOptions = {}): UseCameraDevicesResult {
  const { enabled = true, preferFacing = "environment" } = options;
  const [devices, setDevices] = useState<CameraDeviceOption[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [needsUserGesture, setNeedsUserGesture] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasProbed, setHasProbed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const preferenceHydrated = useCameraPreferenceHydrated();
  const storedDeviceId = useCameraPreferenceStore((state) => state.preferredDeviceId);
  const storedLabel = useCameraPreferenceStore((state) => state.preferredLabel);
  const setPreferredCamera = useCameraPreferenceStore((state) => state.setPreferredCamera);

  const refreshDevices = useCallback(async (): Promise<CameraDeviceOption[]> => {
    ensureNavigatorMediaDevices();
    if (!navigator.mediaDevices?.enumerateDevices) return [];

    const listed = await navigator.mediaDevices.enumerateDevices();
    const nextDevices = mapVideoInputDevices(listed);
    setDevices(nextDevices);
    return nextDevices;
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const accessError = getCameraAccessErrorMessage();
    if (accessError) {
      setErrorMessage(accessError);
      setHasProbed(true);
      return false;
    }

    setIsLoading(true);
    setErrorMessage(null);

    let probeStream: MediaStream | null = null;
    try {
      ensureNavigatorMediaDevices();
      installCameraDeviceConstraintInterceptor();

      probeStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: preferFacing === "unknown"
          ? true
          : { facingMode: { ideal: preferFacing } },
      });
      stopMediaStream(probeStream);
      probeStream = null;

      const nextDevices = await refreshDevices();
      if (nextDevices.length === 0) {
        setErrorMessage("No se encontró ninguna cámara en este dispositivo.");
        setPermissionGranted(false);
        return false;
      }

      setPermissionGranted(true);
      setNeedsUserGesture(false);
      setHasProbed(true);
      return true;
    } catch (error) {
      setErrorMessage(translateCameraError(error));
      setPermissionGranted(false);
      return false;
    } finally {
      stopMediaStream(probeStream);
      setHasProbed(true);
      setIsLoading(false);
    }
  }, [preferFacing, refreshDevices]);

  useEffect(() => {
    if (!enabled) {
      setDevices([]);
      setSelectedDeviceId("");
      setPermissionGranted(false);
      setNeedsUserGesture(false);
      setErrorMessage(null);
      setIsLoading(false);
      setHasProbed(false);
      setPreferredCameraDeviceId(null);
      releaseCameraHardware();
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const probeExistingPermission = async () => {
      const accessError = getCameraAccessErrorMessage();
      if (accessError) {
        if (!cancelled) {
          setErrorMessage(accessError);
          setIsLoading(false);
        }
        return;
      }

      try {
        ensureNavigatorMediaDevices();
        if (!navigator.mediaDevices?.enumerateDevices) {
          if (!cancelled) {
            setNeedsUserGesture(true);
            setIsLoading(false);
          }
          return;
        }

        const listed = await navigator.mediaDevices.enumerateDevices();
        if (cancelled) return;

        const nextDevices = mapVideoInputDevices(listed);
        const hasLabels = nextDevices.some((device) => device.rawLabel.trim());

        if (hasLabels && nextDevices.length > 0) {
          setDevices(nextDevices);
          setPermissionGranted(true);
          setNeedsUserGesture(false);
        } else {
          setNeedsUserGesture(true);
        }
      } catch {
        if (!cancelled) setNeedsUserGesture(true);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setHasProbed(true);
        }
      }
    };

    void probeExistingPermission();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || devices.length === 0 || !preferenceHydrated) return;

    setSelectedDeviceId((current) =>
      resolvePreferredCamera(devices, {
        storedDeviceId,
        storedLabel,
        currentDeviceId: current,
        preferFacing,
      }),
    );
  }, [devices, enabled, preferFacing, preferenceHydrated, storedDeviceId, storedLabel]);

  useEffect(() => {
    if (!enabled || !preferenceHydrated || devices.length !== 1) return;
    const onlyCamera = devices[0];
    setPreferredCamera({ deviceId: onlyCamera.deviceId, label: onlyCamera.rawLabel });
  }, [devices, enabled, preferenceHydrated, setPreferredCamera]);

  useEffect(() => {
    if (!enabled) {
      setPreferredCameraDeviceId(null);
      return;
    }
    setPreferredCameraDeviceId(selectedDeviceId || null);
  }, [enabled, selectedDeviceId]);

  useEffect(() => {
    if (!enabled || !permissionGranted || typeof navigator === "undefined") return;
    if (!navigator.mediaDevices) return;

    const handleDeviceChange = () => {
      void refreshDevices();
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
    };
  }, [enabled, permissionGranted, refreshDevices]);

  const selectDevice = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setPreferredCameraDeviceId(deviceId || null);
  }, []);

  const commitPreferredDevice = useCallback((deviceId?: string) => {
    const id = deviceId ?? selectedDeviceId;
    const device = devices.find((item) => item.deviceId === id);
    if (!device) return;
    setPreferredCamera({ deviceId: device.deviceId, label: device.rawLabel });
  }, [devices, selectedDeviceId, setPreferredCamera]);

  const selectAndRemember = useCallback((deviceId: string) => {
    selectDevice(deviceId);
    commitPreferredDevice(deviceId);
  }, [commitPreferredDevice, selectDevice]);

  const selectedDevice = devices.find((device) => device.deviceId === selectedDeviceId);
  const hasRememberedPreference = Boolean(
    preferenceHydrated && findStoredCamera(devices, storedDeviceId, storedLabel),
  );

  return {
    devices,
    selectedDeviceId,
    selectedDevice,
    permissionGranted,
    needsUserGesture,
    isLoading: isLoading || (enabled && (!hasProbed || !preferenceHydrated)),
    errorMessage,
    preferenceHydrated,
    hasRememberedPreference,
    selectDevice,
    selectAndRemember,
    commitPreferredDevice,
    requestPermission,
    refreshDevices,
  };
}
