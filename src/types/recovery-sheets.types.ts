import type { ServiceOrderStatus } from "@/types/atencion-cliente.types";

export type RecoverySheetStatus =
  | "pendiente"
  | "programada"
  | "recuperada"
  | "cancelada";

export type RecoverySheetOrigin = "atencion_cliente" | "cajas";

export type RecoverySheetListTab =
  | "all"
  | "pendiente"
  | "programada"
  | "recuperada";

export type RecoverySheetOriginFilter = "all" | RecoverySheetOrigin;

export type RecoverySheetRouteStatus = "pendiente" | "finalizada";

export type RecoverySheetItemCondition =
  | "sin_danos"
  | "danado"
  | "no_funciona";

export interface RecoverySheetListItem {
  id: string;
  folio: string;
  origin: RecoverySheetOrigin;
  articleCode: string;
  articleDescription: string;
  createdAt: string;
  status: RecoverySheetStatus;
}

export interface RecoverySheetScheduledRoute {
  id: string;
  routeId: string;
  status: RecoverySheetRouteStatus;
  branchName: string;
  recoveryDate: string;
}

export interface RecoverySheetServiceOrderLink {
  id: string;
  serviceOrderId: string;
  status: ServiceOrderStatus;
  title: string;
  generatedAt: string;
  comment: string;
}

export interface RecoverySheetWarehouseEntry {
  branchId: number;
  branchName: string;
  itemCondition: RecoverySheetItemCondition;
  entryDate: string;
}

export interface RecoverySheetDetail {
  id: string;
  folio: string;
  articleCode: string;
  articleDescription: string;
  origin: RecoverySheetOrigin;
  invoiceId: string;
  invoiceNumber: string;
  createdAt: string;
  status: RecoverySheetStatus;
  scheduledRoute?: RecoverySheetScheduledRoute;
  serviceOrder?: RecoverySheetServiceOrderLink;
  warehouse?: RecoverySheetWarehouseEntry;
}

export interface ReceiveRecoveryItemPayload {
  branchId: number;
  branchName: string;
  receivedDate: string;
  itemCondition: RecoverySheetItemCondition;
}

export const RECOVERY_SHEET_ORIGIN_LABELS: Record<RecoverySheetOrigin, string> =
  {
    atencion_cliente: "Atención al cliente",
    cajas: "Cajas",
  };

export const RECOVERY_SHEET_STATUS_LABELS: Record<RecoverySheetStatus, string> =
  {
    pendiente: "Pendiente",
    programada: "Programada",
    recuperada: "Recuperado",
    cancelada: "Cancelada",
  };

export const RECOVERY_SHEET_ITEM_CONDITION_LABELS: Record<
  RecoverySheetItemCondition,
  string
> = {
  sin_danos: "Sin daños",
  danado: "Dañado",
  no_funciona: "No funciona",
};

export const RECOVERY_SHEET_ROUTE_STATUS_LABELS: Record<
  RecoverySheetRouteStatus,
  string
> = {
  pendiente: "Pendiente",
  finalizada: "Finalizada",
};
