import type { StatusChipVariant } from "@/components";
import type {
  AuditorIncidentResolution,
  TransferDetail,
  TransferDetailItem,
  TransferDiscrepancyType,
  TransferIncidentResolution,
  TransferIncidentStatus,
  TransferIncidentView,
} from "@/types/transfers.types";

/** Errores 409 que indican que otro usuario (o un doble clic) ya cambió el traspaso o la incidencia. */
const STALE_TRANSFER_ERROR_CODES: readonly string[] = [
  "TRANSFER_STATE_CHANGED",
  "INCIDENT_STATE_CHANGED",
  "INVALID_TRANSFER_TRANSITION",
];

export function isStaleTransferErrorCode(code: string | undefined): boolean {
  return code !== undefined && STALE_TRANSFER_ERROR_CODES.includes(code);
}

/** Piezas que el origen declaró enviadas; sin envío parcial, lo pedido. */
export function getExpectedQuantity(item: TransferDetailItem): number {
  return item.shipped_quantity ?? item.requested_quantity;
}

export interface TransferViewer {
  /** Tiene `traspasos.update`. */
  canUpdate: boolean;
  /** Tiene permiso de crear mercancía dañada. */
  canRegisterDamage: boolean;
}

export interface TransferButtons {
  ship: boolean;
  receive: boolean;
  reportIncident: boolean;
  cancel: boolean;
  returnToOrigin: boolean;
  schedule: boolean;
  authorize: boolean;
  /** Ligado en pending/scheduled: no se cancela aquí, solo la venta. */
  linkedCancelNote: boolean;
  /** La hoja de salida y de entrada existen desde que el traspaso salió. */
  print: boolean;
}

/** Botones del traspaso: lo que dice `allowed_actions` más el permiso del usuario. */
export function getTransferButtons(
  detail: Pick<TransferDetail, "allowed_actions" | "status" | "sale">,
  viewer: TransferViewer,
): TransferButtons {
  const allowed = (action: TransferDetail["allowed_actions"][number]) =>
    viewer.canUpdate && detail.allowed_actions.includes(action);
  const beforeShipping = detail.status === "pending" || detail.status === "scheduled";
  return {
    ship: allowed("ship"),
    receive: allowed("receive"),
    reportIncident: allowed("report_incident"),
    cancel: allowed("cancel"),
    returnToOrigin: allowed("return_to_origin"),
    schedule: allowed("schedule"),
    authorize: allowed("authorize"),
    linkedCancelNote: detail.sale !== null && beforeShipping,
    print: detail.status === "shipped" || detail.status === "delivered",
  };
}

export interface IncidentButtons {
  correct: boolean;
  escalate: boolean;
  withdraw: boolean;
  registerDamage: boolean;
}

/** Botones de una incidencia: lo que dice su `allowed_actions`; "Registrar daño" es del destino con permiso. */
export function getIncidentButtons(
  incident: Pick<TransferIncidentView, "status" | "allowed_actions">,
  detail: Pick<TransferDetail, "side">,
  viewer: TransferViewer,
): IncidentButtons {
  return {
    correct: incident.allowed_actions.includes("correct_shipment"),
    escalate: incident.allowed_actions.includes("escalate"),
    withdraw: incident.allowed_actions.includes("withdraw"),
    registerDamage:
      viewer.canRegisterDamage && detail.side.destination && incident.status !== "CANCELLED",
  };
}

export const INCIDENT_STATUS_LABELS: Record<TransferIncidentStatus, string> = {
  OPEN: "Abierta",
  IN_REVIEW: "En revisión",
  RESOLVED: "Resuelta",
  CANCELLED: "Retirada",
};

export const INCIDENT_STATUS_VARIANTS: Record<TransferIncidentStatus, StatusChipVariant> = {
  OPEN: "warning",
  IN_REVIEW: "info",
  RESOLVED: "success",
  CANCELLED: "disabled",
};

export const DISCREPANCY_TYPE_LABELS: Record<TransferDiscrepancyType, string> = {
  MISSING: "Faltante",
  EXTRA: "Sobrante",
};

export const INCIDENT_RESOLUTION_LABELS: Record<TransferIncidentResolution, string> = {
  CORRECTED_BY_ORIGIN: "Corregida por el origen",
  LOSS_IN_TRANSIT: "Pérdida en tránsito",
  FOUND_AT_DESTINATION: "Encontrada en el destino",
};

const TIMELINE_LABELS: Record<string, string> = {
  scheduled: "Agendado",
  authorized: "Autorizado",
  replenishment_generated: "Propuesta generada",
  shipped: "Enviado",
  received: "Recibido",
  cancelled: "Cancelado",
  shipment_corrected: "Envío corregido",
  reconciled: "Conciliado",
  incident_opened: "Diferencia reportada",
  incident_escalated: "Incidencia escalada a Auditoría",
  incident_resolved: "Incidencia resuelta",
  incident_withdrawn: "Incidencia retirada",
};

export function getTimelineActionLabel(action: string): string {
  const key = action.replace(/^transfer\./, "");
  return TIMELINE_LABELS[key] ?? key;
}

/** La pérdida en tránsito se da de baja con cuenta contable obligatoria (RN-069). */
export function requiresAccountingAccount(resolution: AuditorIncidentResolution): boolean {
  return resolution === "LOSS_IN_TRANSIT";
}
