export type CosteoStatus =
  | "captured"
  | "costed"
  | "reviewed"
  | "received"
  | "ordered"
  | "cancelled";

export type CosteoListFilter = "all" | "captured" | "received" | "ordered";

export type CosteoDetailTab =
  | "articles"
  | "expenses"
  | "costing"
  | "invoices";

export type CosteoCurrency = "MXN" | "USD";

export type InvoiceOrigin = "providers" | "administration";

export interface CosteoListItem {
  id: number;
  supplier: string;
  supplierDate: string;
  branch: { id: number; name: string };
  deliveryDate: string;
  receptionDate: string | null;
  orderDate: string | null;
  status: CosteoStatus;
  orderNumber: string;
  filterGroup: Exclude<CosteoListFilter, "all">;
}

export interface CosteoArticle {
  id: number;
  name: string;
  sku: string;
  orderNumber: string;
  netCost: number;
  netAmount: number;
  unitCost: number;
  totalCost: number;
  quantity: number;
  received: number;
  imageUrl?: string | null;
  costUsd: number;
  amountUsd: number;
  costMxn: number;
  amountMxn: number;
  expensesUsd: number;
  expensesMxn: number;
  finalUnitCost: number;
}

export interface CosteoExpense {
  id: number;
  name: string;
  currency: CosteoCurrency;
  exchangeRate: number;
  amount: number;
  subtotal: number;
  vat: number;
  total: number;
  includedInInvoice: boolean;
}

export interface CosteoInvoice {
  id: number;
  externalId: string;
  date: string;
  paymentType: "PUE" | "PPD";
  origin: InvoiceOrigin;
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
  supplierId: number;
  supplierDate: string;
  branch: { id: number; name: string };
  deliveryDate: string;
  receptionDate: string | null;
  orderNumber: string;
  status: CosteoStatus;
  exchangeRate: number;
  affectArticlePrices: boolean;
  articles: CosteoArticle[];
  expenses: CosteoExpense[];
  expenseSummary: CosteoExpenseSummary;
  invoices: CosteoInvoice[];
  receptionId: number | null;
  billingSummary: CosteoBillingSummary;
}

export interface GetCosteosParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CosteoStatus;
  filter?: CosteoListFilter;
  supplier_id?: number;
  branch_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface GetCosteosResponse {
  rows: CosteoListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AddCosteoExpensePayload {
  name: string;
  currency: CosteoCurrency;
  exchange_rate: number;
  amount: number;
  included_in_invoice: boolean;
}

export interface SaveCosteoExpensePayload {
  id?: number;
  name: string;
  currency: CosteoCurrency;
  exchange_rate: number;
  amount: number;
  included_in_invoice?: boolean;
}

export interface SaveCosteoDetailPayload {
  exchange_rate: number;
  affect_article_prices: boolean;
  items: Array<{ id?: number; received?: number }>;
  expenses: SaveCosteoExpensePayload[];
}
