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
    ]) {
      const dataUrl = extractSdkImageDataUrl(nested);
      if (dataUrl) return dataUrl;
    }
  }

  return "";
}

export function extractIdCaptureImages(data: {
  front?: unknown;
  back?: unknown;
  resources?: Record<string, unknown> | { front?: unknown; back?: unknown; id?: { front?: unknown; back?: unknown } };
}): { frontDataUrl: string; backDataUrl: string } {
  const resources = data.resources;
  const idResources =
    resources && typeof resources === "object" && "id" in resources
      ? (resources as { id?: { front?: unknown; back?: unknown } }).id
      : undefined;

  const frontDataUrl = extractSdkImageDataUrl(
    data.front,
    resources && typeof resources === "object" ? resources.front : undefined,
    idResources?.front,
  );
  const backDataUrl = extractSdkImageDataUrl(
    data.back,
    resources && typeof resources === "object" ? resources.back : undefined,
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
  if (message?.trim()) return message.trim();
  if (error.code !== undefined && `${error.code}`.trim()) {
    return `Error del SDK (${error.code}).`;
  }
  return "Ocurrió un error al inicializar la captura biométrica.";
}

interface NubariumClearable {
  clear(): void;
}

/** Evita errores del SDK cuando React ya desmontó el contenedor root. */
export function safeClearNubariumCapture(
  capture: NubariumClearable | null | undefined,
  rootElementId?: string,
): void {
  if (!capture) return;

  if (rootElementId && !document.getElementById(rootElementId)) {
    return;
  }

  try {
    capture.clear();
  } catch {
    // El SDK puede fallar si el DOM fue removido antes del cleanup.
  }
}
