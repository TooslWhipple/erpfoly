/**
 * Discount request status for list filtering and display.
 */
export type DiscountRequestStatus = "pending" | "approved" | "rejected";

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
  /** Reason label for display */
  reason: string;
  reasonCode?: string;
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
  originalPrice: number;
  discountAmount: number;
  /** originalPrice * quantity - discountAmount */
  total: number;
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
  approvedDiscountPct: number | null;
  resolvedAt: string | null;
  createdAt: string;
  saleType: SaleTypeForm;
  subtotal: number;
  shipping: number;
  totalBeforeSpecialDiscount: number;
  specialDiscountAmount: number;
  totalAfterSpecialDiscount: number;
  downPaymentPct: number;
  downPaymentAmount: number;
  lineItems: DiscountRequestLineItem[];
  client: ClientSummary | null;
  delivery: DiscountRequestDelivery | null;
}

export interface ApproveDiscountRequestPayload {
  approvedDiscountPct: number;
  notes?: string;
}

export interface RejectDiscountRequestPayload {
  rejectionReason: string;
}
