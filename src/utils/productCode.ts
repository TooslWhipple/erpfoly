/**
 * Normalizes a camera-decoded QR/barcode payload into a product search term.
 * Labels usually encode the SKU as plain text (`01-ME-371`); some QRs wrap it in a URL.
 */
export function normalizeScannedProductCode(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return trimmed;
    }
    const segments = url.pathname.split("/").filter(Boolean);
    const lastSegment = segments.at(-1);
    if (!lastSegment) return trimmed;
    return decodeURIComponent(lastSegment);
  } catch {
    return trimmed;
  }
}
