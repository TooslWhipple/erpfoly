export type ClientPaymentMethod = "cash" | "card";

export interface PendingInstallment {
  id: string;
  installmentNumber: number;
  totalInstallments: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
}

export interface ClientCreditAccount {
  id: string;
  productName: string;
  purchaseDateLabel: string;
  initialCost: number;
  totalPaid: number;
  remaining: number;
  paymentDueDate: string;
  highlightPaymentDueDate: boolean;
  nextPaymentAmount: number;
  nextPaymentBreakdown?: string;
  paidInstallments: number;
  totalInstallments: number;
  pendingInstallments: PendingInstallment[];
}

export interface InstallmentSelection {
  purchaseId: string;
  installmentId: string;
  selected: boolean;
  amountToPay: number;
}

export interface ClientPaymentContext {
  clientId: string;
  clientName: string;
  clientPhone: string;
  creditAccounts: ClientCreditAccount[];
}

export interface PaymentAllocation {
  label: string;
  amount: number;
}

export interface CreateClientPaymentPayload {
  clientId: string;
  paymentMethod: ClientPaymentMethod;
  isCashDeposit: boolean;
  paymentAmount: number;
  selections: InstallmentSelection[];
  cashRegisterId?: string;
}

export interface ClientPaymentResult {
  id: string;
  totalAmount: number;
  dateLabel: string;
  allocations: PaymentAllocation[];
  clientPhone: string;
  paidInstallments: number;
  totalInstallments: number;
  receiptUrl: string;
}
