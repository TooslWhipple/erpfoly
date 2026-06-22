import { post, get, unwrapOrThrow } from "@/lib/axios";
import type { ClientSearchResult } from "@/components/CashRegister";
import type { CashMovementType, CashMovementPaymentForm } from "@/lib/cashMovement.constants";

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

export interface CashMovement {
  id: number;
  amount: number;
  movement_type: CashMovementType;
  payment_form?: CashMovementPaymentForm | null;
  payment_form_label?: string;
  reference_folio: string | null;
  created_at: string;
  created_by_name: string;
  client_name: string | null;
}

export interface WithdrawalPayload {
  amount: number;
  bank: string;
  check_number?: string;
}

export interface PaymentPayload {
  amount: number;
  client_id?: number;
  reference_folio?: string;
}

export interface DenominationItem {
  denomination_id: number;
  quantity: number;
}

export interface PartialCutPayload {
  denominations: DenominationItem[];
  total_counted: number;
}

export interface FinalCutPayload {
  total_counted: number;
  cash: number;
  credit_card: number;
  cash_deposits: number;
  initial_fund: number;
  shortage: number;
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

export async function getCurrentSession(): Promise<CashRegisterSession | null> {
  const result = await get<CashRegisterSession | null>("/cash-register-sessions/current");
  return unwrapOrThrow(result);
}

export interface CashRegisterSummary {
  cash_register_id: number;
  cash_register_name: string;
  session_id?: number;
  status: "OPEN" | "CLOSED";
  opening_balance?: number;
  exchange_rate?: number;
  current_cash?: number;
  limit: number;
}

export async function getSessionSummary(): Promise<CashRegisterSummary | null> {
  const result = await get<CashRegisterSummary | null>("/cash-register-sessions/summary");
  return unwrapOrThrow(result);
}

export async function createWithdrawal(
  payload: WithdrawalPayload
): Promise<CashMovement> {
  const result = await post<CashMovement>(
    "/cash-movements/withdrawal",
    payload
  );
  return unwrapOrThrow(result);
}

export async function createPayment(
  payload: PaymentPayload
): Promise<CashMovement> {
  const result = await post<CashMovement>(
    "/cash-movements/payment",
    payload
  );
  return unwrapOrThrow(result);
}

export async function getSessionHistory(): Promise<CashMovement[]> {
  const result = await get<CashMovement[]>("/cash-movements/session-history");
  return unwrapOrThrow(result);
}

interface CashRegisterClientSearchResponse {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  paymentStatus: "overdue" | "current";
  address: string;
}

export async function searchClientsForPayment(
  search: string,
): Promise<ClientSearchResult[]> {
  const trimmed = search.trim();
  if (!trimmed) return [];

  const params = new URLSearchParams({
    search: trimmed,
    limit: "20",
  });

  const result = await get<CashRegisterClientSearchResponse[]>(
    `/cash-registers/clients/search?${params.toString()}`,
  );
  const clients = unwrapOrThrow(result) ?? [];

  return clients.map((client) => ({
    id: client.id,
    fullName: client.fullName,
    phone: client.phone,
    email: client.email,
    paymentStatus: client.paymentStatus,
    address: client.address,
  }));
}

export async function createPartialCut(
  payload: PartialCutPayload
): Promise<CashRegisterClosing> {
  const result = await post<CashRegisterClosing>(
    "/cash-register-closings/partial-cut",
    payload
  );
  return unwrapOrThrow(result);
}

export async function createFinalCut(
  payload: FinalCutPayload
): Promise<CashRegisterClosing> {
  const result = await post<CashRegisterClosing>(
    "/cash-register-closings/final-cut",
    payload
  );
  return unwrapOrThrow(result);
}

export interface CashRegisterClosing {
  id: number;
  cash_register_session_id: number;
  closing_type: string;
  total_expected: number;
  total_counted: number;
  difference: number;
  created_at: string;
}
