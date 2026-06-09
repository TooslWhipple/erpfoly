import { get, post } from "@/lib/axios";
import type { ApiResult, PaginatedRowsResponse } from "@/lib/axios";

export interface SaleCreditInstallment {
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

export interface SaleCreditPayment {
  id: number;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference: string | null;
  notes: string | null;
}

export interface SaleCreditDetailResponse {
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
  installments: SaleCreditInstallment[];
  payments: SaleCreditPayment[];
  summary: {
    subtotal: number;
    iva: number;
    total: number;
  };
}

export interface SaleCreditSummaryResponse {
  credit_id: number;
  sale_id: number;
  financed_amount: number;
  down_payment_amount: number;
  outstanding_balance: number;
  total_paid: number;
  total_installments_amount: number;
  paid_installments_amount: number;
  remaining_installments_amount: number;
  term_months: number;
  installment_amount: number;
  status: string;
  summary: {
    subtotal: number;
    iva: number;
    total: number;
  };
}

export interface SaleCreditActiveItem {
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

export interface SaleCreditPaymentPayload {
  amount: number;
  payment_method: "CASH" | "CARD" | "TRANSFER" | "CHECK";
  reference?: string;
  notes?: string;
  installment_id?: number;
}

export interface SaleCreditPaymentResult {
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

export async function getActiveSaleCredits(
  clientId: number,
  page = 1,
  limit = 50,
): Promise<ApiResult<{ rows: SaleCreditActiveItem[]; total: number; page: number; limit: number; totalPages: number }>> {
  return get(buildSaleCreditUrl({ client_id: clientId, page, limit }));
}

export async function getSaleCreditDetail(
  creditId: number,
): Promise<ApiResult<SaleCreditDetailResponse>> {
  return get<SaleCreditDetailResponse>(`/sale-credits/${creditId}/detail`);
}

export async function getSaleCreditSummary(
  creditId: number,
): Promise<ApiResult<SaleCreditSummaryResponse>> {
  return get<SaleCreditSummaryResponse>(`/sale-credits/${creditId}/summary`);
}

export async function registerSaleCreditPayment(
  creditId: number,
  payload: SaleCreditPaymentPayload,
): Promise<ApiResult<SaleCreditPaymentResult>> {
  return post<SaleCreditPaymentResult>(`/sale-credits/${creditId}/payments`, payload);
}

function buildSaleCreditUrl(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    searchParams.set(key, String(value));
  }
  const query = searchParams.toString();
  return query ? `/sale-credits/active?${query}` : "/sale-credits/active";
}
