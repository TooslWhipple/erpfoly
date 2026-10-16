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
/**
 * Teléfono o tablet. El SDK legacy trata ambos como "phablet" y bloquea landscape.
 * `(pointer: coarse)` cubre iPad aunque el user agent diga desktop.
 */
export function isTouchCaptureDevice(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;

  const coarsePointer =
    typeof window.matchMedia === "function"
    && window.matchMedia("(pointer: coarse)").matches;
  if (coarsePointer) return true;

  const ua = navigator.userAgent;
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return true;

  return (
    navigator.maxTouchPoints > 1
    && typeof window.matchMedia === "function"
    && window.matchMedia("(max-width: 1366px)").matches
  );
}

interface NubariumLandscapeCapture {
  showRotate?: () => void;
  closeRotate?: () => void;
  isCapturing?: boolean;
}

interface NubariumFaceCaptureErrorGate extends NubariumLandscapeCapture {
  resetTask?: () => void;
  lastReason?: string;
  getMessage?: (key: string) => string;
}

interface NubariumIdCaptureAutorotateGate extends NubariumLandscapeCapture {
  rotate?: (
    srcBase64: string | string[],
    degrees: number,
    callback: (resultBase64: string) => void,
  ) => void;
  getOrientation?: () => string | null;
  videoElement?: HTMLVideoElement | null;
  rootElementId?: string | null;
}

type NubariumCaptureSnapshotFn = (
  rootElementId: string,
  width?: number,
  height?: number,
  compression?: number,
  preview?: boolean,
) => string;

interface NubariumCanvasHelperStatic {
  captureSnapshot: NubariumCaptureSnapshotFn;
}

const FACE_CAPTURE_ROOT_PREFIX = "nubarium-face-capture-";

const landscapeRestorers = new WeakMap<object, () => void>();
const faceErrorRestorers = new WeakMap<object, () => void>();
const idAutorotateRestorers = new WeakMap<object, () => void>();

let faceSnapshotPatched = false;
let originalCaptureSnapshot: NubariumCaptureSnapshotFn | null = null;

export interface CoverCropRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

/** True when one size is landscape and the other is portrait (90° mismatch). */
export function aspectsDifferByQuarterTurn(
  widthA: number,
  heightA: number,
  widthB: number,
  heightB: number,
): boolean {
  if (widthA <= 0 || heightA <= 0 || widthB <= 0 || heightB <= 0) return false;
  return widthA >= heightA !== widthB >= heightB;
}

/**
 * Source rectangle that mirrors CSS `object-fit: cover` when drawing into dest.
 */
export function computeObjectFitCoverCrop(
  sourceWidth: number,
  sourceHeight: number,
  destWidth: number,
  destHeight: number,
): CoverCropRect {
  if (sourceWidth <= 0 || sourceHeight <= 0 || destWidth <= 0 || destHeight <= 0) {
    return { sx: 0, sy: 0, sw: Math.max(0, sourceWidth), sh: Math.max(0, sourceHeight) };
  }

  const sourceAspect = sourceWidth / sourceHeight;
  const destAspect = destWidth / destHeight;

  if (sourceAspect > destAspect) {
    const sw = sourceHeight * destAspect;
    return {
      sx: (sourceWidth - sw) / 2,
      sy: 0,
      sw,
      sh: sourceHeight,
    };
  }

  const sh = sourceWidth / destAspect;
  return {
    sx: 0,
    sy: (sourceHeight - sh) / 2,
    sw: sourceWidth,
    sh,
  };
}

/**
 * Degrees to rotate the camera buffer so the JPEG matches the upright on-screen
 * preview when buffer and display aspects differ by a quarter turn.
 */
export function computeCaptureRotationDegrees(
  bufferWidth: number,
  bufferHeight: number,
  displayWidth: number,
  displayHeight: number,
  screenOrientationAngle: number,
): 0 | 90 | 180 | 270 {
  if (!aspectsDifferByQuarterTurn(bufferWidth, bufferHeight, displayWidth, displayHeight)) {
    return 0;
  }

  const normalized = ((Math.round(screenOrientationAngle / 90) * 90) % 360 + 360) % 360;
  if (normalized === 90 || normalized === 180 || normalized === 270) {
    return normalized;
  }

  // Aspects still disagree but screen reports 0 (common on some tablets).
  if (bufferWidth < bufferHeight && displayWidth > displayHeight) return 90;
  if (bufferWidth > bufferHeight && displayWidth < displayHeight) return 270;
  return 0;
}

