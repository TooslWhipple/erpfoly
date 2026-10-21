import { ROLE_CODES } from "../../constants/role-codes";
import type { StatusChipVariant } from "../StatusChip/styles";
import type { HoldStatus } from "@/types/saleHandover.types";

export const HOLD_STATUS_LABELS: Record<HoldStatus, string> = {
  ACTIVE: "Vigente",
  EXPIRED: "Vencido",
  AUDIT_REVIEW: "En auditoría",
  RELEASED: "Regularizado",
  FULFILLED: "Cumplido",
};

export const HOLD_STATUS_VARIANTS: Record<HoldStatus, StatusChipVariant> = {
  ACTIVE: "success",
  EXPIRED: "warning",
  AUDIT_REVIEW: "error",
  RELEASED: "default",
  FULFILLED: "info",
};

const HISTORY_ACTION_LABELS: Record<string, string> = {
  "sale_pickup_hold.started": "Resguardo iniciado",
  "sale_pickup_hold.restarted": "Resguardo reiniciado por una nueva llegada",
  "sale_pickup_hold.expired": "Resguardo vencido",
  "sale_pickup_hold.audit_review": "Pasó a auditoría",
  "sale_pickup_hold.extended": "Resguardo prorrogado",
  "sale_pickup_hold.expired_override":
    "Entrega autorizada con el resguardo vencido",
  "sale_pickup_hold.released": "Resguardo regularizado",
  "sale_pickup_hold.fulfilled": "Entrega completada",
};

export function holdHistoryActionLabel(action: string): string {
  return HISTORY_ACTION_LABELS[action] ?? action;
}

const MONEY_FORMAT = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

/** Monto decimal del contrato ("123.45") a moneda. */
export function formatHoldAmount(amount: string): string {
  const value = Number(amount);
  return Number.isFinite(value) ? MONEY_FORMAT.format(value) : amount;
}

const HOLD_DATE_FORMAT = new Intl.DateTimeFormat("es-MX", {
  timeZone: "America/Mexico_City",
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Fecha de un resguardo (`readyAt`, `expiresAt`, `auditAt`) en la zona de
 * México. Son instantes, no fechas de calendario: leerlos en UTC corre el
 * día cuando el instante cae de noche en México.
 */
export function formatHoldDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return HOLD_DATE_FORMAT.format(date).replace(/\./g, "");
}

export function formatUnits(count: number): string {
  return count === 1 ? "1 pieza" : `${count} piezas`;
}

/** Roles que auditan: ven la pestaña de auditoría y pueden regularizar. */
export function isAuditRole(role: string | undefined): boolean {
  return role === ROLE_CODES.AUDITOR || role === ROLE_CODES.ADMINISTRADOR;
}

/** Prorrogar: el Gerente solo lo vencido; Auditor y Admin también auditoría. */
export function canExtendHold(
  status: HoldStatus,
  role: string | undefined,
  hasUpdatePermission: boolean,
): boolean {
  if (!hasUpdatePermission) return false;
  if (status === "EXPIRED") return true;
  return status === "AUDIT_REVIEW" && isAuditRole(role);
}

/** Regularizar: solo Auditor y Admin, sobre vencido o auditoría. */
export function canReleaseHold(
  status: HoldStatus,
  role: string | undefined,
  hasUpdatePermission: boolean,
): boolean {
  return (
    hasUpdatePermission &&
    isAuditRole(role) &&
    (status === "EXPIRED" || status === "AUDIT_REVIEW")
  );
}
