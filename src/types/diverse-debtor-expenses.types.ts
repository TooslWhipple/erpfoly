export type DiverseDebtorExpenseStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export type DiverseDebtorInstallmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface DiverseDebtorSimple {
  id: number;
  employeeNumber: string;
  fullName: string;
  rfc?: string | null;
  clabe?: string | null;
  branchName?: string | null;
}

export interface DiverseDebtorExpenseInstallment {
  id: number;
  installmentNumber: number;
  totalInstallments: number;
  cutOffDate: string; // YYYY-MM-DD
  amount: number;
  status: DiverseDebtorInstallmentStatus;
  confirmedAt?: string | null;
  confirmedBy?: string | null;
  notes?: string | null;
}

export interface DiverseDebtorExpense {
  id: number;
  folio: string;
  date: string;
  amount: number;
  description: string;
  installmentsCount: number;
  installmentAmount: number;
  remainingAmount: number;
  status: DiverseDebtorExpenseStatus;
  evidenceUrl?: string | null;
  evidenceFileName?: string | null;
  createdAt: string;
  debtor: DiverseDebtorSimple;
  creator?: {
    id: number;
    fullName: string;
  } | null;
  progress: {
    confirmedCount: number;
    totalCount: number;
    percentage: number;
  };
  installments?: DiverseDebtorExpenseInstallment[];
}

export interface DiscountsReportRecord {
  installmentId: number;
  expenseId: number;
  folio: string;
  cutOffDate: string;
  installmentNumber: number;
  totalInstallments: number;
  installmentLabel: string;
  amount: number;
  status: DiverseDebtorInstallmentStatus;
  confirmedAt?: string | null;
  confirmedBy?: string | null;
  notes?: string | null;
  expenseDescription: string;
  expenseDate: string;
  expenseTotalAmount: number;
  expenseRemainingAmount: number;
  evidenceUrl?: string | null;
  evidenceFileName?: string | null;
  debtor: DiverseDebtorSimple;
}

export interface DiscountsReportSummary {
  totalDiscounts: number;
  totalConfirmed: number;
  totalPending: number;
  debtorsCount: number;
  recordsCount: number;
}

export interface DiscountsReportResponse {
  cutOffDate: string;
  summary: DiscountsReportSummary;
  records: DiscountsReportRecord[];
}

export interface CreateDiverseDebtorExpensePayload {
  diverseDebtorId: number;
  date: string;
  amount: number;
  description: string;
  installmentsCount: number;
  notes?: string;
  file?: File;
}

