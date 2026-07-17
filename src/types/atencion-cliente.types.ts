export type SearchType = "facturas" | "clientes" | "pedidos";

export type InvoiceStatus = "activo" | "cancelado" | "pagado";

export type ArticleStatus =
  | "entregado"
  | "reparacion"
  | "pendiente"
  | "cancelado";

export type InvoicePaymentType = "credito" | "contado";

export interface InvoiceArticle {
  id: string;
  code: string;
  status: ArticleStatus;
  description: string;
  price: number;
  promotions: number;
  total: number;
  points: number;
  supplier?: string;
  deliveryMethod?: string;
  serialNumber?: string;
  quantity?: number;
}

export interface InvoiceActivity {
  id: string;
  date: string;
  type: "payment" | "adjustment" | "note" | "status_change";
  description: string;
  amount?: number;
}

export interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  purchaseDate: string;
  paymentType: InvoicePaymentType;
  status: InvoiceStatus;
  initialCost: number;
  totalPayments: number;
  remaining: number;
  paymentDate: string;
  nextPayment: number;
  currentPayment: number;
  totalPaymentsCount: number;
  articles: InvoiceArticle[];
  activities: InvoiceActivity[];
  summary: {
    subtotalWithoutTax: number;
    tax: number;
    amountWithTax: number;
    luxuryTax: number;
    total: number;
  };
}

export interface SearchResult {
  id: string;
  type: SearchType;
  title: string;
  subtitle?: string;
  metadata?: Record<string, string>;
}

export interface CreateServiceOrderPayload {
  invoiceId: string;
  articleId: string;
  quantity: number;
  serialNumber: string;
  complaint: string;
  observations: string;
  evidenceFiles: File[];
}
