export type CosteoStatus =
  | "captured"
  | "costed"
  | "reviewed"
  | "received"
  | "ordered";

export type CosteoListFilter = "all" | "captured" | "received" | "ordered";

export type CosteoDetailTab =
  | "articles"
  | "expenses"
  | "costing"
  | "terms_freight"
  | "invoices";

export type CosteoCurrency = "MXN" | "USD";

export type CosteoInvoiceType = "PUE" | "PPD" | "credit_note";

export interface CosteoListItem {
  id: number;
  supplier: string;
  supplierDate: string;
  destination: string;
  deliveryDate: string;
  sku: string;
  status: CosteoStatus;
  progress: number;
  orderNumber: string;
  filterGroup: Exclude<CosteoListFilter, "all">;
}

export interface CosteoArticle {
  id: string;
  name: string;
  sku: string;
  orderNumber: string;
  netCost: number;
  netAmount: number;
  unitCost: number;
  totalCost: number;
  quantity: number;
  received: number;
  imageUrl?: string;
  costUsd: number;
  amountUsd: number;
  costMxn: number;
  amountMxn: number;
  expensesMxn: number;
  finalUnitCost: number;
}

export interface CosteoExpense {
  id: string;
  name: string;
  currency: CosteoCurrency;
  exchangeRate: number;
  amount: number;
  subtotal: number;
  vat: number;
  total: number;
  includedInInvoice: boolean;
}

export interface CosteoTermFreight {
  id: string;
  concept: string;
  termDays: number;
  freightType: string;
  amount: number;
  notes: string;
}

export interface CosteoInvoice {
  id: string;
  externalId: string;
  date: string;
  type: CosteoInvoiceType;
  amount: number;
}

export interface CosteoAvailableInvoice {
  id: string;
  externalId: string;
  date: string;
  type: CosteoInvoiceType;
  amount: number;
}

export interface CosteoBillingSummary {
  totalInvoiced: number;
  totalCreditNotes: number;
  totalArticles: number;
  discrepancy: number;
}

export interface CosteoExpenseSummary {
  subtotal: number;
  vat: number;
  total: number;
}

export interface CosteoDetail {
  id: number;
  supplier: string;
  supplierDate: string;
  destination: string;
  deliveryDate: string;
  orderNumber: string;
  status: CosteoStatus;
  progress: number;
  exchangeRate: number;
  affectArticlePrices: boolean;
  articles: CosteoArticle[];
  expenses: CosteoExpense[];
  expenseSummary: CosteoExpenseSummary;
  termsFreight: CosteoTermFreight[];
  invoices: CosteoInvoice[];
  availableInvoices: CosteoAvailableInvoice[];
  billingSummary: CosteoBillingSummary;
}

export interface GetCosteosParams {
  filter?: CosteoListFilter;
}

export interface GetCosteosResponse {
  data: CosteoListItem[];
  total: number;
}

export interface AddCosteoExpensePayload {
  name: string;
  currency: CosteoCurrency;
  exchangeRate: number;
  amount: number;
  includedInInvoice: boolean;
}

export interface AddCosteoInvoicePayload {
  invoiceIds: string[];
}
