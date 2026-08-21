import { ensureNavigatorMediaDevices } from "@/utils/nubariumSdk";
import type { NubariumCameraOption } from "@/utils/nubariumSdk";

export type CameraFacingHint = "environment" | "user" | "unknown";

export interface CameraDeviceOption {
  deviceId: string;
  label: string;
  rawLabel: string;
  facing: CameraFacingHint;
}

type MediaDevicesWithIntercept = MediaDevices & {
  __folyPreferredCameraIntercept?: boolean;
};

let preferredCameraDeviceId: string | null = null;
let originalGetUserMedia: MediaDevices["getUserMedia"] | null = null;
const liveCameraStreams = new Set<MediaStream>();

const FRONT_CAMERA_PATTERN = /front|user|face|facetime|frontal/i;
const REAR_CAMERA_PATTERN = /back|rear|environment|trasera|posterior|wide|ultra|tele/i;

export function inferCameraFacing(label: string): CameraFacingHint {
  const normalized = label.trim();
  if (!normalized) return "unknown";
  if (REAR_CAMERA_PATTERN.test(normalized)) return "environment";
  if (FRONT_CAMERA_PATTERN.test(normalized)) return "user";
  return "unknown";
}

export function formatCameraLabel(device: Pick<CameraDeviceOption, "label" | "facing">, index: number): string {
  const base = device.label.trim() || `Cámara ${index + 1}`;
  if (/trasera|frontal|front|back|rear/i.test(base)) return base;
  if (device.facing === "environment") return `${base} (trasera)`;
  if (device.facing === "user") return `${base} (frontal)`;
  return base;
}

export function pickPreferredCamera(
  devices: CameraDeviceOption[],
  prefer: CameraFacingHint,
): string {
  if (devices.length === 0) return "";

  const matching = devices.filter((device) => device.facing === prefer);
  if (matching[0]) return matching[0].deviceId;

  if (prefer === "environment") {
    const nonFront = devices.filter((device) => device.facing !== "user");
    if (nonFront[0]) return nonFront[0].deviceId;
  }

  return devices[0].deviceId;
}

export function findStoredCamera(
  devices: CameraDeviceOption[],
  storedDeviceId?: string | null,
  storedLabel?: string | null,
): CameraDeviceOption | undefined {
  if (storedDeviceId) {
    const byId = devices.find((device) => device.deviceId === storedDeviceId);
    if (byId) return byId;
  }

  const label = storedLabel?.trim();
  if (!label) return undefined;

  return devices.find((device) => device.rawLabel === label || device.label === label);
}

export function resolvePreferredCamera(
  devices: CameraDeviceOption[],
  options: {
    storedDeviceId?: string | null;
    storedLabel?: string | null;
    currentDeviceId?: string | null;
    preferFacing: CameraFacingHint;
  },
): string {
  if (devices.length === 0) return "";

  const { storedDeviceId, storedLabel, currentDeviceId, preferFacing } = options;

  if (currentDeviceId && devices.some((device) => device.deviceId === currentDeviceId)) {
    return currentDeviceId;
  }

  return (
    findStoredCamera(devices, storedDeviceId, storedLabel)?.deviceId
    ?? pickPreferredCamera(devices, preferFacing)
  );
}

export function facingHintToNubarium(facing: CameraFacingHint): NubariumCameraOption {
  if (facing === "environment") return "back";
  if (facing === "user") return "front";
  return "default";
}

export function applyPreferredCameraConstraint(
  constraints: MediaStreamConstraints | undefined,
  deviceId: string | null,
): MediaStreamConstraints {
  if (!deviceId || constraints?.video === false) {
    return constraints ?? { video: true };
  }

  const video: MediaTrackConstraints =
    typeof constraints?.video === "object" && constraints.video
      ? { ...constraints.video }
      : {};

  delete video.facingMode;
  video.deviceId = { exact: deviceId };

  return {
    ...constraints,
    video,
  };
}

