export type NubariumCameraOption = "back" | "front" | "default";

type LegacyGetUserMedia = (
  constraints: MediaStreamConstraints,
  success: (stream: MediaStream) => void,
  error: (error: unknown) => void,
) => void;

type NavigatorWithLegacyMedia = Navigator & {
  mediaDevices?: MediaDevices;
  getUserMedia?: LegacyGetUserMedia;
  webkitGetUserMedia?: LegacyGetUserMedia;
  mozGetUserMedia?: LegacyGetUserMedia;
};

/**
 * Polyfill mínimo para navegadores que exponen getUserMedia legacy pero no mediaDevices.
 * ponytail: no sustituye HTTPS; en contexto inseguro la API sigue bloqueada.
 */
export function ensureNavigatorMediaDevices(): void {
  if (typeof navigator === "undefined") return;

  const nav = navigator as NavigatorWithLegacyMedia;

  if (!nav.mediaDevices) {
    nav.mediaDevices = {} as MediaDevices;
  }

  if (typeof nav.mediaDevices.getUserMedia === "function") return;

  const legacyGetUserMedia =
    nav.getUserMedia ?? nav.webkitGetUserMedia ?? nav.mozGetUserMedia;

  if (!legacyGetUserMedia) return;

  nav.mediaDevices.getUserMedia = (constraints) =>
    new Promise((resolve, reject) => {
      legacyGetUserMedia.call(nav, constraints ?? {}, resolve, reject);
    });
}

/** Mensaje en español si el navegador no puede usar la cámara; null si parece disponible. */
export function getCameraAccessErrorMessage(): string | null {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return null;
  }

  ensureNavigatorMediaDevices();

  if (!window.isSecureContext) {
    return "La cámara solo funciona con conexión segura (HTTPS). Abre la aplicación con https:// e intenta de nuevo.";
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    return "Tu navegador no permite acceder a la cámara. Usa Chrome o Safari actualizado.";
  }

  return null;
}

function isCameraAccessErrorMessage(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  return (
    normalized.includes("getusermedia")
    || normalized.includes("mediadevices")
    || normalized.includes("undefined (reading 'getusermedia')")
  );
}

/**
 * Preferencia de cámara según el dispositivo.
 * En móvil: trasera primero (documentos / captura preferida), frontal como alternativa.
 * En desktop: `default` primero — las PCs no tienen cámara trasera y pedir `back`
 * deja el preview vacío aunque el navegador sí conceda permisos.
 */
export function getNubariumCameraOptions(): NubariumCameraOption[] {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return ["default", "front", "back"];
  }

  const ua = navigator.userAgent;
  const isMobileUa = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const isTouchTablet =
    navigator.maxTouchPoints > 1 &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(max-width: 1024px)").matches;

  if (isMobileUa || isTouchTablet) {
    return ["back", "front", "default"];
  }

  return ["default", "front", "back"];
}

export const NUBARIUM_ID_CAPTURE_CONFIG = {
  timeouts: { front: 180000, back: 180000 },
  captureMode: {
    front: { enabled: true, after: 5000 },
    back: { enabled: true, after: 5000 },
  },
  guide: {
    front: { enabled: true },
    back: { enabled: true, until: 10000 },
  },
  // Nubarium: rotates the captured JPEG to landscape for OCR, not the on-screen guide.
  autorotate: true,
  antispoofing: {
    enabled: true,
    level: 1,
  },
  custom: { document: "MEX_IdCard" },
} as const;

export const NUBARIUM_FACE_CAPTURE_CONFIG = {
  maxValidations: 10,
  features: {
    disabled: [],
    enabled: ["glasses", "facemask"],
  },
  antispoofing: {
    enabled: false,
  },
  timeout: 180000,
} as const;

export function inferImageMimeType(base64Payload: string): string {
  const normalized = base64Payload.trim();
  if (normalized.startsWith("iVBORw0KGgo")) return "image/png";
  if (normalized.startsWith("/9j/")) return "image/jpeg";
  if (normalized.startsWith("R0lGOD")) return "image/gif";
  if (normalized.startsWith("UklGR")) return "image/webp";
  return "image/jpeg";
}

export function base64ToDataUrl(value: unknown, fallbackMimeType = "image/jpeg"): string {
  if (typeof value !== "string") return "";

  const normalized = value.trim();
  if (!normalized) return "";
  if (normalized.startsWith("blob:")) return normalized;
  if (normalized.startsWith("data:")) return normalized;
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) return normalized;

  const mimeType = inferImageMimeType(normalized) || fallbackMimeType;
  return `data:${mimeType};base64,${normalized}`;
}

