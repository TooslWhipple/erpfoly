export type GeneralExpenseStatus = "pending" | "paid" | "overdue";

export type GeneralExpenseStatusTab = "all" | GeneralExpenseStatus;

export type ApportionmentType =
  | "sales_participation"
  | "credit_card_sales"
  | "cash_sales"
  | "free";

export const APPORTIONMENT_TYPE_OPTIONS: Array<{
  value: ApportionmentType;
  label: string;
}> = [
  { value: "sales_participation", label: "Por participación de venta" },
  { value: "credit_card_sales", label: "Ventas de tarjeta de crédito" },
  { value: "cash_sales", label: "Ventas de contado" },
  { value: "free", label: "Libre" },
];

export const APPORTIONMENT_TYPE_HELP: Record<ApportionmentType, string> = {
  sales_participation:
    "El porcentaje es proporcional al neto de ventas de cada sucursal en el mes anterior.",
  credit_card_sales:
    "El porcentaje es proporcional a las ventas con tarjeta de crédito de cada sucursal en el mes anterior.",
  cash_sales:
    "El porcentaje es proporcional a las ventas de contado de cada sucursal en el mes anterior.",
  free: "Captura el porcentaje de cada sucursal. La suma debe ser 100%.",
};

export interface GeneralExpenseBranchShare {
  branchId: string;
  branchName: string;
  percentage: number;
  amount: number;
}

export interface GeneralExpenseInvoice {
  id: string;
  externalId: string;
  date: string;
  paymentType: string;
  amount: number;
}

export interface GeneralExpensePayment {
  id: string;
  date: string;
  registeredBy: string;
  amount: number;
  notes?: string | null;
  receiptUrl?: string | null;
}

export interface GeneralExpenseListItem {
  id: string;
  supplierId: string | null;
  supplierName: string;
  supplierRfc?: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  balance: number;
  status: GeneralExpenseStatus;
  category: string;
  categoryId: string;
  description: string;
  detail: string | null;
  assignToSupplier: boolean;
  isLocalPurchase: boolean;
  responsibleId: string | null;
  responsibleName: string | null;
  requiresInvoice: boolean;
  invoices: GeneralExpenseInvoice[];
  payments: GeneralExpensePayment[];
  apportionEnabled: boolean;
  apportionmentType: ApportionmentType;
  branchShares: GeneralExpenseBranchShare[];
  singleBranchId: string | null;
  singleBranchName: string | null;
  createdAt: string;
}

export interface GeneralExpenseSummary {
  totalPending: number;
  overdue: number;
  dueSoon: number;
}

export interface UnassignedInvoice {
  id: string;
  supplierName: string;
  supplierRfc: string;
  date: string;
  paymentType: string;
  amount: number;
  invoiceNumber?: string;
  supplierId?: string | null;
}

export interface GeneralExpenseCatalogOption {
  id: string;
  label: string;
  secondaryLabel?: string;
}

export interface ApportionmentPreview {
  type: string;
  startDate: string;
  endDate: string;
  branchShares: GeneralExpenseBranchShare[];
}

export interface CreateGeneralExpensePayload {
  assignToSupplier: boolean;
  supplierId: string | null;
  detail?: string;
  dueDate: string;
  categoryId: string;
  isLocalPurchase: boolean;
  responsibleId: string | null;
  description: string;
  amount: number;
  requiresInvoice: boolean;
  payableInvoiceIds: string[];
  apportionEnabled: boolean;
  apportionmentType: ApportionmentType;
  branchShares: Array<{ branchId: string; percentage: number }>;
  singleBranchId: string | null;
}

export interface UpdateGeneralExpensePayload
  extends Partial<CreateGeneralExpensePayload> {
  id: string;
}

export interface CreateExpensePaymentPayload {
  amount: number;
  paymentDate: string;
  notes?: string;
}
