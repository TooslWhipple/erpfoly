export type ClientPaymentMethod = "cash" | "card";

export interface PendingInstallment {
  id: string;
  installmentNumber: number;
  totalInstallments: number;
  dueDate: string;
  /** Fecha de vencimiento sin formatear (ISO), para ordenar por fecha real. */
  dueDateRaw: string;
  overdueAmount: number;
  totalAmount: number;
}

export interface ClientCreditAccount {
  id: string;
  productName: string;
  purchaseDate: string;
  purchaseDateLabel: string;
  initialCost: number;
  totalPaid: number;
  remaining: number;
  paymentDueDate: string;
  highlightPaymentDueDate: boolean;
  nextPaymentAmount: number;
  nextPaymentBreakdown?: string;
  nextPaymentOverdue: number;
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
  creditsAffectedCount: number;
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
  overdue_amount: number;
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
  next_payment_overdue: number;
  status: string;
  total_installments: number;
  paid_installments: number;
}
