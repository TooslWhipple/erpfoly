import type { CartItem, SalePaymentType } from "./ventas.types";

export type QuotationStatus = "DRAFT" | "ACTIVE" | "CONVERTED" | "EXPIRED" | "CANCELLED";

export type DiscountRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface DiscountRequestReasonCatalogItem {
  id: number;
  code: string;
  name: string;
  description: string | null;
}

export interface QuotationListItem {
  id: number;
  folio: string;
  status: QuotationStatus;
  paymentType: SalePaymentType;
  clientId: number | null;
  clientName: string | null;
  productName: string | null;
  productImageUrl: string | null;
  createdAt: string;
}

export interface GetQuotationsParams {
  page: number;
  limit: number;
  search?: string;
}

export interface QuotationClientInfo {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  creditStatus: "ACTIVE" | "INACTIVE" | null;
  creditUsed: number | null;
  creditAvailable: number | null;
  folypuntos: number | null;
}

export interface QuotationDelivery {
  type: "home" | "branch";
  address: string | null;
  receiverName: string | null;
  receiverPhone: string | null;
  receiverEmail: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface QuotationDetail {
  id: number;
  folio: string;
  status: QuotationStatus;
  paymentType: SalePaymentType;
  shippingCost: number;
  items: CartItem[];
  client: QuotationClientInfo | null;
  delivery: QuotationDelivery | null;
  discountRequest: {
    status: DiscountRequestStatus;
    reasonId: number;
    reasonCode: string;
    reasonLabel: string;
    notes: string | null;
  } | null;
  layawayPlan: {
    days: number;
    dueDate: string;
  } | null;
  folypuntosEnabled: boolean;
}

export interface RequestDiscountPayload {
  reasonId: number;
  notes?: string;
}

export interface LayawayPlanOption {
  days: number;
  label: string;
  dueDateLabel: string;
}
