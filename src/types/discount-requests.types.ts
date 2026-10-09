/**
 * Discount request status for list filtering and display.
 */
export type DiscountRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "invalidated";

/**
 * Payment/sale type for the discount request (displayed as chip).
 */
export type DiscountRequestType = "contado" | "credito" | "apartado";

export interface DiscountRequest {
  id: number;
  saleId: number;
  saleFolio: string;
  /** ISO date string for date-time column */
  createdAt: string;
  type: DiscountRequestType;
  /** Customer full name (may be truncated in UI) */
  customerName: string | null;
  /** Number of articles in the request */
  articleCount: number;
  /** Total amount in currency */
  amount: number;
  /** Full reason text. The table uses it as the tooltip. */
  reason: string;
  reasonCode?: string;
  /** Distinct reason labels. More than one renders as "y N más". */
  reasonLabels?: string[];
  notes?: string | null;
  status: DiscountRequestStatus;
  requestedDiscountPct?: number | null;
}

export interface GetDiscountRequestsParams {
  page: number;
  limit: number;
  status?: DiscountRequestStatus;
  search?: string;
}

export type SaleTypeForm = "contado" | "credito" | "apartado";

export interface ClientSummary {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  hasActiveCredit: boolean;
}

export interface DiscountRequestLineItem {
  id: string;
  code: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  quantity: number;
  /** Full line quantity when `quantity` is only the discounted pieces. */
  lineQuantity?: number;
  originalPrice: number;
  discountAmount: number;
  /** originalPrice * quantity - discountAmount */
  total: number;
  discountRequestItemId?: number | null;
  reason?: string | null;
  reasonLabel?: string | null;
  notes?: string | null;
  approvedDiscountPct?: number | null;
  approvedDiscountAmount?: number | null;
  allocatedAmount?: number | null;
  /** Portion the special discount is calculated on. */
  lineBase?: number;
}

export type DeliveryOption = "a_domicilio" | "recoger_sucursal";

export interface DiscountRequestDelivery {
  type: DeliveryOption;
  address: string | null;
  receiverPhone: string | null;
  receiverEmail: string | null;
  latitude: string | null;
  longitude: string | null;
}

export interface DiscountRequestDetail {
  id: number;
  saleId: number;
  saleFolio: string;
  status: DiscountRequestStatus;
  reason: string;
  reasonLabel: string;
  notes: string | null;
  rejectionReason: string | null;
  requestedDiscountPct: number | null;
  requestedDiscountAmount: number | null;
  approvedDiscountPct: number | null;
  approvedDiscountAmount: number | null;
  resolvedAt: string | null;
  createdAt: string;
  saleType: SaleTypeForm;
  subtotal: number;
  shipping: number;
  totalBeforeSpecialDiscount: number;
  /** Merchandise the percentage or fixed amount is calculated on. */
  discountBaseAmount: number;
  specialDiscountAmount: number;
  totalAfterSpecialDiscount: number;
  downPaymentPct: number;
  downPaymentAmount: number;
  lineItems: DiscountRequestLineItem[];
  client: ClientSummary | null;
  delivery: DiscountRequestDelivery | null;
}

export type ApproveDiscountLinePayload = {
  discountRequestItemId: number;
  approvedDiscountPct?: number;
  approvedDiscountAmount?: number;
};

export type ApproveDiscountRequestPayload =
  | { items: ApproveDiscountLinePayload[]; notes?: string }
  | { approvedDiscountPct: number; notes?: string }
  | { approvedDiscountAmount: number; notes?: string };

export interface RejectDiscountRequestPayload {
  rejectionReason: string;
}
