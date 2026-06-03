import { post, get, unwrapOrThrow, type ApiResult } from "@/lib/axios";

export interface CashRegisterSummary {
  id: number;
  name: string;
  status: "OPEN" | "CLOSED";
}

export interface OpenCashRegisterPayload {
  opening_balance: number;
  exchange_rate: number;
  device_fingerprint?: string;
}

export interface CashRegisterSession {
  id: number;
  cash_register_id: number;
  opened_by: number;
  opening_balance: number;
  exchange_rate: number;
  opened_at: string;
  device_fingerprint?: string;
}

export async function getUserAssignedCashRegister(): Promise<CashRegisterSummary | null> {
  const result = await get<CashRegisterSummary | null>("/cash-registers/assigned-to-user");
  return unwrapOrThrow(result);
}

export async function openCashRegister(
  payload: OpenCashRegisterPayload
): Promise<CashRegisterSession> {
  const result = await post<CashRegisterSession>(
    "/cash-register-sessions/open",
    payload
  );
  return unwrapOrThrow(result);
}
