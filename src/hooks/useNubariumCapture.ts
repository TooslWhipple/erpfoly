"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  applyNubariumCapturePatches,
  getCameraAccessErrorMessage,
  getNubariumCameraOptions,
  safeClearNubariumCapture,
  type NubariumCaptureKind,
} from "@/utils/nubarium";
import {
  facingHintToNubarium,
  installCameraDeviceConstraintInterceptor,
  releaseCameraHardware,
  setPreferredCameraDeviceId,
  type CameraFacingHint,
} from "@/utils/cameraDevices";

interface NubariumCaptureInstance {
  init(config: Record<string, unknown>): void;
  setToken(token: string): void;
  load(onLoaded?: () => void): void;
  start(): void;
  clear(): void;
  onSuccess(callback: (data: unknown) => void): NubariumCaptureInstance;
  onFail(callback: (data: unknown) => void): NubariumCaptureInstance;
  onError(callback: (error: { code?: string | number; msg?: string; message?: string }) => void): NubariumCaptureInstance;
}

export interface UseNubariumCaptureOptions {
  kind: NubariumCaptureKind;
  token: string;
  active: boolean;
  completed?: boolean;
  videoDeviceId?: string | null;
  cameraFacing?: CameraFacingHint;
  /** Extra init fields merged after cameras / rootElement. */
  initConfig: Record<string, unknown>;
  /** SDK globals (IdCapture / FaceCapture) are duck-typed to this shape. */
  createCapture: () => NubariumCaptureInstance;
  /**
   * Called on SDK success. Return true if accepted.
   * Return false (or a string error) if the payload was invalid.
   */
  onSdkSuccess: (data: unknown) => boolean | string;
  /**
   * Called on SDK fail. Return true if treated as success (e.g. acceptFailedLiveness).
   * Return a string for a custom error. Return false to use translateFail.
   */
  onSdkFail: (data: unknown) => boolean | string;
  translateError: (error: { code?: string | number; msg?: string; message?: string }) => string;
  translateFail: (reason: string | undefined) => string;
  /** Defer mount past React Strict Mode's discarded first effect (FaceCapture). */
  deferMount?: boolean;
  onInitialized?: () => void;
  fallbackMountError?: string;
}

export interface UseNubariumCaptureResult {
  rootElementId: string;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  errorMessage: string | null;
  retry: () => void;
}

export function useNubariumCapture(
  options: UseNubariumCaptureOptions,
): UseNubariumCaptureResult {
  const {
    kind,
    token,
    active,
    completed = false,
    videoDeviceId = null,
    cameraFacing,
    initConfig,
    createCapture,
    onSdkSuccess,
    onSdkFail,
    translateError,
    translateFail,
    deferMount = false,
    onInitialized,
    fallbackMountError = "No fue posible iniciar la captura biométrica.",
  } = options;

  const reactId = useId().replace(/:/g, "");
  const rootElementId = `nubarium-${kind}-capture-${reactId}`;
  const captureRef = useRef<NubariumCaptureInstance | null>(null);
  const restorePatchesRef = useRef<(() => void) | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const onSdkSuccessRef = useRef(onSdkSuccess);
  onSdkSuccessRef.current = onSdkSuccess;
  const onSdkFailRef = useRef(onSdkFail);
  onSdkFailRef.current = onSdkFail;
  const onInitializedRef = useRef(onInitialized);
  onInitializedRef.current = onInitialized;
  const translateErrorRef = useRef(translateError);
  translateErrorRef.current = translateError;
  const translateFailRef = useRef(translateFail);
  translateFailRef.current = translateFail;
  const createCaptureRef = useRef(createCapture);
  createCaptureRef.current = createCapture;
  const initConfigRef = useRef(initConfig);
  initConfigRef.current = initConfig;
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const teardown = useCallback(() => {
    restorePatchesRef.current?.();
    restorePatchesRef.current = null;
    safeClearNubariumCapture(captureRef.current, rootElementId);
    captureRef.current = null;
    releaseCameraHardware();
  }, [rootElementId]);

  useEffect(() => {
    installCameraDeviceConstraintInterceptor();
    setPreferredCameraDeviceId(videoDeviceId ?? null);
    return () => {
      setPreferredCameraDeviceId(null);
    };
  }, [videoDeviceId]);

  useEffect(() => {
    if (!active || completed || !tokenRef.current.trim()) return;

    let cancelled = false;
    setErrorMessage(null);

    const mountCapture = () => {
      if (cancelled || captureRef.current) return;

      const cameraAccessError = getCameraAccessErrorMessage();
      if (cameraAccessError) {
        setErrorMessage(cameraAccessError);
        onInitializedRef.current?.();
        return;
      }

      try {
        const capture = createCaptureRef.current();
        captureRef.current = capture;
        const sessionToken = tokenRef.current;

        capture.init({
          ...initConfigRef.current,
          cameras: cameraFacing
            ? facingHintToNubarium(cameraFacing)
            : getNubariumCameraOptions(),
          rootElement: rootElementId,
        });

        restorePatchesRef.current = applyNubariumCapturePatches(capture, kind, {
          viewportEl: viewportRef.current,
        });

        capture.setToken(sessionToken);

        capture
          .onSuccess((data) => {
            if (cancelled) return;
            const result = onSdkSuccessRef.current(data);
            teardown();
            if (result === true) return;
            setErrorMessage(
              typeof result === "string" ? result : "La captura no devolvió datos válidos.",
            );
          })
          .onFail((fail) => {
            if (cancelled) return;
            const result = onSdkFailRef.current(fail);
            teardown();
            if (result === true) return;
            if (typeof result === "string") {
              setErrorMessage(result);
              return;
            }
            const reason =
              fail && typeof fail === "object" && "reason" in fail
                ? (fail as { reason?: string }).reason
                : undefined;
            setErrorMessage(translateFailRef.current(reason));
          })
          .onError((sdkError) => {
            if (cancelled) return;
            teardown();
            setErrorMessage(translateErrorRef.current(sdkError));
            onInitializedRef.current?.();
          });

        capture.load(() => {
          if (cancelled || captureRef.current !== capture) return;
          capture.start();
          // SDK loading() assigns window.onresize to force portrait — clear it again.
          window.onresize = null;
          onInitializedRef.current?.();
        });
      } catch (mountError) {
        const rawMessage = mountError instanceof Error ? mountError.message : "";
        setErrorMessage(
          rawMessage.toLowerCase().includes("getusermedia")
            ? (getCameraAccessErrorMessage() ?? "No fue posible acceder a la cámara del dispositivo.")
            : (rawMessage || fallbackMountError),
        );
        onInitializedRef.current?.();
      }
    };

    const startTimer = deferMount
      ? window.setTimeout(mountCapture, 0)
      : (mountCapture(), 0);

    return () => {
      cancelled = true;
      if (deferMount) window.clearTimeout(startTimer);
      teardown();
    };
  }, [
    active,
    cameraFacing,
    completed,
    deferMount,
    fallbackMountError,
    kind,
    retryKey,
    rootElementId,
    teardown,
    videoDeviceId,
  ]);

  const retry = useCallback(() => {
    teardown();
    setErrorMessage(null);
    setRetryKey((current) => current + 1);
  }, [teardown]);

  return {
    rootElementId,
    viewportRef,
    errorMessage,
    retry,
  };
}
