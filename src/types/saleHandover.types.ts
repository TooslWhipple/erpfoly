/**
 * Tipos del módulo de entregas en sucursal (`/sale-handovers`).
 * Literales al contrato C3/C4 del plan paraguas `entregas-tablet`.
 * Fechas ISO 8601; montos como string decimal ("123.45").
 */

export type HandoverProgress =
  | "PENDING"
  | "PARTIALLY_DELIVERED"
  | "DELIVERED"
  | "CLOSED";

export type HoldStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "AUDIT_REVIEW"
  | "RELEASED"
  | "FULFILLED";

export type BlockReason =
  | "NOT_PAID"
  | "LAYAWAY_NOT_SETTLED"
  | "CANCELLED"
  | "NOT_BRANCH_PICKUP"
  | "OTHER_BRANCH"
  | "NOTHING_READY"
  | "NOTHING_PENDING"
  | "HOLD_AUDIT_REVIEW";

export type HandoverInputMethod = "QR" | "BARCODE" | "MANUAL";

export type HoldSummary = {
  status: HoldStatus;
  readyAt: string;
  expiresAt: string;
  auditAt: string;
} | null;

export type PickupReceiver =
  | { type: "HOLDER"; thirdPartyName: null; thirdPartyPhoneMasked: null }
  | {
      type: "THIRD_PARTY";
      thirdPartyName: string;
      thirdPartyPhoneMasked: string;
    };

export type PickupReceiverPayload =
  | { type: "HOLDER" }
  | { type: "THIRD_PARTY"; name: string; phone: string };

export type HandoverValidationMethod =
  | "HOLDER"
  | "THIRD_PARTY_OTP"
  | "SUPERVISOR";

/** Cuerpo de `PUT /sale-handovers/sales/:saleId/receiver` (C3). */
export type UpdateHandoverReceiverRequest = PickupReceiverPayload & {
  branchId: number;
};

export type HandoverNotificationStatus = "SENT" | "FAILED" | "SKIPPED";

export type HandoverBranch = {
  id: number;
  name: string;
  isMainWarehouse: boolean;
};

/** Sucursal que entrega físicamente la orden (donde está el inventario). */
export type DeliveryBranch = { id: number; name: string };

export type QueueReadiness = "READY" | "ANY";

/** Estatus de traspaso activo que expone el back (subconjunto de `OrderStatus`). */
export type IncomingTransferStatus =
  | "pending"
  | "scheduled"
  | "in_progress"
  | "shipped"
  | "partially_delivered";

/** Traspaso interno activo hacia la sucursal de entrega de la venta. */
export type IncomingTransfer = {
  orderId: number;
  folio: string;
  originBranch: { id: number; name: string };
  status: IncomingTransferStatus;
};

export type QueueRow = {
  saleId: number;
  folio: string;
  /** Sucursal responsable (la que vendió). */
  saleBranchName: string;
  deliveryBranch: DeliveryBranch;
  /** Solo alcance de escritura; el permiso lo combina `canProcess`. */
  canEdit: boolean;
  clientName: string;
  handoverStatus: HandoverProgress;
  readyUnits: number;
  pendingUnits: number;
  hold: HoldSummary;
  blockReason: BlockReason | null;
  incomingTransfers: IncomingTransfer[];
};

export type HandoverLine = {
  saleItemId: number;
  productId: number;
  code: string;
  name: string;
  quantity: number;
  delivered: number;
  released: number;
  ready: number;
  pendingSupply: number;
};

/** Autorización de la venta aún vigente; permite rehidratar el respaldo al recargar. */
export type ActiveHandoverAuthorization = {
  authorizationId: string;
  purpose: "IDENTITY" | "EXPIRED_HOLD";
  method: "THIRD_PARTY_OTP" | "SUPERVISOR";
  expiresAt: string;
  supervisor: { name: string } | null;
};

