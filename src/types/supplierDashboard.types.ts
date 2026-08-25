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
  id: number;
  periodMonth: number;
  periodYear: number;
  amount: number;
  payments: number;
  balance: number;
  status: SupplierAccountStatementStatus;
}

export interface SupplierDeliveryItem {
  id: number;
  productName: string;
  quantity: number;
}

export interface SupplierDeliveryGroup {
  id: number;
  date: string | Date;
  itemCount: number;
  items: SupplierDeliveryItem[];
}

export type SupplierChargeStatus = "pending" | "paid";

export interface SupplierChargeRow {
  id: number;
  description: string;
  category: string;
  periodMonth: number;
  periodYear: number;
  amount: number;
  status: SupplierChargeStatus;
}

export interface SupplierChargeCategoryOption {
  id: string;
  label: string;
}

export interface SupplierAccountStatementOption {
  value: number;
  label: string;
}

export interface RegisterSupplierChargePayload {
  supplierId: number;
  accountStatementId: number;
  chargedInLabel: string;
  categoryId: string;
  description: string;
  amount: number;
  includesVat: boolean;
}

export type SupplierPaymentStatus = "pending" | "paid";

export interface SupplierPaymentRow {
  id: number;
  description: string;
  periodMonth: number;
  periodYear: number;
  amount: number;
  status: SupplierPaymentStatus;
  paymentDate: string | Date;
  scheduledDate: string | Date | null;
}

export interface ScheduleSupplierPaymentPayload {
  accountStatementId: number;
  amount: number;
  scheduledDate: string;
}

export interface RegisterSupplierPaymentPayload {
  accountStatementId: number;
  amount: number;
  paidDate: string;
}

export interface ExecuteSupplierPaymentPayload {
  paidDate?: string;
}

export interface EditSupplierPaymentPayload {
  amount?: number;
  scheduledDate?: string;
}

export type SupplierDamagedGoodsStatus = "scheduled" | "pending";

export type SupplierDamagedGoodsUrgency = "high" | "medium" | "low";

export interface SupplierDamagedGoodsRow {
  id: number;
  sku: string;
  warehouse: string;
  entryDate: string | Date;
  articleName: string;
  damageDescription: string;
  status: SupplierDamagedGoodsStatus;
  urgency: SupplierDamagedGoodsUrgency;
}

export interface RegisterDamagedGoodsExitPayload extends RegisterSupplierChargePayload {
  damagedGoodsIds: number[];
}

export interface SupplierDashboard {
  supplierId: number;
  supplierName: string;
  summary: SupplierDashboardSummary;
  accountStatements: SupplierAccountStatementRow[];
  upcomingDeliveries: SupplierDeliveryGroup[];
  recentDeliveries: SupplierDeliveryGroup[];
}
