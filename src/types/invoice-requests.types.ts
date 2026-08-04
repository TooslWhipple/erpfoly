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
  amount: number | null;
  concept?: string;
  paymentType?: InvoicePaymentType;
  requestingArea?: string;
  assignToSupplier?: boolean;
  supplierId?: string;
  supplierName?: string;
  paymentDetails?: string;
  cfdiId?: string;
  cfdiUuid?: string;
}

export interface InvoiceRequestDetail extends InvoiceRequestListItem {
  subtotal: number | null;
  vat: number | null;
  total: number | null;
  issuedAt: string | null;
  paymentDueAt: string | null;
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
  cfdiId?: string;
  cfdiUuid?: string;
  alreadyExists?: boolean;
}

export interface CreateInvoiceRequestPayload {
  invoiceNumber: string;
  concept: string;
  paymentType: InvoicePaymentType;
  requestingArea: string;
  assignToSupplier: boolean;
  supplierId?: number;
  paymentDetails?: string;
  cfdiId: string;
  cfdiUuid: string;
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
  businessName?: string | null;
}