export type HandoverSaleDetail = {
  saleId: number;
  folio: string;
  /** Sucursal **responsable** (la que vendió), no la que entrega. */
  branch: { id: number; name: string };
  deliveryBranch: DeliveryBranch;
  /** Solo alcance de escritura; el permiso lo combina `canProcess`. */
  canEdit: boolean;
  client: { id: number; name: string; phoneMasked: string | null };
  receiver: PickupReceiver;
  handoverStatus: HandoverProgress;
  hold: HoldSummary;
  blockReason: BlockReason | null;
  incomingTransfers: IncomingTransfer[];
  requiresIdentityAuthorization: boolean;
  requiresExpiredHoldAuthorization: boolean;
  activeAuthorizations: ActiveHandoverAuthorization[];
  lines: HandoverLine[];
};

export type GetHandoverQueueParams = {
  /** Omitido = todas las sucursales del alcance de lectura. */
  branchId?: number;
  /** Por defecto `READY`; `ANY` incluye órdenes por surtir o en camino. */
  readiness?: QueueReadiness;
  search?: string;
  page: number;
  limit: number;
};

export type HandoverFileKind = "SIGNATURE" | "INE_FRONT" | "INE_BACK";

export type UploadHandoverFileResponse = { fileId: number };

export type HandoverOtpSendRequest = { branchId: number };

export type HandoverOtpSendResponse = {
  expiresAt: string;
  cooldownUntil: string;
  phoneMasked: string;
};

export type HandoverOtpVerifyRequest = { branchId: number; code: string };

export type HandoverAuthorizationPurpose = "IDENTITY" | "EXPIRED_HOLD";

export type HandoverOtpVerifyResponse = {
  authorizationId: string;
  purpose: "IDENTITY";
  method: "THIRD_PARTY_OTP";
  expiresAt: string;
};

export type HandoverSupervisorAuthorizationRequest = {
  branchId: number;
  purpose: HandoverAuthorizationPurpose;
  username: string;
  password: string;
  /** 5-512 caracteres; obligatorio si `purpose` es `EXPIRED_HOLD`. */
  reason?: string;
};

export type HandoverSupervisorAuthorizationResponse = {
  authorizationId: string;
  purpose: HandoverAuthorizationPurpose;
  method: "SUPERVISOR";
  supervisor: { id: number; name: string };
  expiresAt: string;
};

export type ConfirmHandoverLine = {
  saleItemId: number;
  quantity: number;
  inputMethod: HandoverInputMethod;
};

export type ConfirmHandoverRequest = {
  saleId: number;
  branchId: number;
  /** uuid v4: se crea en el primer intento y se renueva tras cada éxito. */
  idempotencyKey: string;
  identityAuthorizationId?: string;
  expiredHoldAuthorizationId?: string;
  signatureFileId: number;
  ineFrontFileId?: number;
  ineBackFileId?: number;
  lines: ConfirmHandoverLine[];
};

export type HandoverResultItem = {
  saleItemId: number;
  name: string;
  quantity: number;
};

export type HandoverResult = {
  id: number;
  /** Instante de la entrega (ISO 8601 UTC, igual a `created_at`). */
  deliveredAt: string;
  saleId: number;
  folio: string;
  handoverStatus: HandoverProgress;
  validationMethod: HandoverValidationMethod;
  deliveredToday: HandoverResultItem[];
  pending: HandoverResultItem[];
  receiptReady: boolean;
  whatsappStatus: HandoverNotificationStatus;
  emailStatus: HandoverNotificationStatus;
};

export type HandoverHistoryEntry = {
  id: number;
  createdAt: string;
  branch: { id: number; name: string };
  deliveredUnits: number;
  validationMethod: HandoverValidationMethod;
  deliveredBy: { id: number; name: string };
  whatsappStatus: HandoverNotificationStatus;
  emailStatus: HandoverNotificationStatus;
};

export type HandoverReceiptFormat = "letter" | "thermal80";

export type HandoverResendChannel = "WHATSAPP" | "EMAIL";

export type HandoverResendResponse = {
  whatsappStatus: HandoverNotificationStatus;
  emailStatus: HandoverNotificationStatus;
};

