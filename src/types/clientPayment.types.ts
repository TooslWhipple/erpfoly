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

export interface BackendSaleCreditInstallment {
  id: number;
  installment_number: number;
  due_date: string;
  amount: number;
  paid_amount: number;
  remaining: number;
  paid_date: string | null;
  status: string;
  base_amount: number;
  iva_amount: number;
}

export interface BackendSaleCreditPayment {
  id: number;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference: string | null;
  notes: string | null;
}

export interface BackendSaleCreditDetail {
  credit: {
    id: number;
    sale_id: number;
    sale_folio: string;
    product_name: string;
    product_code: string | null;
    product_description: string | null;
    purchase_date: string;
    initial_cost: number;
    financed_amount: number;
    down_payment_amount: number;
    outstanding_balance: number;
    total_paid: number;
    term_months: number;
    installment_amount: number;
    first_due_date: string;
    status: string;
    client: {
      id: number | null;
      name: string;
      phone: string | null;
      email: string | null;
    };
  };
  installments: BackendSaleCreditInstallment[];
  payments: BackendSaleCreditPayment[];
  summary: {
    subtotal: number;
    iva: number;
    total: number;
  };
}

export interface BackendSaleCreditPaymentPayload {
  amount: number;
  payment_method: "CASH" | "CARD" | "TRANSFER" | "CHECK";
  reference?: string;
  notes?: string;
  installment_id?: number;
}

export interface BackendSaleCreditPaymentResult {
  payment: {
    id: number;
    payment_date: string;
    amount: number;
    payment_method: string;
    reference: string | null;
    notes: string | null;
  };
  credit: {
    id: number;
    outstanding_balance: number;
    status: string;
  };
  message: string;
}

export interface BackendSaleCreditActiveItem {
  id: number;
  sale_folio: string;
  client_id: number | null;
  client_name: string;
  client_phone: string | null;
  product_name: string;
  product_code: string | null;
  purchase_date: string;
  initial_cost: number;
  total_paid: number;
  outstanding_balance: number;
  next_due_date: string | null;
  next_payment_amount: number;
  next_payment_base: number;
  next_payment_iva: number;
  status: string;
  total_installments: number;
  paid_installments: number;
}
