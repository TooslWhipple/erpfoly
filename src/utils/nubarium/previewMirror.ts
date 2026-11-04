import type { CameraFacingHint } from "@/utils/cameraDevices";

const MIRROR_CLEAR_DELAYS_MS = [0, 80, 200, 500, 1000] as const;

function resolveFacingFromVideo(video: HTMLVideoElement): CameraFacingHint | null {
  const stream = video.srcObject;
  if (!(stream instanceof MediaStream)) return null;

  for (const track of stream.getVideoTracks()) {
    const facingMode = track.getSettings?.().facingMode;
    if (facingMode === "environment") return "environment";
    if (facingMode === "user") return "user";
  }
  return null;
}

function shouldClearMirror(
  hint: CameraFacingHint | undefined,
  video: HTMLVideoElement,
): boolean {
  const fromTrack = resolveFacingFromVideo(video);
  if (fromTrack === "environment") return true;
  if (fromTrack === "user") return false;
  return hint === "environment";
}

/**
 * Nubarium mirrors the preview for front/selfie. When Foly pins a rear
 * deviceId, the SDK can keep that mirror and the trasera looks flipped.
 */
export function syncNubariumPreviewMirror(
  rootElementId: string,
  facingHint?: CameraFacingHint,
): () => void {
  if (typeof document === "undefined") return () => undefined;

  const apply = () => {
    const root = document.getElementById(rootElementId);
    if (!root) return;

    root.querySelectorAll("video").forEach((node) => {
      const video = node as HTMLVideoElement;
      if (!shouldClearMirror(facingHint, video)) return;
      video.style.setProperty("transform", "none", "important");
    });

    // Preview/guide layers sometimes inherit the same selfie flip.
    if (facingHint === "environment") {
      root
        .querySelectorAll<HTMLElement>("img.NUBSDK_FC_CANVAS_IMAGE, canvas.NUBSDK_FC_CANVAS")
        .forEach((el) => {
          const current = el.style.transform;
          if (!current || !/scaleX\s*\(\s*-1\s*\)/i.test(current)) return;
          el.style.setProperty(
            "transform",
            current.replace(/scaleX\s*\(\s*-1\s*\)/gi, "scaleX(1)"),
            "important",
          );
        });
    }
  };

  const timers = MIRROR_CLEAR_DELAYS_MS.map((delay) => window.setTimeout(apply, delay));
  return () => {
    for (const timer of timers) window.clearTimeout(timer);
  };
}
