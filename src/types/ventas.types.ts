export type SaleStatus = "DRAFT" | "PENDING_PAYMENT" | "PAID" | "CANCELLED";

export type SalePaymentType = "CREDIT" | "CASH" | "LAYAWAY";

export type SaleStatusTab = "all" | "completed" | "pending";

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
}

export type NewSaleView = "form" | "search" | "product-detail" | "checkout";
