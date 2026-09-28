import axios from "axios";
import { api, post, get, unwrapOrThrow } from "@/lib/axios";
import type { AxiosConfigWithSkipToast } from "@/lib/axios";
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
  branch_id: number;
  session_id?: number;
  status: "OPEN" | "CLOSED";
  opening_balance?: number;
  exchange_rate?: number;
  current_cash?: number;
  limit: number;
}

export async function getSessionSummary(): Promise<CashRegisterSummary> {
  const result = await get<CashRegisterSummary>("/cash-register-sessions/summary", {
    skipGlobalErrorToast: true,
  });
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

export interface AssignedCashRegisterClosingItem {
  id: number;
  closing_type: string;
  closing_type_label: string;
  total_expected: number;
  total_counted: number;
  difference: number;
  initial_fund: number;
  cash: number;
  credit_card: number;
  cash_deposits: number;
  withdrawals_total: number;
  shortage_or_surplus: number;
  created_at: string;
  created_by_name: string | null;
  session_id: number;
  session_opened_at: string;
  session_closed_at: string | null;
  cash_register_id: number;
  cash_register_name: string;
  can_print_ticket: boolean;
}

export interface AssignedCashRegisterClosingsResponse {
  rows: AssignedCashRegisterClosingItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  cash_register_id: number;
  cash_register_name: string;
}

export interface FetchAssignedClosingsParams {
  page?: number;
  limit?: number;
}

export async function fetchAssignedCashRegisterClosings(
  params: FetchAssignedClosingsParams = {},
): Promise<AssignedCashRegisterClosingsResponse> {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 10));

  const result = await get<AssignedCashRegisterClosingsResponse>(
    `/cash-register-closings/for-assigned-register?${query.toString()}`,
  );
  return unwrapOrThrow(result);
}

async function blobFromPdfResponse(
  data: unknown,
  fallbackMessage: string,
): Promise<Blob> {
  if (data instanceof Blob) {
    const looksJson =
      data.type.includes("application/json") || data.type.includes("text/plain");
    if (looksJson) {
      const text = await data.text();
      try {
        const json = JSON.parse(text) as {
          error?: { message?: string };
          message?: string;
        };
        throw new Error(json.error?.message ?? json.message ?? fallbackMessage);
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new Error(fallbackMessage);
        }
        throw error;
      }
    }
    return data.type.includes("pdf")
      ? data
      : new Blob([data], { type: "application/pdf" });
  }

  return new Blob([data as BlobPart], { type: "application/pdf" });
}

export async function fetchFinalCutTicketPdf(
  closingId: number,
  widthMm = 100,
): Promise<Blob> {
  try {
    const response = await api.get(
      `/cash-register-closings/${closingId}/ticket/pdf`,
      {
        params: { widthMm },
        responseType: "blob",
        skipGlobalErrorToast: true,
      } as AxiosConfigWithSkipToast,
    );
    return blobFromPdfResponse(
      response.data,
      "No se pudo generar el ticket de corte final",
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      return blobFromPdfResponse(
        error.response.data,
        "No se pudo generar el ticket de corte final",
      );
    }
    throw error instanceof Error
      ? error
      : new Error("No se pudo generar el ticket de corte final");
  }
}
