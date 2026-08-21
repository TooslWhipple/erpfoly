import type { PrinterProfile } from "./types";

export const RT425TT_PROFILE: PrinterProfile = {
  id: "rt425tt",
  displayName: "Ribetec RT-425TT",
  driverName: "4BARCODE 4B2054TG",
  driverPatterns: ["RT-425TT", "4BARCODE", "4B2054TG", "Ribetec"],
  widthMm: 100,
  heightMm: 62,
  dpi: 203,
  setupGuideUrl: "https://ayuda.ribetec.com/?p=291",
};

export const PRINTER_PROFILES: Record<string, PrinterProfile> = {
  [RT425TT_PROFILE.id]: RT425TT_PROFILE,
};

export const DEFAULT_PRINTER_PROFILE = RT425TT_PROFILE;

export function getPrinterProfile(id: string): PrinterProfile | undefined {
  return PRINTER_PROFILES[id];
}
