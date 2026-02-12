/**
 * Discount request status for list filtering and display.
 */
export type DiscountRequestStatus = "pending" | "accepted" | "rejected";

/**
 * Payment/sale type for the discount request (displayed as chip).
 */
export type DiscountRequestType = "contado" | "credito";

export interface DiscountRequest {
  id: number;
  /** ISO date string for date-time column */
  createdAt: string;
  type: DiscountRequestType;
  /** Customer full name (may be truncated in UI) */
  customerName: string;
  /** Number of articles in the request */
  articleCount: number;
  /** Discount amount in currency */
  amount: number;
  /** Reason for the discount (e.g. "Última pieza", "Cierre de venta") */
  reason: string;
  status: DiscountRequestStatus;
}

export interface GetDiscountRequestsParams {
  page: number;
  limit: number;
  status?: DiscountRequestStatus;
  search?: string;
}

export interface GetDiscountRequestsResponse {
  data: DiscountRequest[];
  total: number;
  page: number;
  limit: number;
}

// ============================================================================
// NEW DISCOUNT REQUEST FORM
// ============================================================================

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

export interface NewDiscountRequestForm {
  discountReason: string;
  saleType: SaleTypeForm;
  client: ClientSummary | null;
  lineItems: DiscountRequestLineItem[];
  deliveryType: DeliveryOption;
  deliveryAddress?: string;
}
