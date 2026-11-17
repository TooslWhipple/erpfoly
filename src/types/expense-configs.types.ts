export interface PettyCashBranchConfig {
  branchId: number;
  branchName: string;
  balance: number;
  maxBalance: number | null;
  updatedAt: string | null;
}

export interface UpdatePettyCashConfigPayload {
  maxBalance: number | null;
}

export interface ExpenseRequestConfig {
  id: number;
  verificationDeadlineDays: number;
  updatedAt: string | null;
}

export interface UpdateExpenseRequestConfigPayload {
  verificationDeadlineDays: number;
}
