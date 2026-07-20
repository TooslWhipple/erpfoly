export type SaleStatus =
  | "DRAFT"
  | "PENDING_DISCOUNT"
  | "PENDING_PAYMENT"
  | "PAID"
  | "PARTIALLY_DELIVERED"
  | "DELIVERED"
  | "CANCELLED";

export type SalePaymentType = "CREDIT" | "CASH" | "LAYAWAY";

export type SaleStatusTab = "all" | "completed" | "pending" | "finalized";

export interface SaleListItem {
  id: number;
  folio: string;
  status: SaleStatus;
  paymentType: SalePaymentType;
  clientName: string | null;
  productName: string | null;
  productImageUrl: string | null;
  createdAt: string;
}

export interface GetSalesParams {
  page: number;
  limit: number;
  search?: string;
  statusTab?: SaleStatusTab;
  created_by?: number;
}

export interface ProductSearchResult {
  id: number;
  code: string;
  name: string;
  imageUrl: string | null;
  averageCost: number;
  lastCost: number;
  costWithoutDiscount: number;
  discountPct: number;
  supplier1Name: string | null;
  supplier2Name: string | null;
}

export interface InventorySource {
  sourceKey: string;
  sourceType: "branch" | "warehouse" | "incoming";
  branchId?: number;
  label: string;
  available: number;
  ordered?: number;
  inTransit?: number;
  quantity: number;
}

export interface ProductDetail {
  id: number;
  sku: string;
  name: string;
  brandName: string | null;
  imageUrl: string | null;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  inventorySources: InventorySource[];
  hasOtherBranches?: boolean;
}

export interface CartItem {
  productId: number;
  sku: string;
  productName: string;
  brandName: string | null;
  imageUrl: string | null;
  originalPrice: number;
  discountAmount: number;
  unitPrice: number;
  quantity: number;
  sources: InventorySource[];
  /** Set when this line was hydrated from an existing DRAFT sale being resumed. */
  saleItemId?: number;
  /**
   * Portion of `quantity` without stock backing it, resolved later when
   * merchandise arrives. Recomputed locally from `sources` whenever they're
   * known (fresh line); for resumed lines (`sources: []`) it keeps the
   * value the backend last computed until the sale is re-synced.
   */
  backorderedQuantity: number;
}

export type NewSaleView = "form" | "search" | "product-detail" | "checkout";

export interface SaleDetailItem {
  id: number;
  quantity: number;
  backorderedQuantity: number;
  unitPrice: number;
  discountAmount: number;
  totalAmount: number;
  product: {
    id: number;
    code: string;
    name: string;
    imageUrl: string | null;
  };
}

export interface SaleDetailClient {
  id: number;
  fullName: string;
  phoneNumber: string | null;
  email: string | null;
  primaryAddress: {
    id: number;
    formatted: string;
    latitude: string | null;
    longitude: string | null;
  } | null;
}

export interface SaleDetailPayment {
  id: number;
  paymentMethod: string;
  amount: number;
  receivedAmount: number | null;
  changeAmount: number | null;
}

export interface SaleDetailCredit {
  downPayment: number;
  termMonths: number;
  installmentAmount: number;
}

export interface SaleDetailLayawayPayment {
  id: number;
  amount: number;
  paymentMethod: string;
  notes: string | null;
  createdAt: string;
}

export interface SaleDetailLayaway {
  id: number;
  status: "ACTIVE" | "COMPLETED" | "EXPIRED" | "CANCELLED";
  termName: string;
  termDays: number;
  totalAmount: number;
  depositAmount: number;
  paidAmount: number;
  expiresAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  payments: SaleDetailLayawayPayment[];
}

export type DiscountRequestReason =
  "LAST_UNIT" | "DAMAGED_ITEM" | "CLOSING_SALE" | "OTHER";

export type DiscountRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "INVALIDATED";

export interface SaleDiscountRequest {
  id: number;
  status: DiscountRequestStatus;
  reason: DiscountRequestReason;
  discountPct: number | null;
  requestedDiscountAmount: number | null;
  approvedDiscountPct: number | null;
  approvedDiscountAmount: number | null;
  notes: string | null;
  rejectionReason: string | null;
}

export interface SaleDetail {
  id: number;
  folio: string;
  status: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  loyaltyPointsValue: number;
  purchaseType: string | null;
  layawayTermId?: number | null;
  createdAt: string;
  branchId?: number | null;
  deliveryDate?: string | null;
  estimatedDeliveryDate?: string | null;
  deliveryStatus?: string | null;
  deliveryType?: string | null;
  deliveryBranchId?: number | null;
  deliveryBranchName?: string | null;
  deliveryAddressFormatted?: string | null;
  client: SaleDetailClient | null;
  items: SaleDetailItem[];
  payments: SaleDetailPayment[];
  credit: SaleDetailCredit | null;
  layaway: SaleDetailLayaway | null;
  discountRequest: SaleDiscountRequest | null;
}

export type DeliveryAvailability = "available" | "low" | "none";

export interface DeliveryAvailabilityItem {
  date: string;
  count: number;
  availability: DeliveryAvailability;
}

export interface SetDeliveryDatePayload {
  delivery_date?: string;
  delivery_type?: "ADDRESS" | "BRANCH";
  branch_id?: number;
  address_id?: number;
  estimated_delivery_date?: string;
}

export interface RedDeliveryListItem {
  id: number;
  saleId: number;
  folio: string;
  saleStatus: SaleStatus;
  deliveryStatus: string;
  clientName: string | null;
  saleCreatedAt: string;
  flaggedAt: string;
}

export interface GetRedDeliveriesParams {
  page: number;
  limit: number;
  search?: string;
}

export interface CancelRedDeliveryPayload {
  reason?: string;
}
