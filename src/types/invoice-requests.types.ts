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
  orderId?: string;
  paymentDetails?: string;
  cfdiId?: string;
  cfdiUuid?: string;
}

export interface InvoiceRequestDetail extends InvoiceRequestListItem {
  orderFolio?: string;
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
  /** Contabilidad CFDI id when parsed via backend proxy. */
  cfdiId?: string;
  /** Contabilidad CFDI UUID when parsed via backend proxy. */
  cfdiUuid?: string;
  /** True when contabilidad already had this CFDI (409 resolved). */
  alreadyExists?: boolean;
}

export interface CreateInvoiceRequestPayload {
  invoiceNumber: string;
  concept: string;
  paymentType: InvoicePaymentType;
  requestingArea: string;
  assignToSupplier: boolean;
  supplierId?: number;
  orderId?: number;
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

export interface InvoiceOrderOption {
  id: string;
  label: string;
}

export interface InvoiceSupplierWithOrdersOption {
  id: string;
  label: string;
  orders: InvoiceOrderOption[];
}

/** @deprecated Use InvoiceSupplierWithOrdersOption */
export type InvoiceSupplierOption = Omit<InvoiceSupplierWithOrdersOption, "orders">;
