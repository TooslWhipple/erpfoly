export type SaleCancellationType = "VOID" | "CANCELLATION";

export type SaleCancellationScope = "PARTIAL" | "TOTAL";

export type SaleCancellationBlockReason =
  | "ALREADY_CANCELLED"
  | "STATUS_NOT_CANCELLABLE"
  | "IN_ROUTE"
  | "DELIVERED"
  | "CREDIT_NOT_ACTIVE"
  | "NOTHING_CANCELLABLE";

export type SaleCancellationLineBlockReason =
  | "SERVICE_ORDER_ACTIVE"
  | "ADJUSTED_BY_SERVICE_ORDER"
  | "NOTHING_PENDING";

export interface SaleCancellationLineSelection {
  saleItemId: number;
  quantity: number;
}

export interface SaleCancellationSummary {
  scope: SaleCancellationScope;
  units: number;
  merchandiseAmount: number;
  shippingAmount: number;
  totalAmount: number;
  creditedAmount: number;
  outstandingReduction: number;
  newTotal: number;
}

export interface SaleCancellationPreviewLine {
  saleItemId: number;
  productCode: string;
  productName: string;
  quantity: number;
  cancelledQuantity: number;
  deliveredQuantity: number;
  availableQuantity: number;
  unitAmount: number;
  blockReason: SaleCancellationLineBlockReason | null;
  blockMessage: string | null;
}

export interface SaleCancellationReasonOption {
  id: number;
  code: string;
  name: string;
  allowsCustomText: boolean;
}

export interface SaleCancellationHistoryEntry {
  id: number;
  type: SaleCancellationType;
  scope: SaleCancellationScope;
  createdAt: string;
  totalAmount: number;
  creditedAmount: number;
  units: number;
  reason: string | null;
}

export interface SaleCancellationPreview {
  saleId: number;
  folio: string;
  status: string;
  type: SaleCancellationType;
  requiresAuthorization: boolean;
  blockReason: SaleCancellationBlockReason | null;
  blockMessage: string | null;
  hasClient: boolean;
  currentTotal: number;
  netPaid: number;
  outstanding: number | null;
  shippingAmount: number;
  hasDeliveries: boolean;
  warnings: string[];
  lines: SaleCancellationPreviewLine[];
  reasons: SaleCancellationReasonOption[];
  simulation: SaleCancellationSummary | null;
  history: SaleCancellationHistoryEntry[];
}

export interface CreateSaleCancellationPayload {
  idempotencyKey: string;
  reasonId: number;
  notes?: string;
  lines: SaleCancellationLineSelection[];
  authorization?: { username: string; password: string };
}

export interface SaleCancellationResult extends SaleCancellationSummary {
  cancellationId: number;
  saleId: number;
  type: SaleCancellationType;
  pointsReversed: number;
  saleCancelled: boolean;
  warnings: string[];
  message: string;
}