export function readScreenOrientationAngle(): number {
  if (typeof window === "undefined") return 0;

  const screenOrientation = window.screen?.orientation;
  if (screenOrientation && typeof screenOrientation.angle === "number") {
    return screenOrientation.angle;
  }

  const legacy = (window as Window & { orientation?: number }).orientation;
  return typeof legacy === "number" ? legacy : 0;
}

function drawVideoCoverOntoCanvas(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  destWidth: number,
  destHeight: number,
  rotationDegrees: 0 | 90 | 180 | 270,
): void {
  const bufferWidth = video.videoWidth;
  const bufferHeight = video.videoHeight;
  if (bufferWidth <= 0 || bufferHeight <= 0) {
    ctx.drawImage(video, 0, 0, destWidth, destHeight);
    return;
  }

  const rotatedWidth = rotationDegrees === 90 || rotationDegrees === 270
    ? bufferHeight
    : bufferWidth;
  const rotatedHeight = rotationDegrees === 90 || rotationDegrees === 270
    ? bufferWidth
    : bufferHeight;
  const crop = computeObjectFitCoverCrop(
    rotatedWidth,
    rotatedHeight,
    destWidth,
    destHeight,
  );

  ctx.save();
  ctx.clearRect(0, 0, destWidth, destHeight);

  if (rotationDegrees === 0) {
    ctx.drawImage(
      video,
      crop.sx,
      crop.sy,
      crop.sw,
      crop.sh,
      0,
      0,
      destWidth,
      destHeight,
    );
    ctx.restore();
    return;
  }

  const intermediate = document.createElement("canvas");
  intermediate.width = rotatedWidth;
  intermediate.height = rotatedHeight;
  const intermediateCtx = intermediate.getContext("2d");
  if (!intermediateCtx) {
    ctx.drawImage(video, 0, 0, destWidth, destHeight);
    ctx.restore();
    return;
  }

  intermediateCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
  intermediateCtx.rotate((rotationDegrees * Math.PI) / 180);
  intermediateCtx.drawImage(video, -bufferWidth / 2, -bufferHeight / 2);
  ctx.drawImage(
    intermediate,
    crop.sx,
    crop.sy,
    crop.sw,
    crop.sh,
    0,
    0,
    destWidth,
    destHeight,
  );
  ctx.restore();
}

function captureFaceSnapshotCover(
  rootElementId: string,
  compression = 1.0,
  preview?: boolean,
): string {
  const canvas = document.getElementById(`${rootElementId}-canvas-ssh`) as HTMLCanvasElement | null;
  const video = document.getElementById(`${rootElementId}-video`) as HTMLVideoElement | null;
  if (!canvas || !video) {
    return originalCaptureSnapshot?.(rootElementId, undefined, undefined, compression, preview) ?? "";
  }

  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext("2d");
  if (!ctx || width <= 0 || height <= 0) {
    return originalCaptureSnapshot?.(rootElementId, width, height, compression, preview) ?? "";
  }

  canvas.style.visibility = "visible";

  const displayRect = video.getBoundingClientRect();
  const displayWidth = displayRect.width || video.clientWidth || width;
  const displayHeight = displayRect.height || video.clientHeight || height;
  const rotation = computeCaptureRotationDegrees(
    video.videoWidth,
    video.videoHeight,
    displayWidth,
    displayHeight,
    readScreenOrientationAngle(),
  );

  drawVideoCoverOntoCanvas(ctx, video, width, height, rotation);
  const dataUrl = canvas.toDataURL("image/jpeg", compression);

  if (preview) {
    const previewEl = document.getElementById(`${rootElementId}-canvas5`) as HTMLImageElement | null;
    if (previewEl) {
      previewEl.src = dataUrl;
      previewEl.style.visibility = "visible";
    }
  }

  return dataUrl;
}

/**
 * Replace FaceCapture snapshot drawing so the JPEG matches `object-fit: cover`
 * (and upright orientation) instead of a stretched raw buffer.
 */