/** Normaliza distintos formatos de imagen que puede devolver el SDK de Nubarium. */
export function extractSdkImageDataUrl(...candidates: unknown[]): string {
  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      const dataUrl = base64ToDataUrl(candidate);
      if (dataUrl) return dataUrl;
      continue;
    }

    if (typeof Blob !== "undefined" && candidate instanceof Blob) {
      return URL.createObjectURL(candidate);
    }

    if (Array.isArray(candidate)) {
      const dataUrl = extractSdkImageDataUrl(...candidate);
      if (dataUrl) return dataUrl;
      continue;
    }

    if (!candidate || typeof candidate !== "object") continue;

    const record = candidate as Record<string, unknown>;
    for (const nested of [
      record.base64,
      record.data,
      record.image,
      record.content,
      record.url,
      record.src,
      record.front,
      record.back,
      record.face,
      record.anverso,
      record.reverso,
      record.jpeg,
      record.jpg,
      record.png,
      record.file,
    ]) {
      const dataUrl = extractSdkImageDataUrl(nested);
      if (dataUrl) return dataUrl;
    }
  }

  return "";
}

export function extractNubariumExecutionId(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const record = data as Record<string, unknown>;
  for (const key of ["id", "executionId", "execution_id", "uuid", "transactionId"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function extractIdCaptureImages(data: {
  front?: unknown;
  back?: unknown;
  anverso?: unknown;
  reverso?: unknown;
  images?: { front?: unknown; back?: unknown };
  resources?: Record<string, unknown> | {
    front?: unknown;
    back?: unknown;
    images?: { front?: unknown; back?: unknown };
    id?: { front?: unknown; back?: unknown };
  };
}): { frontDataUrl: string; backDataUrl: string } {
  const resources = data.resources;
  const resourceRecord = resources && typeof resources === "object"
    ? resources as Record<string, unknown>
    : undefined;
  const idResources =
    resourceRecord && "id" in resourceRecord
      ? (resourceRecord.id as { front?: unknown; back?: unknown } | undefined)
      : undefined;
  const resourceImages =
    resourceRecord && "images" in resourceRecord
      ? (resourceRecord.images as { front?: unknown; back?: unknown } | undefined)
      : undefined;

  const frontDataUrl = extractSdkImageDataUrl(
    data.front,
    data.anverso,
    data.images?.front,
    resourceRecord?.front,
    resourceImages?.front,
    idResources?.front,
  );
  const backDataUrl = extractSdkImageDataUrl(
    data.back,
    data.reverso,
    data.images?.back,
    resourceRecord?.back,
    resourceImages?.back,
    idResources?.back,
  );

  return { frontDataUrl, backDataUrl };
}

export function extractFaceCaptureImage(data: {
  face?: unknown;
  frame?: unknown;
  resources?: Record<string, unknown> | { face?: unknown; frame?: unknown };
}): string {
  const resources = data.resources;

  return extractSdkImageDataUrl(
    data.face,
    data.frame,
    resources && typeof resources === "object" ? resources.face : undefined,
    resources && typeof resources === "object" ? resources.frame : undefined,
  );
}

export function translateNubariumFailReason(reason: string | undefined): string {
  switch (reason) {
    case "capture_front_timeout":
      return "Se agotó el tiempo para capturar el frente de la INE.";
    case "capture_back_timeout":
      return "Se agotó el tiempo para capturar el reverso de la INE.";
    case "capture_face_timeout":
      return "Se agotó el tiempo para capturar el rostro.";
    case "low_evaluation":
      return "La evaluación biométrica no alcanzó el puntaje mínimo.";
    case "ocr_not_readable":
      return "No fue posible leer la información de la INE.";
    case "low_accurate_ocr":
      return "La lectura OCR de la INE tiene baja precisión.";
    case "suspicious_attack":
      return "Se detectó un posible intento de suplantación.";
    case "no_face":
      return "No se detectó un rostro en la captura.";
    case "face_outside":
      return "El rostro quedó fuera del área de captura.";
    case "facemask_not_allowed":
      return "No se permite cubrebocas durante la captura.";
    case "glasses_not_allowed":
      return "No se permiten lentes durante la captura.";
    default:
      return reason?.trim()
        ? `La captura no se completó (${reason}).`
        : "La captura no se completó. Intenta nuevamente.";
  }
}

export function translateNubariumError(error: { code?: string | number; msg?: string; message?: string }): string {
  const message = error.msg ?? error.message;
  if (message?.trim()) {
    if (isCameraAccessErrorMessage(message)) {
      return getCameraAccessErrorMessage() ?? "No fue posible acceder a la cámara del dispositivo.";
    }
    return message.trim();
  }
  if (error.code !== undefined && `${error.code}`.trim()) {
    return `Error del SDK (${error.code}).`;
  }
  return "Ocurrió un error al inicializar la captura biométrica.";
}

interface NubariumClearable {
  clear(): void;
}

/** Evita errores del SDK cuando React ya desmontó el contenedor root. Always try clear() — skipping it leaks the camera. */
export function safeClearNubariumCapture(
  capture: NubariumClearable | null | undefined,
  _rootElementId?: string,
): void {
  if (!capture) return;

  try {
    capture.clear();
  } catch {
    // The SDK may throw if the DOM was removed before cleanup.
  }
}
