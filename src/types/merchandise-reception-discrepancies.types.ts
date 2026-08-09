export type MerchandiseReceptionDiscrepancyStatus = "pending" | "paid";

export type MerchandiseReceptionInvoiceType = "PUE" | "PPD" | "CREDIT_NOTE";

export interface MerchandiseReceptionDiscrepancyListItem {
  id: string;
  receptionId: string;
  supplierId: string;
  supplierName: string;
  receptionDate: string;
  itemsTotal: number;
  invoicedTotal: number;
  discrepancy: number;
  status: MerchandiseReceptionDiscrepancyStatus;
}

export interface MerchandiseReceptionInvoice {
  id: string;
  externalId: string;
  date: string;
  type: MerchandiseReceptionInvoiceType;
  amount: number;
}

export interface MerchandiseReceptionAvailableInvoice {
  id: string;
  externalId: string;
  date: string;
  type: MerchandiseReceptionInvoiceType;
  amount: number;
}

export interface MerchandiseReceptionBillingSummary {
  totalInvoiced: number;
  totalCreditNotes: number;
  totalArticles: number;
  discrepancy: number;
}

export interface MerchandiseReceptionDiscrepancyDetail {
  id: string;
  receptionId: string;
  supplierId: string;
  supplierName: string;
  originName: string;
  originDate: string;
  branchName: string;
  deliveryDate: string;
  receptionDate: string;
  status: MerchandiseReceptionDiscrepancyStatus;
  invoices: MerchandiseReceptionInvoice[];
  availableInvoices: MerchandiseReceptionAvailableInvoice[];
  billingSummary: MerchandiseReceptionBillingSummary;
}
