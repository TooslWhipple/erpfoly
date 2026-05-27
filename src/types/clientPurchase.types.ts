export type ClientPurchaseStatus =
  | "AL_CORRIENTE"
  | "ENTREGA_PROGRAMADA"
  | "ENTREGA_PENDIENTE";

export type ClientPurchasePaymentStatus = "PAID" | "PENDING";

export interface ClientPurchasePayment {
  id: string;
  status: ClientPurchasePaymentStatus;
  installmentLabel: string;
  dueDate: string;
  amount: number;
}

export interface ClientPurchaseInfo {
  purchaseDate: string;
  deliveryDate: string;
  purchaseBranch: string;
  deliveryBranch: string;
}

export interface ClientPurchaseDetail {
  id: string;
  reference: string;
  productSku: string;
  productImageUrl?: string | null;
  clientId: string;
  clientName: string;
  productName: string;
  purchaseDateLabel: string;
  status: ClientPurchaseStatus;
  initialCost: number;
  totalPaid: number;
  remaining: number;
  paymentDueDate: string;
  highlightPaymentDueDate: boolean;
  nextPaymentAmount: number;
  paidInstallments: number;
  totalInstallments: number;
  payments: ClientPurchasePayment[];
  purchaseInfo: ClientPurchaseInfo;
}
