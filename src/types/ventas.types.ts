export type SaleStatus =
  | "DRAFT"
  | "PENDING_DISCOUNT"
  | "PENDING_CASHIER"
  | "PENDING_PAYMENT"
  | "PAID"
  | "PARTIALLY_DELIVERED"
  | "DELIVERED"
  | "CANCELLED";

export type SalePaymentType = "CREDIT" | "CASH" | "LAYAWAY";

export type SaleStatusTab =
  | "all"
  | "completed"
  | "pending"
  | "pendingCashier"
  | "processedCashier"
  | "cashierAll"
  | "finalized";

export interface SaleListItem {
  id: number;
  folio: string;
  status: SaleStatus;
  paymentType: SalePaymentType;
  clientName: string | null;
  sellerName?: string | null;
  productName: string | null;
  productImageUrl: string | null;
  itemCount: number;
  totalAmount: number;
  createdAt: string;
}

export interface GetSalesParams {
  page: number;
  limit: number;
  search?: string;
  statusTab?: SaleStatusTab;
  status?: SaleStatus;
  created_by?: number;
  branch_id?: number;
  amount?: number;
}

export interface ProductSearchResult {
  id: number;
  code: string;
  name: string;
  imageUrl: string | null;
  finalPrice: number;
}

export interface InventorySource {
  sourceKey: string;
  sourceType: "branch" | "warehouse";
  branchId?: number;
  label: string;
  available: number;
  pendingOrdered?: number;
  inTransit?: number;
  quantity: number;
}

export interface ProductDetail {
  id: number;
  sku: string;
  name: string;
  brandName: string | null;
  imageUrl: string | null;
  images?: { imageUrl: string }[];
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
   * Pieces covered by warehouse `ordered` (supplier PO), plus any leftover
   * the backend still tracks as uncovered. Shown as the backorder chip.
   */
  backorderedQuantity: number;
}

export type NewSaleView = "form" | "search" | "product-detail" | "checkout";

export interface SaleDetailItem {
  id: number;
  quantity: number;
  backorderedQuantity: number;
  unitPrice: number;
  listPrice?: number;
  discountAmount: number;
  totalAmount: number;
  inventorySources: InventorySource[];
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
  shippingAmount?: number;
  shippingCoverage?: "IN_ZONE" | "OUT_OF_COVERAGE" | "UNCONFIGURED" | null;
  totalAmount: number;
  economicRevision?: number;
  loyaltyPointsValue: number;
  purchaseType: string | null;
  identityVerifiedAt?: string | null;
  identityVerificationAuthorizedBy?: number | null;
  layawayTermId?: number | null;
  createdAt: string;
  branchId?: number | null;
  deliveryDate?: string | null;
  estimatedDeliveryDate?: string | null;
  deliveryStatus?: string | null;
  deliveryType?: string | null;
  deliveryBranchId?: number | null;
  deliveryBranchName?: string | null;
  deliveryAddressId?: number | null;
  deliveryAddressFormatted?: string | null;
  deliveryAddressLatitude?: string | null;
  deliveryAddressLongitude?: string | null;
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