/** Códigos de error (`errorCode`) del módulo de entregas. */
export type HandoverErrorCode =
  | "BRANCH_FORBIDDEN"
  | "SALE_NOT_FOUND"
  | "INVALID_FILE"
  | "RECEIVER_NOT_THIRD_PARTY"
  | "INVALID_PHONE"
  | "NOT_BRANCH_PICKUP"
  | "NOTHING_PENDING"
  | "OTP_COOLDOWN"
  | "OTP_LOCKED"
  | "OTP_SEND_FAILED"
  | "OTP_INVALID"
  | "OTP_EXPIRED"
  | "OTP_MAX_ATTEMPTS"
  | "OTP_NOT_FOUND"
  | "SUPERVISOR_REJECTED"
  | "HOLD_NOT_EXPIRED"
  | "DUPLICATE_LINE"
  | "SIGNATURE_REQUIRED"
  | "AUTHORIZATION_REQUIRED"
  | "AUTHORIZATION_INVALID"
  | "HANDOVER_BLOCKED"
  | "QUANTITY_EXCEEDS_READY"
  | "IDEMPOTENCY_KEY_REUSED"
  | "HOLD_NOT_FOUND"
  | "HOLD_SCOPE_FORBIDDEN"
  | "HOLD_NOT_EXTENDABLE"
  | "HOLD_NOT_RELEASABLE"
  | "EXTENSION_OUT_OF_RANGE"
  | "HOLD_NOT_RESPONSIBLE"
  | "SAME_BRANCH"
  | "INVALID_BRANCH";

/** Resguardos (C4 #16-#19). */
export type HoldRow = {
  saleId: number;
  folio: string;
  clientName: string;
  clientPhoneMasked: string | null;
  /** Sucursal **de entrega** (donde está el inventario), no la responsable. */
  branch: { id: number; name: string };
  /** Sucursal que vendió: la que gestiona (prorroga) el resguardo. */
  responsibleBranch: { id: number; name: string };
  /** Calculado por el back: el usuario puede prorrogar este resguardo. */
  canManage: boolean;
  status: HoldStatus;
  readyAt: string;
  expiresAt: string;
  auditAt: string;
  extensionsCount: number;
  pendingUnits: number;
  /** Monto decimal ("123.45"). */
  pendingAmount: string;
};

export type HoldHistoryEntry = {
  /** Acción de auditoría `sale_pickup_hold.*`. */
  action: string;
  at: string;
  user: { id: number; name: string } | null;
  reason: string | null;
  details: Record<string, unknown>;
};

export type HoldDetail = HoldRow & {
  history: HoldHistoryEntry[];
  /** Ids de las entregas de la venta, para abrir la INE con el endpoint 13. */
  handoverIds: number[];
};

export type GetHoldsParams = {
  /** Sucursal de entrega. */
  branchId?: number;
  /** Sucursal responsable (la que vendió). */
  responsibleBranchId?: number;
  status: HoldStatus;
  search?: string;
  page: number;
  limit: number;
};

export type ExtendHoldRequest = {
  /** YYYY-MM-DD. */
  newExpiresAt: string;
  reason: string;
};

export type ReleaseHoldRequest = { reason: string };

export type ReleaseHoldResponse = {
  saleId: number;
  holdStatus: "RELEASED";
  saleCancelled: boolean;
  creditedAmount: string;
  releasedUnits: number;
};

export type HandoverEvidenceSide = "INE_FRONT" | "INE_BACK";

export type HandoverEvidenceResponse = { url: string; expiresAt: string };

/** Configuración de entregas (`/pos/delivery-config`, snake_case). */
export type DeliveryConfig = {
  pickup_hold_alert_days: number;
  pickup_hold_audit_days: number;
  pickup_hold_max_extension_days: number;
};

export type UpdateDeliveryConfigRequest = Partial<DeliveryConfig>;

/** Cambio de ubicación de entrega (C4). */
export type ChangeDeliveryBranchRequest = {
  branchId: number;
  username: string;
  password: string;
  /** 5 a 512 caracteres. */
  reason: string;
};

export type ChangeDeliveryBranchResponse = {
  saleId: number;
  previousBranch: DeliveryBranch;
  deliveryBranch: DeliveryBranch;
  authorizedBy: { id: number; name: string };
  transfersCancelled: number;
  openTransfers: number;
  /** `null` si la sucursal nueva aún no tiene piezas listas. */
  hold: {
    status: HoldStatus;
    readyAt: string | null;
    expiresAt: string | null;
  } | null;
};
