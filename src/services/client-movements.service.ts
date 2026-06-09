import { get } from "@/lib/axios";
import type { ApiResult, PaginatedRowsResponse } from "@/lib/axios";

export type MovementType = "payment" | "purchase";

export interface ClientMovementItem {
  id: number;
  type: MovementType;
  description: string;
  invoice: string;
  reference: string;
  date: string;
  amount: number;
  payment_method?: string;
  notes?: string | null;
  purchase_type?: string;
  has_credit?: boolean;
  credit_status?: string | null;
  sale_credit_id?: number;
  installment_number?: number | null;
}

export type ClientMovementsResponse = PaginatedRowsResponse<ClientMovementItem>;

export async function getClientMovements(
  clientId: number,
  params?: { page?: number; limit?: number; type?: MovementType },
): Promise<ApiResult<ClientMovementsResponse>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.type) query.set("type", params.type);

  const qs = query.toString();
  const url = qs
    ? `/sale-credits/client/${clientId}/movements?${qs}`
    : `/sale-credits/client/${clientId}/movements`;

  return get<ClientMovementsResponse>(url);
}

export async function getClientPayments(
  clientId: number,
  params?: { page?: number; limit?: number },
): Promise<ApiResult<ClientMovementsResponse>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const qs = query.toString();
  const url = qs
    ? `/sale-credits/client/${clientId}/payments?${qs}`
    : `/sale-credits/client/${clientId}/payments`;

  return get<ClientMovementsResponse>(url);
}

export async function getClientPurchases(
  clientId: number,
  params?: { page?: number; limit?: number },
): Promise<ApiResult<ClientMovementsResponse>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const qs = query.toString();
  const url = qs
    ? `/sale-credits/client/${clientId}/purchases?${qs}`
    : `/sale-credits/client/${clientId}/purchases`;

  return get<ClientMovementsResponse>(url);
}