export function installNubariumFaceCaptureSnapshotPatch(): void {
  if (typeof window === "undefined" || faceSnapshotPatched) return;

  const helper = (window as Window & { NubSdkCanvasHelper?: NubariumCanvasHelperStatic })
    .NubSdkCanvasHelper;
  if (!helper || typeof helper.captureSnapshot !== "function") return;

  originalCaptureSnapshot = helper.captureSnapshot.bind(helper);
  helper.captureSnapshot = (rootElementId, width, height, compression, preview) => {
    if (!String(rootElementId).startsWith(FACE_CAPTURE_ROOT_PREFIX)) {
      return originalCaptureSnapshot!(rootElementId, width, height, compression, preview);
    }
    return captureFaceSnapshotCover(rootElementId, compression ?? 1.0, preview);
  };
  faceSnapshotPatched = true;
}

/** Map API framing reasons to SDK on-screen message keys (not lighting). */
export function mapFramingFailMessageKey(
  lastReason: string | undefined,
): "FAIL_NOFACE" | "FAIL_FACEOUTSIDE" | null {
  if (!lastReason?.trim()) return null;
  const normalized = lastReason.trim().toLowerCase().replace(/-/g, "_");

  if (
    normalized === "no_face"
    || normalized === "noface"
    || normalized === "fail_noface"
  ) {
    return "FAIL_NOFACE";
  }

  if (
    normalized === "face_outside"
    || normalized === "outside"
    || normalized === "fail_outside"
    || normalized === "fail_faceoutside"
  ) {
    return "FAIL_FACEOUTSIDE";
  }

  return null;
}

function hideNubariumRotateOverlay(): void {
  if (typeof document === "undefined") return;
  const overlay = document.getElementById("NUBSDK_modal_rotate");
  if (!overlay) return;
  overlay.setAttribute("aria-hidden", "true");
  overlay.classList.remove("open");
}

function unlockNubariumLandscape(capture: NubariumLandscapeCapture): void {
  try {
    capture.closeRotate?.();
  } catch {
    // The SDK throws if the rotate modal was never mounted.
  }
  capture.isCapturing = false;
  hideNubariumRotateOverlay();
}

/**
 * nubSdk@latest calls showRotate() and then sets isCapturing = true whenever a
 * touch device is landscape. There is no public init option to allow landscape.
 * Replace showRotate so the overlay never stays up, and clear isCapturing on the
 * next turn because the SDK sets it after showRotate() returns.
 */
export function patchNubariumLandscapeCapture(
  capture: NubariumLandscapeCapture | null | undefined,
): void {
  if (!capture || typeof capture.showRotate !== "function") return;
  if (!isTouchCaptureDevice()) return;
  if (landscapeRestorers.has(capture)) return;

  const originalShowRotate = capture.showRotate.bind(capture);
  capture.showRotate = () => {
    unlockNubariumLandscape(capture);
    window.setTimeout(() => unlockNubariumLandscape(capture), 0);
  };

  landscapeRestorers.set(capture, () => {
    capture.showRotate = originalShowRotate;
  });
  unlockNubariumLandscape(capture);
}

/**
 * SDK resetTask() always shows FAIL_LOWAVG ("mejor iluminado") on every retry.
 * When lastReason is framing (no face / outside), show that message instead.
 */
export function patchNubariumFaceCaptureErrors(
  capture: NubariumFaceCaptureErrorGate | null | undefined,
): void {
  if (!capture || typeof capture.resetTask !== "function") return;
  if (faceErrorRestorers.has(capture)) return;
  if (typeof capture.getMessage !== "function") return;

  const originalResetTask = capture.resetTask.bind(capture);
  const originalGetMessage = capture.getMessage.bind(capture);

  capture.resetTask = () => {
    capture.getMessage = (key: string) => {
      if (key === "FAIL_LOWAVG") {
        const framingKey = mapFramingFailMessageKey(capture.lastReason);
        if (framingKey) return originalGetMessage(framingKey);
      }
      return originalGetMessage(key);
    };
    try {
      originalResetTask();
    } finally {
      capture.getMessage = originalGetMessage;
    }
  };

  faceErrorRestorers.set(capture, () => {
    capture.resetTask = originalResetTask;
    capture.getMessage = originalGetMessage;
  });
}

/**
 * When device is portrait, IdCapture autorotate always applies -90° so OCR gets
 * landscape. If the snapshot canvas was already landscape (viewport wider than
 * tall), that second rotation leaves the INE on its side. Skip -90°/270° when
 * the source JPEG is already landscape.
 */
