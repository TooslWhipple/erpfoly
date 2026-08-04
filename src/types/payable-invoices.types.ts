import type { InvoiceRequestOrigin, InvoicePaymentType } from "./invoice-requests.types";

export type PayableInvoiceDisplayStatus = "pending" | "paid" | "overdue";

export type PayableInvoiceStatusTab = "all" | PayableInvoiceDisplayStatus;

export interface PayableInvoiceListItem {
  id: number;
  invoiceNumber: string;
  origin: InvoiceRequestOrigin;
  details: string;
  dueDate: string;
  status: PayableInvoiceDisplayStatus;
  amount: number;
  paidAmount: number;
  balance: number;
  paymentType: InvoicePaymentType;
  concept: string;
  supplierId?: string;
  supplierName?: string;
  orderId?: string;
  issuedAt: string;
  cfdiUuid: string;
}

export interface PayableInvoiceSummary {
  totalPending: number;
  overdue: number;
  dueSoon: number;
  pendingApproval: number;
}
