import { isTouchCaptureDevice } from "./media";
import { mapFramingFailMessageKey } from "./messages";

export type NubariumCaptureKind = "id" | "face";

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

interface NubariumIdCaptureOrientationGate extends NubariumLandscapeCapture {
  getOrientation?: () => string | null;
  rootElementId?: string | null;
  name?: string;
  currentTask?: { type?: string };
  currentTaskConfiguration?: { areaType?: string | null };
  componentHelper?: {
    getFrameDimension?: (frameClass: string, orientation: unknown, extra?: unknown) => unknown;
  };
  nubSdkCanvasHelper?: {
    setDrawFrame?: (rectangle: unknown, type: unknown) => void;
  };
  updateFrameUi?: () => void;
  prepareGuide?: () => void;
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
  draw?: (rootElementId: string, rectangle: unknown, type: unknown) => void;
}

export interface CoverCropRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
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

function drawVideoCoverOntoCanvas(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  destWidth: number,
  destHeight: number,
): void {
  const bufferWidth = video.videoWidth;
  const bufferHeight = video.videoHeight;
  if (bufferWidth <= 0 || bufferHeight <= 0) {
    ctx.drawImage(video, 0, 0, destWidth, destHeight);
    return;
  }

  const crop = computeObjectFitCoverCrop(
    bufferWidth,
    bufferHeight,
    destWidth,
    destHeight,
  );

  ctx.clearRect(0, 0, destWidth, destHeight);
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
}

function captureSnapshotCover(
  rootElementId: string,
  compression = 1.0,
  preview?: boolean,
  original?: NubariumCaptureSnapshotFn | null,
): string {
  const canvas = document.getElementById(`${rootElementId}-canvas-ssh`) as HTMLCanvasElement | null;
  const video = document.getElementById(`${rootElementId}-video`) as HTMLVideoElement | null;
  if (!canvas || !video) {
    return original?.(rootElementId, undefined, undefined, compression, preview) ?? "";
  }

  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext("2d");
  if (!ctx || width <= 0 || height <= 0) {
    return original?.(rootElementId, width, height, compression, preview) ?? "";
  }

  canvas.style.visibility = "visible";
  drawVideoCoverOntoCanvas(ctx, video, width, height);
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

let snapshotPatched = false;
let originalCaptureSnapshot: NubariumCaptureSnapshotFn | null = null;
let snapshotPatchUsers = 0;

function installCaptureSnapshotPatch(): void {
  if (typeof window === "undefined") return;

  snapshotPatchUsers += 1;
  if (snapshotPatched) return;

  const helper = (window as Window & { NubSdkCanvasHelper?: NubariumCanvasHelperStatic })
    .NubSdkCanvasHelper;
  if (!helper || typeof helper.captureSnapshot !== "function") return;

  originalCaptureSnapshot = helper.captureSnapshot.bind(helper);
  helper.captureSnapshot = (rootElementId, _width, _height, compression, preview) =>
    captureSnapshotCover(
      rootElementId,
      compression ?? 1.0,
      preview,
      originalCaptureSnapshot,
    );
  snapshotPatched = true;
}

function uninstallCaptureSnapshotPatch(): void {
  snapshotPatchUsers = Math.max(0, snapshotPatchUsers - 1);
  if (snapshotPatchUsers > 0 || !snapshotPatched) return;

  const helper = (window as Window & { NubSdkCanvasHelper?: NubariumCanvasHelperStatic })
    .NubSdkCanvasHelper;
  if (helper && originalCaptureSnapshot) {
    helper.captureSnapshot = originalCaptureSnapshot;
  }
  originalCaptureSnapshot = null;
  snapshotPatched = false;
}

function patchLandscapeGate(capture: NubariumLandscapeCapture): () => void {
  if (typeof capture.showRotate !== "function" || !isTouchCaptureDevice()) {
    return () => undefined;
  }

  const originalShowRotate = capture.showRotate.bind(capture);
  capture.showRotate = () => {
    unlockNubariumLandscape(capture);
    window.setTimeout(() => unlockNubariumLandscape(capture), 0);
  };
  unlockNubariumLandscape(capture);

  return () => {
    capture.showRotate = originalShowRotate;
  };
}

function patchFixedLandscapeOrientation(
  capture: NubariumIdCaptureOrientationGate,
): () => void {
  if (typeof capture.getOrientation !== "function") {
    return () => undefined;
  }

  const originalGetOrientation = capture.getOrientation.bind(capture);
  // Visor Foly is always 4:3 landscape — ignore screen.width quirks on iPad/Android.
  capture.getOrientation = () => "LANDSCAPE";

  return () => {
    capture.getOrientation = originalGetOrientation;
  };
}

function patchFaceCaptureErrors(capture: NubariumFaceCaptureErrorGate): () => void {
  if (typeof capture.resetTask !== "function" || typeof capture.getMessage !== "function") {
    return () => undefined;
  }

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

  return () => {
    capture.resetTask = originalResetTask;
    capture.getMessage = originalGetMessage;
  };
}

function resolveRootElementId(capture: NubariumIdCaptureOrientationGate): string | null {
  const fromCapture = capture.rootElementId?.trim();
  if (fromCapture) return fromCapture;
  return null;
}

function redrawCaptureFrame(capture: NubariumIdCaptureOrientationGate): void {
  const rootId = resolveRootElementId(capture);
  if (!rootId || typeof document === "undefined") return;

  const video = document.getElementById(`${rootId}-video`) as HTMLVideoElement | null;
  if (!video || video.offsetWidth <= 0 || video.offsetHeight <= 0) return;

  const taskType = capture.currentTask?.type;
  const areaType = capture.currentTaskConfiguration?.areaType;
  const name = capture.name ?? "IdCapture";

  try {
    if (taskType && typeof capture.componentHelper?.getFrameDimension === "function") {
      const frame = capture.componentHelper.getFrameDimension(`${name}_${taskType}`, null);
      const helper = (window as Window & { NubSdkCanvasHelper?: NubariumCanvasHelperStatic })
        .NubSdkCanvasHelper;
      if (frame && helper && typeof helper.draw === "function" && areaType != null) {
        helper.draw(rootId, frame, areaType);
      } else if (frame && typeof capture.nubSdkCanvasHelper?.setDrawFrame === "function" && areaType != null) {
        capture.nubSdkCanvasHelper.setDrawFrame(frame, areaType);
      }
    }

    capture.updateFrameUi?.();

    const guideImg = document.getElementById(`${rootId}-canvas-bg`) as HTMLImageElement | null;
    const guideVisible = guideImg
      && guideImg.style.visibility !== "hidden"
      && !guideImg.src.includes("transparent.png");
    if (guideVisible) {
      capture.prepareGuide?.();
    }
  } catch {
    // SDK DOM may be mid-teardown during orientation changes.
  }
}

function patchViewportResize(
  capture: NubariumIdCaptureOrientationGate,
  viewportEl: HTMLElement | null,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const previousOnResize = window.onresize;
  window.onresize = null;

  let debounceTimer: number | null = null;
  const scheduleRedraw = () => {
    if (debounceTimer != null) window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      debounceTimer = null;
      redrawCaptureFrame(capture);
    }, 120);
  };

  const observer = typeof ResizeObserver !== "undefined" && viewportEl
    ? new ResizeObserver(scheduleRedraw)
    : null;
  observer?.observe(viewportEl!);

  window.addEventListener("orientationchange", scheduleRedraw);

  // Initial redraw after layout settles (guide may have used wrong screen size).
  window.setTimeout(() => redrawCaptureFrame(capture), 50);

  return () => {
    if (debounceTimer != null) window.clearTimeout(debounceTimer);
    observer?.disconnect();
    window.removeEventListener("orientationchange", scheduleRedraw);
    window.onresize = previousOnResize;
  };
}

