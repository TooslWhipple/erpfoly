/**
 * Minimal valid PNG (1×1 px) as data URI. Used until hardware fingerprint capture is integrated.
 */
export const SIMULATED_FINGERPRINT_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function mimeTypeFromDataUrl(dataUrl: string): string | null {
  const match = dataUrl.match(/^data:([^;]+);base64,/i);
  return match?.[1]?.trim() ?? null;
}

function extensionFromMimeType(mimeType: string | null): string {
  const normalized = (mimeType ?? "").toLowerCase();
  if (normalized === "image/jpeg" || normalized === "image/jpg") return "jpg";
  if (normalized === "image/png") return "png";
  if (normalized === "image/webp") return "webp";
  if (normalized === "application/pdf") return "pdf";
  return "bin";
}

export function dataUrlToFile(dataUrl: string, baseName: string): File {
  const mimeType = mimeTypeFromDataUrl(dataUrl);
  const fileExtension = extensionFromMimeType(mimeType);
  const fileName = `${baseName}.${fileExtension}`;

  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex === -1) {
    throw new Error("Data URL inválido para construir archivo.");
  }
  const base64 = dataUrl.slice(commaIndex + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new File([bytes], fileName, {
    type: mimeType ?? "application/octet-stream",
  });
}
