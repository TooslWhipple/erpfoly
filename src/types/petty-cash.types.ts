export type PettyCashMovementType = "FUNDING" | "EXPENSE" | "REFUND";

export interface PettyCashBranchOverview {
  branchId: number;
  branchName: string;
  pettyCashId: number | null;
  balance: number;
  maxBalance: number | null;
  updatedAt: string | null;
  pendingRequestsCount: number;
  pendingVerificationAmount: number;
  pendingReturnCount: number;
  pendingReturnAmount: number;
  openRegistersCount: number;
  totalOpenCash: number;
}

export interface PettyCashOpenRegister {
  sessionId: number;
  cashRegisterId: number;
  cashRegisterName: string;
  openedAt: string;
  currentCash: number;
}

export interface PettyCashMovementItem {
  id: number;
  type: PettyCashMovementType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  bank: string | null;
  checkNumber: string | null;
  cashMovementId: number | null;
  cashRegisterName: string | null;
  expenseRequestId: number | null;
  expenseRequestFolio: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface PettyCashMovementsResponse {
  branchId: number;
  branchName: string;
  balance: number;
  rows: PettyCashMovementItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FundPettyCashPayload {
  amount: number;
  bank: string;
  checkNumber: string;
  cashRegisterId?: number;
  notes?: string;
}

export interface FundPettyCashResponse {
  branchId: number;
  branchName: string;
  balance: number;
  cashMovementId: number;
  pettyCashMovementId: number;
}
