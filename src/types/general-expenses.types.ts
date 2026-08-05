export type GeneralExpenseStatus = "pending" | "paid" | "overdue";

export type GeneralExpenseStatusTab = "all" | GeneralExpenseStatus;

export type ApportionmentType =
  | "sales_participation"
  | "credit_card_sales"
  | "cash_sales"
  | "free";

export interface GeneralExpenseBranchShare {
  branchId: string;
  branchName: string;
  percentage: number;
  amount: number;
  isForeign: boolean;
}

export interface GeneralExpenseInvoice {
  id: string;
  externalId: string;
  date: string;
  paymentType: string;
  amount: number;
  fileName?: string;
}

export interface GeneralExpensePayment {
  id: string;
  date: string;
  registeredBy: string;
  amount: number;
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
  description: string;
  assignToSupplier: boolean;
  isLocalPurchase: boolean;
  responsibleId: string | null;
  responsibleName: string | null;
  requiresInvoice: boolean;
  invoices: GeneralExpenseInvoice[];
  payments: GeneralExpensePayment[];
  apportionEnabled: boolean;
  apportionmentType: ApportionmentType;
  applyToForeignBranches: boolean;
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
}

export interface GeneralExpenseCatalogOption {
  id: string;
  label: string;
  secondaryLabel?: string;
}

export interface CreateGeneralExpensePayload {
  assignToSupplier: boolean;
  supplierId: string | null;
  supplierName: string;
  dueDate: string;
  category: string;
  isLocalPurchase: boolean;
  responsibleId: string | null;
  responsibleName: string | null;
  description: string;
  amount: number;
  requiresInvoice: boolean;
  invoices: GeneralExpenseInvoice[];
  apportionEnabled: boolean;
  apportionmentType: ApportionmentType;
  applyToForeignBranches: boolean;
  branchShares: GeneralExpenseBranchShare[];
  singleBranchId: string | null;
  singleBranchName: string | null;
}

export interface UpdateGeneralExpensePayload
  extends Partial<CreateGeneralExpensePayload> {
  id: string;
}
