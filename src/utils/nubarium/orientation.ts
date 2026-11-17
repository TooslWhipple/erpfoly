/**
 * IdCapture picks the INE guide asset from getOrientation().
 * On tablets the SDK often returns PORTRAIT from the window while our
 * CaptureViewport is a landscape 4:3 box — the yellow frame then sits
 * 90° off. Align orientation to the host element's actual box instead.
 */
interface IdCaptureOrientationGate {
  getOrientation?: () => string | null;
  rootElementId?: string | null;
}

export function syncIdCaptureOrientationToHost(
  capture: object | null | undefined,
  rootElementId: string,
): () => void {
  if (!capture || typeof window === "undefined") return () => undefined;

  const gate = capture as IdCaptureOrientationGate;
  if (typeof gate.getOrientation !== "function") return () => undefined;

  const originalGetOrientation = gate.getOrientation.bind(gate);

  gate.getOrientation = () => {
    const host =
      document.getElementById(rootElementId)
      ?? (gate.rootElementId
        ? document.getElementById(gate.rootElementId)
        : null);

    if (host && host.clientWidth > 0 && host.clientHeight > 0) {
      return host.clientWidth >= host.clientHeight ? "LANDSCAPE" : "PORTRAIT";
    }

    return originalGetOrientation();
  };

  return () => {
    gate.getOrientation = originalGetOrientation;
  };
}