export function shouldSkipIdAutorotate(
  imageWidth: number,
  imageHeight: number,
  degrees: number,
): boolean {
  const normalized = ((degrees % 360) + 360) % 360;
  if (normalized !== 90 && normalized !== 270) return false;
  return imageWidth > 0 && imageHeight > 0 && imageWidth >= imageHeight;
}

/** Orientation from the on-screen video box (not iOS screen.width, which stays portrait). */
export function orientationFromVideoBox(
  width: number,
  height: number,
): "PORTRAIT" | "LANDSCAPE" | null {
  if (width <= 0 || height <= 0) return null;
  return height > width ? "PORTRAIT" : "LANDSCAPE";
}

function toImageDataUrl(srcBase64: string): string {
  const trimmed = srcBase64.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return trimmed;
  return `data:image/jpeg;base64,${trimmed}`;
}

function resolveIdCaptureVideo(
  capture: NubariumIdCaptureAutorotateGate,
): HTMLVideoElement | null {
  if (capture.videoElement) return capture.videoElement;
  const rootId = capture.rootElementId?.trim();
  if (!rootId || typeof document === "undefined") return null;
  return document.getElementById(`${rootId}-video`) as HTMLVideoElement | null;
}

export function patchNubariumIdCaptureAutorotate(
  capture: NubariumIdCaptureAutorotateGate | null | undefined,
): void {
  if (!capture || idAutorotateRestorers.has(capture)) return;

  const restorers: Array<() => void> = [];

  // iPad keeps screen.width/height in portrait values, so the SDK always
  // autorotates. Prefer the live video box (matches the snapshot canvas).
  if (typeof capture.getOrientation === "function") {
    const originalGetOrientation = capture.getOrientation.bind(capture);
    capture.getOrientation = () => {
      const video = resolveIdCaptureVideo(capture);
      if (video) {
        const fromBox = orientationFromVideoBox(video.offsetWidth, video.offsetHeight);
        if (fromBox) return fromBox;
      }
      return originalGetOrientation();
    };
    restorers.push(() => {
      capture.getOrientation = originalGetOrientation;
    });
  }

  if (typeof capture.rotate === "function") {
    const originalRotate = capture.rotate.bind(capture);
    capture.rotate = (srcBase64, degrees, callback) => {
      const normalized = ((degrees % 360) + 360) % 360;
      if (normalized !== 90 && normalized !== 270) {
        originalRotate(srcBase64, degrees, callback);
        return;
      }

      // media.user can be a single data URL or a sample array from the SDK.
      const candidate = Array.isArray(srcBase64) ? srcBase64[0] : srcBase64;
      if (typeof candidate !== "string" || !candidate.trim()) {
        originalRotate(srcBase64, degrees, callback);
        return;
      }

      const image = new Image();
      image.onload = () => {
        if (shouldSkipIdAutorotate(image.width, image.height, degrees)) {
          // Downstream always expects a data-URL string, never the sample array.
          callback(candidate);
          return;
        }
        originalRotate(srcBase64, degrees, callback);
      };
      image.onerror = () => {
        originalRotate(srcBase64, degrees, callback);
      };
      image.src = toImageDataUrl(candidate);
    };
    restorers.push(() => {
      capture.rotate = originalRotate;
    });
  }

  if (restorers.length === 0) return;
  idAutorotateRestorers.set(capture, () => {
    for (const restore of restorers) restore();
  });
}

export function releaseNubariumLandscapeCapture(
  capture: NubariumLandscapeCapture | null | undefined,
): void {
  if (!capture) return;
  const restore = landscapeRestorers.get(capture);
  restore?.();
  landscapeRestorers.delete(capture);
  const restoreErrors = faceErrorRestorers.get(capture);
  restoreErrors?.();
  faceErrorRestorers.delete(capture);
  const restoreAutorotate = idAutorotateRestorers.get(capture);
  restoreAutorotate?.();
  idAutorotateRestorers.delete(capture);
  try {
    capture.closeRotate?.();
  } catch {
    // Ignore teardown races with the SDK DOM.
  }
  hideNubariumRotateOverlay();
}

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
  const normalized = reason?.trim().toLowerCase().replace(/-/g, "_") ?? "";

  switch (normalized) {
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
    case "noface":
    case "fail_noface":
      return "No se detectó un rostro en la captura.";
    case "face_outside":
    case "outside":
    case "fail_outside":
    case "fail_faceoutside":
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