interface ApplyNubariumCapturePatchesOptions {
  viewportEl?: HTMLElement | null;
}

/**
 * Apply all Foly patches for a Nubarium capture instance.
 * Returns a single restore function — call it on unmount / clear.
 */
export function applyNubariumCapturePatches(
  capture: object | null | undefined,
  kind: NubariumCaptureKind,
  options: ApplyNubariumCapturePatchesOptions = {},
): () => void {
  if (!capture) return () => undefined;

  const gate = capture as NubariumIdCaptureOrientationGate & NubariumFaceCaptureErrorGate;
  const restorers: Array<() => void> = [];

  restorers.push(patchLandscapeGate(gate));
  installCaptureSnapshotPatch();
  restorers.push(() => uninstallCaptureSnapshotPatch());

  if (kind === "id") {
    restorers.push(patchFixedLandscapeOrientation(gate));
  }

  if (kind === "face") {
    restorers.push(patchFaceCaptureErrors(gate));
  }

  restorers.push(patchViewportResize(gate, options.viewportEl ?? null));

  let released = false;
  return () => {
    if (released) return;
    released = true;
    for (const restore of restorers.reverse()) {
      try {
        restore();
      } catch {
        // Ignore restore races with SDK teardown.
      }
    }
    try {
      gate.closeRotate?.();
    } catch {
      // Ignore.
    }
    hideNubariumRotateOverlay();
  };
}

interface NubariumClearable {
  clear(): void;
}

/** Evita errores del SDK cuando React ya desmontó el contenedor root. */
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
