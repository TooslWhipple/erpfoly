export type SupplierAccountStatementStatus = "pending" | "overdue" | "paid";

export type SupplierDashboardTab =
  | "account_statements"
  | "charges"
  | "payments"
  | "damaged_goods";

export interface SupplierDashboardSummary {
  pendingPayments: number;
  supplierCharges: number;
  totalToPay: number;
}

export interface SupplierAccountStatementRow {
  id: string;
  periodLabel: string;
  amount: number;
  payments: number;
  balance: number;
  status: SupplierAccountStatementStatus;
}

export interface SupplierDeliveryItem {
  id: string;
  productName: string;
  quantity: number;
}

export interface SupplierDeliveryGroup {
  id: string;
  dateLabel: string;
  itemCount: number;
  items: SupplierDeliveryItem[];
}

export type SupplierChargeStatus = "pending" | "paid";

export interface SupplierChargeRow {
  id: string;
  description: string;
  category: string;
  chargedInLabel: string;
  amount: number;
  status: SupplierChargeStatus;
}

export interface SupplierChargeCategoryOption {
  id: string;
  label: string;
}

export interface SupplierAccountStatementOption {
  value: string;
  label: string;
}

export interface RegisterSupplierChargePayload {
  supplierId: number;
  accountStatementId: string;
  chargedInLabel: string;
  categoryId: string;
  description: string;
  amount: number;
  includesVat: boolean;
}

export type SupplierPaymentStatus = "pending" | "paid";

export interface SupplierPaymentRow {
  id: string;
  description: string;
  chargedInLabel: string;
  amount: number;
  status: SupplierPaymentStatus;
}

export type SupplierDamagedGoodsStatus = "scheduled" | "pending";

export type SupplierDamagedGoodsUrgency = "high" | "medium" | "low";

export interface SupplierDamagedGoodsRow {
  id: string;
  sku: string;
  warehouse: string;
  entryDate: string;
  articleName: string;
  damageDescription: string;
  status: SupplierDamagedGoodsStatus;
  elapsedLabel: string;
  urgency: SupplierDamagedGoodsUrgency;
}

export interface RegisterDamagedGoodsExitPayload extends RegisterSupplierChargePayload {
  damagedGoodsIds: string[];
}

export interface SupplierDashboard {
  supplierId: number;
  supplierName: string;
  summary: SupplierDashboardSummary;
  accountStatements: SupplierAccountStatementRow[];
  upcomingDeliveries: SupplierDeliveryGroup[];
  recentDeliveries: SupplierDeliveryGroup[];
}
