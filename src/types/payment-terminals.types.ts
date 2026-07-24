export type PaymentTerminalStatus = "ACTIVE" | "INACTIVE";

export interface PaymentTerminalListItem {
  id: number;
  branchId: number;
  branchName: string;
  name: string;
  bank: string;
  serialNumber: string;
  status: PaymentTerminalStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface PaymentTerminalCatalogItem {
  id: number;
  name: string;
  bank: string;
}

export interface GetPaymentTerminalsParams {
  page?: number;
  limit?: number;
  search?: string;
  branch_id?: number;
  status?: PaymentTerminalStatus;
}

export interface CreatePaymentTerminalPayload {
  branch_id: number;
  name: string;
  bank: string;
  serial_number: string;
}

export interface UpdatePaymentTerminalPayload {
  name?: string;
  bank?: string;
  serial_number?: string;
  status?: PaymentTerminalStatus;
}
