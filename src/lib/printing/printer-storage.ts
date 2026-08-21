import {
  DEFAULT_PRINTER_PROFILE,
  getPrinterProfile,
} from "./printer-profiles";
import type { PrinterProfile } from "./types";

const PROFILE_KEY = "foly.printing.activePrinterProfile";
const SETUP_KEY = "foly.printing.printerSetupAcknowledged";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getStoredPrinterProfileId(): string {
  if (!canUseStorage()) return DEFAULT_PRINTER_PROFILE.id;
  return window.localStorage.getItem(PROFILE_KEY) ?? DEFAULT_PRINTER_PROFILE.id;
}

export function getActivePrinterProfile(): PrinterProfile {
  return getPrinterProfile(getStoredPrinterProfileId()) ?? DEFAULT_PRINTER_PROFILE;
}

export function setActivePrinterProfileId(profileId: string): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(PROFILE_KEY, profileId);
}

export function isPrinterSetupAcknowledged(profileId?: string): boolean {
  if (!canUseStorage()) return false;
  const id = profileId ?? getStoredPrinterProfileId();
  return window.localStorage.getItem(`${SETUP_KEY}.${id}`) === "true";
}

export function acknowledgePrinterSetup(profileId?: string): void {
  if (!canUseStorage()) return;
  const id = profileId ?? getStoredPrinterProfileId();
  window.localStorage.setItem(`${SETUP_KEY}.${id}`, "true");
  window.localStorage.setItem(PROFILE_KEY, id);
}

export function isPrinterConfigured(profileId?: string): boolean {
  const profile = getPrinterProfile(profileId ?? getStoredPrinterProfileId());
  if (!profile) return false;
  return isPrinterSetupAcknowledged(profile.id);
}
