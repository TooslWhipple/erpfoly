export type CashRegisterStatus = "ACTIVE" | "INACTIVE";

export interface CashRegisterListItem {
  id: number;
  name: string;
  branchId: number;
  branchName: string;
  limit: number;
  status: CashRegisterStatus;
  userId: number | null;
  assignedUserName: string | null;
  rememberDevice: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CashRegisterCatalogItem {
  id: number;
  name: string;
  branchId: number;
  branchName: string;
  userId: number | null;
}

export interface GetCashRegistersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CashRegisterStatus;
}

export interface CreateCashRegisterPayload {
  name: string;
  branch_id: number;
  limit: number;
}

export interface UpdateCashRegisterPayload {
  name?: string;
  branch_id?: number;
  limit?: number;
  status?: CashRegisterStatus;
}

export interface AssignCashRegisterCashierPayload {
  user_id: number | null;
}
