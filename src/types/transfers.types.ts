import type {
  OrderFullDetail,
  OrderListItem,
  QueryOrdersParams,
} from "@/types/orders.types";

/** Renglón de T4/T5. El backend rechaza (400) cualquier campo que no sea de un traspaso, como `currency`. */
export interface TransferItemInput {
  product_id: number;
  requested_quantity: number;
  unit_price: number;
  scheduled_delivery_date?: string;
  notes?: string;
}

/** Cuerpo de T4: exactamente los campos de `CreateTransferDto`. */
export interface CreateTransferPayload {
  branch_id: number;
  origin_branch_id: number;
  order_date: string;
  notes?: string;
  items: TransferItemInput[];
}

/** Cuerpo de T5: exactamente los campos de `UpdateTransferDto`. */
export interface UpdateTransferPayload {
  branch_id?: number;
  origin_branch_id?: number;
  order_date?: string;
  notes?: string;
  items: Array<TransferItemInput & { id?: number }>;
}

/** Acciones que el backend calcula por traspaso y usuario (`allowed_actions`). */
export type TransferAction =
  | "schedule"
  | "authorize"
  | "ship"
  | "receive"
  | "cancel"
  | "return_to_origin"
  | "report_incident"
  | "correct_shipment";

/** Acciones que el backend calcula por incidencia y usuario (`allowed_actions`). */
export type TransferIncidentAction = "correct_shipment" | "escalate" | "withdraw" | "resolve";

export type TransferIncidentStatus =
  | "OPEN"
  | "IN_REVIEW"
  | "RESOLVED"
  | "CANCELLED";

export type TransferDiscrepancyType = "MISSING" | "EXTRA";

export type TransferIncidentResolution =
  | "CORRECTED_BY_ORIGIN"
  | "LOSS_IN_TRANSIT"
  | "FOUND_AT_DESTINATION";

/** Resoluciones que el Auditor puede aplicar (T15). */
export type AuditorIncidentResolution = Exclude<
  TransferIncidentResolution,
  "CORRECTED_BY_ORIGIN"
>;

export interface TransferStats {
  total: number;
  draft: number;
  pending: number;
  scheduled: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  legacy: number;
  toShip: number;
  toReceive: number;
  openIncidents: number;
}

export interface QueryTransfersParams
  extends Omit<QueryOrdersParams, "order_type" | "client_id" | "date_from" | "date_to"> {
  direction?: "outgoing" | "incoming";
  pending_action?: "ship" | "receive";
  linked?: boolean;
  has_open_incident?: boolean;
}

export interface TransferListItem extends OrderListItem {
  sale_folio: string | null;
  allowed_actions: TransferAction[];
  open_incidents: number;
}

export interface TransferIncidentItemView {
  order_item_id: number;
  type: TransferDiscrepancyType;
  quantity: number;
}

export interface TransferIncidentProduct {
  id: number;
  code: string;
  short_name: string;
}

export interface TransferIncidentLineView extends TransferIncidentItemView {
  product: TransferIncidentProduct;
  product_name: string;
}

export interface TransferIncidentEvidenceView {
  file_id: number;
  file_name: string;
  mime_type: string;
  /** URL firmada y temporal. */
  file_url: string;
}

/** Traspaso al que pertenece la incidencia. */
export interface TransferIncidentOrder {
  id: number;
  folio: string;
  branch_id: number;
  origin_branch_id: number | null;
  branch: { id: number; name: string } | null;
  origin_branch: { id: number; name: string } | null;
}

/** Incidencia de traspaso: la misma forma en el detalle (T3) y en la bandeja (T14). */
export interface TransferIncidentView {
  id: number;
  status: TransferIncidentStatus;
  description: string;
  resolution: TransferIncidentResolution | null;
  resolution_notes: string | null;
  accounting_account_id: string | null;
  created_by: number;
  created_at: string;
  resolved_by: number | null;
  resolved_at: string | null;
  order: TransferIncidentOrder;
  items: TransferIncidentLineView[];
  evidences: TransferIncidentEvidenceView[];
  allowed_actions: TransferIncidentAction[];
}

/** Página de la bandeja del Auditor (T14). */
export interface TransferIncidentsPage {
  rows: TransferIncidentView[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryTransferIncidentsParams {
  status?: TransferIncidentStatus;
  branch_id?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TransferTimelineEntry {
  action: string;
  user: string | null;
  at: string;
  notes: string | null;
}

export type TransferDetailItem = OrderFullDetail["order_items"][number] & {
  shipped_quantity: number | null;
};

export interface TransferDetail extends Omit<OrderFullDetail, "order_items"> {
  order_items: TransferDetailItem[];
  sale: { id: number; folio: string } | null;
  allowed_actions: TransferAction[];
  side: { origin: boolean; destination: boolean };
  incidents: TransferIncidentView[];
  timeline: TransferTimelineEntry[];
}

export interface ShipTransferPayload {
  items?: Array<{ order_item_id: number; quantity: number }>;
  notes?: string;
}

export interface TransferNotesPayload {
  notes?: string;
}

export interface CancelTransferPayload {
  reason: string;
  notes?: string;
}

export interface ReportIncidentPayload {
  items: TransferIncidentItemView[];
  description: string;
  evidence: File[];
}

export interface CorrectShipmentPayload {
  items: Array<{ order_item_id: number; shipped_quantity: number }>;
  notes: string;
}

export interface EscalateIncidentPayload {
  notes: string;
}

export interface ResolveIncidentPayload {
  resolution: AuditorIncidentResolution;
  accounting_account_id?: string;
  notes: string;
}

export type TransferDocumentKind = "salida" | "entrada";
