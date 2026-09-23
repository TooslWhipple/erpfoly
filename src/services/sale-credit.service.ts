import axios from "axios";
import { api, get, post } from "@/lib/axios";
import type { ApiResult, AxiosConfigWithSkipToast } from "@/lib/axios";

export interface SaleCreditInstallment {
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

export interface SaleCreditPayment {
  id: number;
  payment_date: string;
  amount: number;
  principal_amount: number;
  late_fee_amount: number;
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
  next_payment_overdue: number;
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
    principal_amount: number;
    late_fee_amount: number;
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

export interface CascadePaymentPayload {
  amount: number;
  payment_method: "CASH" | "CARD" | "TRANSFER" | "CHECK";
  reference?: string;
  notes?: string;
  credit_order?: number[];
  payment_terminal_id?: number;
}

export interface CascadePaymentInstallmentResult {
  id: number;
  installment_number: number;
  amount_applied: number;
  principal_applied: number;
  late_fee_applied: number;
  status: string;
}

export interface CascadePaymentCreditResult {
  credit_id: number;
  payment_id: number;
  amount_applied: number;
  principal_applied: number;
  late_fee_applied: number;
  outstanding_balance: number;
  status: string;
  installments: CascadePaymentInstallmentResult[];
}

export interface CascadePaymentResult {
  amount: number;
  amount_applied: number;
  principal_applied: number;
  late_fee_applied: number;
  credits: CascadePaymentCreditResult[];
  message: string;
  receipt?: { id: number; folio: string } | null;
}

export interface ClientPaymentReceiptDetail {
  id: number;
  folio: string;
  totalAmount: number;
  dateLabel: string;
  clientName: string;
  clientPhone: string;
  paidInstallments: number;
  totalInstallments: number;
  creditsAffectedCount: number;
  allocations: { label: string; amount: number }[];
  payment_ids: number[];
}

export async function registerCascadePayment(
  clientId: number,
  payload: CascadePaymentPayload,
): Promise<ApiResult<CascadePaymentResult>> {
  return post<CascadePaymentResult>(`/sale-credits/client/${clientId}/cascade-payment`, payload);
}

async function blobFromPdfResponse(data: unknown, fallbackMessage: string): Promise<Blob> {
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

export async function getClientPaymentReceipt(
  clientId: number,
  receiptId: number,
): Promise<ApiResult<ClientPaymentReceiptDetail>> {
  return get<ClientPaymentReceiptDetail>(
    `/sale-credits/client/${clientId}/receipts/${receiptId}`,
  );
}

export async function downloadClientPaymentReceiptById(
  clientId: number,
  receiptId: number,
): Promise<Blob> {
  const response = await api.get(
    `/sale-credits/client/${clientId}/receipts/${receiptId}/pdf`,
    {
      responseType: "blob",
      skipGlobalErrorToast: true,
    } as AxiosConfigWithSkipToast,
  );
  return blobFromPdfResponse(response.data, "No se pudo descargar el comprobante");
}

export async function downloadClientPaymentReceiptPdf(
  clientId: number,
  paymentIds: number[],
): Promise<Blob> {
  if (paymentIds.length === 0) {
    throw new Error("No hay abonos para generar el comprobante");
  }

  try {
    const response = await api.get(
      `/sale-credits/client/${clientId}/payments/receipt`,
      {
        params: { paymentIds: paymentIds.join(",") },
        responseType: "blob",
        skipGlobalErrorToast: true,
      } as AxiosConfigWithSkipToast,
    );
    return blobFromPdfResponse(
      response.data,
      "No se pudo generar el comprobante",
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      return blobFromPdfResponse(
        error.response.data,
        "No se pudo generar el comprobante",
      );
    }
    throw error instanceof Error
      ? error
      : new Error("No se pudo generar el comprobante");
  }
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
