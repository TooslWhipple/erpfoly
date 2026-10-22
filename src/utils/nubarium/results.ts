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
