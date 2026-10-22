import { getCameraAccessErrorMessage } from "./media";

function isCameraAccessErrorMessage(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  return (
    normalized.includes("getusermedia")
    || normalized.includes("mediadevices")
    || normalized.includes("undefined (reading 'getusermedia')")
  );
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

export function translateNubariumError(error: {
  code?: string | number;
  msg?: string;
  message?: string;
}): string {
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