export function setPreferredCameraDeviceId(deviceId: string | null): void {
  preferredCameraDeviceId = deviceId;
}

/**
 * Nubarium only accepts front/back/default. Pin the Foly-selected deviceId
 * on every getUserMedia call the SDK makes.
 * ponytail: global intercept — drop it if the SDK adds a native deviceId option.
 */
export function installCameraDeviceConstraintInterceptor(): void {
  if (typeof navigator === "undefined") return;

  ensureNavigatorMediaDevices();
  const mediaDevices = navigator.mediaDevices as MediaDevicesWithIntercept | undefined;
  if (!mediaDevices?.getUserMedia || mediaDevices.__folyPreferredCameraIntercept) return;

  originalGetUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
  mediaDevices.__folyPreferredCameraIntercept = true;

  mediaDevices.getUserMedia = (constraints) => {
    const original = originalGetUserMedia;
    if (!original) return Promise.reject(new Error("getUserMedia is not available."));

    const preferredId = preferredCameraDeviceId;
    const request = preferredId
      ? original(applyPreferredCameraConstraint(constraints, preferredId)).catch((error: unknown) => {
          if (isOverconstrainedError(error)) {
            return original(constraints);
          }
          throw error;
        })
      : original(constraints);

    return Promise.resolve(request).then((stream) => {
      trackLiveCameraStream(stream);
      return stream;
    });
  };
}

function trackLiveCameraStream(stream: MediaStream): void {
  liveCameraStreams.add(stream);
  const forgetIfEnded = () => {
    if (stream.getTracks().every((track) => track.readyState === "ended")) {
      liveCameraStreams.delete(stream);
    }
  };
  stream.getTracks().forEach((track) => {
    track.addEventListener("ended", forgetIfEnded);
  });
}

export function stopMediaStream(stream: MediaStream | null | undefined): void {
  stream?.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch {
      // Already ended or browser-specific track.
    }
  });
}

/** Stops every camera stream Foly/Nubarium opened so the LED turns off on modal close. */
export function releaseCameraHardware(): void {
  liveCameraStreams.forEach((stream) => stopMediaStream(stream));
  liveCameraStreams.clear();

  if (typeof document === "undefined") return;

  document.querySelectorAll("video").forEach((element) => {
    const video = element as HTMLVideoElement;
    const stream = video.srcObject;
    if (!(stream instanceof MediaStream)) return;
    if (!stream.getVideoTracks().some((track) => track.readyState === "live")) return;
    stopMediaStream(stream);
    video.pause();
    video.srcObject = null;
  });
}

export function mapVideoInputDevices(devices: MediaDeviceInfo[]): CameraDeviceOption[] {
  return devices
    .filter((device) => device.kind === "videoinput" && device.deviceId)
    .map((device, index) => {
      const facing = inferCameraFacing(device.label);
      return {
        deviceId: device.deviceId,
        rawLabel: device.label,
        label: formatCameraLabel({ label: device.label, facing }, index),
        facing,
      };
    });
}

export function translateCameraError(error: unknown): string {
  const name = error instanceof DOMException || error instanceof Error ? error.name : "";

  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "Necesitas permitir el acceso a la cámara para continuar.";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "No se encontró ninguna cámara en este dispositivo.";
    case "NotReadableError":
    case "TrackStartError":
      return "La cámara está en uso por otra aplicación. Ciérrala e intenta de nuevo.";
    case "OverconstrainedError":
      return "La cámara seleccionada no está disponible. Elige otra e intenta de nuevo.";
    case "SecurityError":
      return "El navegador bloqueó el acceso a la cámara en este contexto.";
    default:
      return getCameraAccessFallbackMessage();
  }
}

function getCameraAccessFallbackMessage(): string {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return "La cámara solo funciona con conexión segura (HTTPS).";
  }
  return "No fue posible acceder a la cámara del dispositivo.";
}

function isOverconstrainedError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error
    && (error as { name: string }).name === "OverconstrainedError";
}
