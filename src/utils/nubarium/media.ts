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

/**
 * Preferencia de cámara según el dispositivo.
 * En móvil: trasera primero. En desktop: `default` primero.
 */
export function getNubariumCameraOptions(): NubariumCameraOption[] {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return ["default", "front", "back"];
  }

  const ua = navigator.userAgent;
  const isMobileUa = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const isTouchTablet =
    navigator.maxTouchPoints > 1
    && typeof window.matchMedia === "function"
    && window.matchMedia("(max-width: 1024px)").matches;

  if (isMobileUa || isTouchTablet) {
    return ["back", "front", "default"];
  }

  return ["default", "front", "back"];
}
