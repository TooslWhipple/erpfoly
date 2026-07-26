export type InvoiceRequestStatus = "pending" | "accepted" | "rejected";

export type InvoiceRequestOrigin = "providers" | "administration";

export type InvoicePaymentType = "PUE" | "PPD";

export type InvoiceRequestStatusTab = "all" | InvoiceRequestStatus;

export interface InvoiceRequestListItem {
  id: number;
  invoiceNumber: string;
  origin: InvoiceRequestOrigin;
  details: string;
  requestedAt: string;
  status: InvoiceRequestStatus;
  amount: number;
  concept?: string;
  paymentType?: InvoicePaymentType;
  subtotal?: number;
  vat?: number;
  issuedAt?: string;
  paymentDueAt?: string;
  requestingArea?: string;
  assignToSupplier?: boolean;
  supplierId?: string;
  supplierName?: string;
  orderId?: string;
  paymentDetails?: string;
}

export interface ParsedInvoiceFileData {
  invoiceNumber: string;
  concept: string;
  paymentType: InvoicePaymentType;
  subtotal: number;
  vat: number;
  total: number;
  issuedAt: string;
  paymentDueAt: string;
  requestingArea: string;
  supplierName?: string;
  paymentDetails?: string;
}

export interface CreateInvoiceRequestPayload {
  invoiceNumber: string;
  concept: string;
  paymentType: InvoicePaymentType;
  subtotal: number;
  vat: number;
  total: number;
  issuedAt: string;
  paymentDueAt: string;
  requestingArea: string;
  assignToSupplier: boolean;
  supplierId?: string;
  supplierName?: string;
  orderId?: string;
  paymentDetails?: string;
  fileName?: string;
}

export interface GetInvoiceRequestsParams {
  page: number;
  limit: number;
  search?: string;
  statusTab?: InvoiceRequestStatusTab;
}

export interface InvoiceSupplierOption {
  id: string;
  label: string;
}

export interface InvoiceOrderOption {
  id: string;
  label: string;
}
