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

interface FrameRect {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

interface GetFrameDimensionFn {
  (frameClass: string, orientation: unknown, extra?: unknown): unknown;
}

const VIDEO_BOX_TOLERANCE_PX = 2;
const REDRAW_DELAYS_MS = [0, 100, 300, 600] as const;

export interface NubariumVideoBox {
  width: number;
  height: number;
}

export interface CaptureBoxInput {
  hostWidth: number;
  hostHeight: number;
  videoOffsetWidth: number;
  videoOffsetHeight: number;
  videoRectWidth: number;
  videoRectHeight: number;
}

export type GuideRedrawMode = "setDrawFrame" | "draw" | "skip";

/**
 * Prefer the Foly viewport (or media container) over the raw video box.
 * On tablets the SDK reads `video.offset*` before the 4:3 host has settled,
 * so the oval/INE frame is computed against a box taller than the visor.
 */
export function resolveCaptureBox(input: CaptureBoxInput): NubariumVideoBox {
  if (input.hostWidth > 0 && input.hostHeight > 0) {
    return { width: input.hostWidth, height: input.hostHeight };
  }
  if (input.videoRectWidth > 0 && input.videoRectHeight > 0) {
    return { width: input.videoRectWidth, height: input.videoRectHeight };
  }
  return {
    width: Math.max(0, input.videoOffsetWidth),
    height: Math.max(0, input.videoOffsetHeight),
  };
}

export function videoBoxNeedsSync(
  videoOffsetWidth: number,
  videoOffsetHeight: number,
  box: NubariumVideoBox,
  tolerance = VIDEO_BOX_TOLERANCE_PX,
): boolean {
  if (box.width <= 0 || box.height <= 0) return false;
  return (
    Math.abs(videoOffsetWidth - box.width) > tolerance
    || Math.abs(videoOffsetHeight - box.height) > tolerance
  );
}

/**
 * `setDrawFrame` places the yellow guide from the frame rect.
 * `NubSdkCanvasHelper.draw` then halves `top` and swaps in INE 54:86 mask math,
 * which blows the face oval out of the tablet visor.
 */
export function selectGuideRedrawMode(input: {
  hasFrame: boolean;
  areaType: string | null | undefined;
  hasSetDrawFrame: boolean;
  hasDraw: boolean;
}): GuideRedrawMode {
  if (!input.hasFrame || input.areaType == null) return "skip";
  if (input.hasSetDrawFrame) return "setDrawFrame";
  if (input.hasDraw) return "draw";
  return "skip";
}

const viewportByRootId = new Map<string, HTMLElement | null>();

function rememberViewport(rootId: string | null | undefined, viewportEl: HTMLElement | null): void {
  const id = rootId?.trim();
  if (!id) return;
  viewportByRootId.set(id, viewportEl);
}

function forgetViewport(rootId: string | null | undefined): void {
  const id = rootId?.trim();
  if (!id) return;
  viewportByRootId.delete(id);
}

function hostElement(rootId: string, viewportEl?: HTMLElement | null): HTMLElement | null {
  if (viewportEl && viewportEl.clientWidth > 0 && viewportEl.clientHeight > 0) {
    return viewportEl;
  }
  if (typeof document === "undefined") return viewportEl ?? null;
  return (
    document.getElementById(`${rootId}-container`)
    ?? document.getElementById(rootId)?.querySelector<HTMLElement>(".NUBSDK_FC_MEDIA_CONTAINER")
    ?? document.getElementById(rootId)
    ?? viewportEl
    ?? null
  );
}

export function measureNubariumVideoBox(
  rootId: string,
  viewportEl?: HTMLElement | null,
): NubariumVideoBox {
  if (typeof document === "undefined") return { width: 0, height: 0 };

  const host = hostElement(rootId, viewportEl ?? viewportByRootId.get(rootId) ?? null);
  const video = document.getElementById(`${rootId}-video`) as HTMLVideoElement | null;
  const rect = video?.getBoundingClientRect();

  return resolveCaptureBox({
    hostWidth: host?.clientWidth ?? 0,
    hostHeight: host?.clientHeight ?? 0,
    videoOffsetWidth: video?.offsetWidth ?? 0,
    videoOffsetHeight: video?.offsetHeight ?? 0,
    videoRectWidth: rect?.width ?? 0,
    videoRectHeight: rect?.height ?? 0,
  });
}

/** Pin the live video to the visor so SDK `offsetWidth/offsetHeight` match the 4:3 host. */
export function syncNubariumVideoLayout(
  rootId: string,
  viewportEl?: HTMLElement | null,
): NubariumVideoBox {
  const box = measureNubariumVideoBox(rootId, viewportEl);
  if (typeof document === "undefined") return box;

  const video = document.getElementById(`${rootId}-video`) as HTMLVideoElement | null;
  if (!video || !videoBoxNeedsSync(video.offsetWidth, video.offsetHeight, box)) {
    return box;
  }

  video.style.width = `${box.width}px`;
  video.style.height = `${box.height}px`;
  video.style.maxWidth = `${box.width}px`;
  video.style.maxHeight = `${box.height}px`;
  video.style.objectFit = "cover";
  return box;
}

function isFrameRect(value: unknown): value is FrameRect {
  return Boolean(value) && typeof value === "object";
}

/** Undo the SDK draw() `top: y/2` shift and keep the guide image on the same box. */
function restoreGuideBox(rootId: string, rectangle: FrameRect): void {
  if (typeof document === "undefined") return;
  const y = Math.round(Number(rectangle.y) || 0);
  const x = Number(rectangle.x) || 0;
  const w = Number(rectangle.w) || 0;
  const h = Number(rectangle.h) || 0;
  if (w <= 0 || h <= 0) return;

  for (const id of [`${rootId}-canvas`, `${rootId}-canvas-bg`]) {
    const el = document.getElementById(id) as (HTMLCanvasElement & HTMLImageElement) | null;
    if (!el) continue;
    el.width = w;
    el.height = h;
    el.style.top = `${y}px`;
    el.style.left = `${x}px`;
  }
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

const CONTAIN_STYLE_ID = "foly-nubarium-capture-contain";

/**
 * The SDK assigns `className = "NUBSDK_container"` on the host and drops the
 * Emotion class, so visor rules have to live in a stylesheet keyed by our id.
 * Without that, the video lays out at its intrinsic height and the oval/INE
 * frame is computed against a box taller than the tablet visor.
 */
const CONTAIN_CSS = `
[data-nubarium-host] {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}
[data-nubarium-host] [id$="-body"],
[data-nubarium-host] [id$="-media"],
[data-nubarium-host] .NUBSDK_FC_MEDIA_CONTAINER,
[data-nubarium-host] .NUBSDK_FC_SLIDES {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  margin: 0;
  overflow: hidden;
  box-sizing: border-box;
}
[data-nubarium-host] video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
[data-nubarium-host] canvas.NUBSDK_FC_CANVAS,
[data-nubarium-host] img.NUBSDK_FC_CANVAS_IMAGE {
  position: absolute;
  box-sizing: border-box;
  max-width: none;
  max-height: none;
}
[data-nubarium-host] canvas.NUBSDK_FC_CANVAS-SSH {
  display: none;
}
`;

let containStyleUsers = 0;

function installContainmentStyles(): void {
  if (typeof document === "undefined") return;
  containStyleUsers += 1;
  if (document.getElementById(CONTAIN_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = CONTAIN_STYLE_ID;
  style.textContent = CONTAIN_CSS;
  document.head.appendChild(style);
}

function uninstallContainmentStyles(): void {
  containStyleUsers = Math.max(0, containStyleUsers - 1);
  if (containStyleUsers > 0 || typeof document === "undefined") return;
  document.getElementById(CONTAIN_STYLE_ID)?.remove();
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

function canvasHelper(): NubariumCanvasHelperStatic | null {
  if (typeof window === "undefined") return null;
  return (window as Window & { NubSdkCanvasHelper?: NubariumCanvasHelperStatic }).NubSdkCanvasHelper ?? null;
}

/**
 * SDK `getFrameDimension` reads `video.offsetWidth/Height` internally.
 * Sync the video box first so those reads match the Foly visor, without
 * rewriting the SDK frame formula.
 */
function patchFrameMeasurement(
  capture: NubariumIdCaptureOrientationGate,
  viewportEl: HTMLElement | null,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  let helper: NubariumIdCaptureOrientationGate["componentHelper"] | null = null;
  let original: GetFrameDimensionFn | null = null;

  const install = () => {
    const next = capture.componentHelper;
    if (!next || typeof next.getFrameDimension !== "function" || next === helper) return;
    helper = next;
    original = next.getFrameDimension.bind(next);
    next.getFrameDimension = (frameClass, orientation, extra) => {
      const rootId = resolveRootElementId(capture);
      if (rootId) syncNubariumVideoLayout(rootId, viewportEl);
      return original!(frameClass, orientation, extra);
    };
  };

  install();
  const poll = window.setInterval(install, 50);
  const stopPoll = window.setTimeout(() => window.clearInterval(poll), 4000);

  return () => {
    window.clearInterval(poll);
    window.clearTimeout(stopPoll);
    if (helper && original) {
      helper.getFrameDimension = original;
    }
  };
}

function redrawCaptureFrame(
  capture: NubariumIdCaptureOrientationGate,
  viewportEl?: HTMLElement | null,
): void {
  const rootId = resolveRootElementId(capture);
  if (!rootId || typeof document === "undefined") return;

  const viewport = viewportEl ?? viewportByRootId.get(rootId) ?? null;
  syncNubariumVideoLayout(rootId, viewport);

  const video = document.getElementById(`${rootId}-video`) as HTMLVideoElement | null;
  if (!video || video.offsetWidth <= 0 || video.offsetHeight <= 0) return;

  const taskType = capture.currentTask?.type;
  const areaType = capture.currentTaskConfiguration?.areaType;
  const name = capture.name ?? "IdCapture";

  try {
    if (taskType && typeof capture.componentHelper?.getFrameDimension === "function") {
      const frame = capture.componentHelper.getFrameDimension(`${name}_${taskType}`, null);
      const helper = canvasHelper();
      const mode = selectGuideRedrawMode({
        hasFrame: Boolean(frame),
        areaType,
        hasSetDrawFrame: typeof capture.nubSdkCanvasHelper?.setDrawFrame === "function",
        hasDraw: typeof helper?.draw === "function",
      });

      if (mode === "setDrawFrame") {
        capture.nubSdkCanvasHelper?.setDrawFrame?.(frame, areaType);
      } else if (mode === "draw") {
        helper?.draw?.(rootId, frame, areaType);
      }

      // setDrawFrame wins over draw()'s y/2 shift. Re-apply after updateFrameUi
      // so the guide image stays on the same rect as the yellow stroke.
      capture.updateFrameUi?.();
      if (mode === "setDrawFrame" && isFrameRect(frame)) {
        restoreGuideBox(rootId, frame);
      }
    }

    if (!taskType) {
      capture.updateFrameUi?.();
    }

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

type DrawFn = (rootElementId: string, rectangle: unknown, type: unknown) => void;

let drawPatched = false;
let originalDraw: DrawFn | null = null;
let drawPatchUsers = 0;

let drawInstallPoll: number | null = null;

function tryInstallCanvasDrawPatch(): boolean {
  if (drawPatched) return true;
  const helper = canvasHelper();
  if (!helper || typeof helper.draw !== "function") return false;

  originalDraw = helper.draw.bind(helper);
  helper.draw = (rootElementId, rectangle, type) => {
    // Face oval: draw() rewrites top to y/2 and paints an INE 54:86 hole.
    // Keep the SDK stroke, then put the guide back on the frame rect.
    syncNubariumVideoLayout(rootElementId, viewportByRootId.get(rootElementId) ?? null);
    originalDraw?.(rootElementId, rectangle, type);
    if (type === "oval" && isFrameRect(rectangle)) {
      restoreGuideBox(rootElementId, rectangle);
    }
  };
  drawPatched = true;
  return true;
}

function installCanvasDrawPatch(): void {
  if (typeof window === "undefined") return;

  drawPatchUsers += 1;
  if (tryInstallCanvasDrawPatch() || drawInstallPoll != null) return;

  drawInstallPoll = window.setInterval(() => {
    if (!tryInstallCanvasDrawPatch() || drawInstallPoll == null) return;
    window.clearInterval(drawInstallPoll);
    drawInstallPoll = null;
  }, 50);
  window.setTimeout(() => {
    if (drawInstallPoll == null) return;
    window.clearInterval(drawInstallPoll);
    drawInstallPoll = null;
  }, 4000);
}

function uninstallCanvasDrawPatch(): void {
  drawPatchUsers = Math.max(0, drawPatchUsers - 1);
  if (drawPatchUsers > 0) return;

  if (drawInstallPoll != null) {
    window.clearInterval(drawInstallPoll);
    drawInstallPoll = null;
  }
  if (!drawPatched) return;

  const helper = canvasHelper();
  if (helper && originalDraw) {
    helper.draw = originalDraw;
  }
  originalDraw = null;
  drawPatched = false;
}

function patchViewportResize(
  capture: NubariumIdCaptureOrientationGate,
  viewportEl: HTMLElement | null,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const previousOnResize = window.onresize;
  window.onresize = null;
  rememberViewport(capture.rootElementId, viewportEl);

  let debounceTimer: number | null = null;
  const scheduleRedraw = () => {
    if (debounceTimer != null) window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      debounceTimer = null;
      redrawCaptureFrame(capture, viewportEl);
    }, 120);
  };

  const observer = typeof ResizeObserver !== "undefined"
    ? new ResizeObserver(scheduleRedraw)
    : null;
  const observed = new Set<Element>();
  const observe = (el: Element | null | undefined) => {
    if (!observer || !el || observed.has(el)) return;
    observed.add(el);
    observer.observe(el);
  };

  observe(viewportEl);
  const attachSdkNodes = () => {
    const rootId = resolveRootElementId(capture);
    if (!rootId) return false;
    const video = document.getElementById(`${rootId}-video`);
    const container = document.getElementById(`${rootId}-container`);
    observe(video);
    observe(container);
    return Boolean(video && container);
  };
  const attachPoll = window.setInterval(() => {
    if (attachSdkNodes()) window.clearInterval(attachPoll);
  }, 50);
  const stopAttachPoll = window.setTimeout(() => window.clearInterval(attachPoll), 4000);

  window.addEventListener("orientationchange", scheduleRedraw);

  const staggerTimers = REDRAW_DELAYS_MS.map((delay) =>
    window.setTimeout(() => redrawCaptureFrame(capture, viewportEl), delay),
  );

  return () => {
    if (debounceTimer != null) window.clearTimeout(debounceTimer);
    window.clearInterval(attachPoll);
    window.clearTimeout(stopAttachPoll);
    for (const timer of staggerTimers) window.clearTimeout(timer);
    observer?.disconnect();
    window.removeEventListener("orientationchange", scheduleRedraw);
    window.onresize = previousOnResize;
    forgetViewport(capture.rootElementId);
  };
}

/**
 * Recalculate guides once the stream has metadata and again while the tablet
 * modal flex layout settles. Returns a cleanup for the metadata listener.
 */
export function scheduleNubariumCaptureRedraw(
  capture: object | null | undefined,
  viewportEl?: HTMLElement | null,
): () => void {
  if (typeof window === "undefined" || !capture) return () => undefined;

  const gate = capture as NubariumIdCaptureOrientationGate;
  rememberViewport(gate.rootElementId, viewportEl ?? null);

  const timers = REDRAW_DELAYS_MS.map((delay) =>
    window.setTimeout(() => redrawCaptureFrame(gate, viewportEl ?? null), delay),
  );

  let video: HTMLVideoElement | null = null;
  const onLoaded = () => redrawCaptureFrame(gate, viewportEl ?? null);
  const attachVideo = () => {
    const rootId = resolveRootElementId(gate);
    if (!rootId) return false;
    const next = document.getElementById(`${rootId}-video`) as HTMLVideoElement | null;
    if (!next) return false;
    if (next === video) return true;
    video?.removeEventListener("loadedmetadata", onLoaded);
    video = next;
    video.addEventListener("loadedmetadata", onLoaded);
    return true;
  };

  attachVideo();
  const poll = window.setInterval(() => {
    if (attachVideo()) window.clearInterval(poll);
  }, 50);
  const stopPoll = window.setTimeout(() => window.clearInterval(poll), 4000);

  return () => {
    for (const timer of timers) window.clearTimeout(timer);
    window.clearInterval(poll);
    window.clearTimeout(stopPoll);
    video?.removeEventListener("loadedmetadata", onLoaded);
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

  const viewportEl = options.viewportEl ?? null;
  rememberViewport(gate.rootElementId, viewportEl);

  restorers.push(patchLandscapeGate(gate));
  installContainmentStyles();
  restorers.push(() => uninstallContainmentStyles());
  installCaptureSnapshotPatch();
  restorers.push(() => uninstallCaptureSnapshotPatch());
  installCanvasDrawPatch();
  restorers.push(() => uninstallCanvasDrawPatch());

  if (kind === "id") {
    restorers.push(patchFixedLandscapeOrientation(gate));
  }

  if (kind === "face") {
    restorers.push(patchFaceCaptureErrors(gate));
  }

  restorers.push(patchFrameMeasurement(gate, viewportEl));
  restorers.push(patchViewportResize(gate, viewportEl));

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
