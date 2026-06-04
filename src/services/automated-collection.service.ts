import { del, get, patch, post } from "@/lib/axios";
import type { ApiResult, ApiSuccessPayload } from "@/lib/axios";

const BASE = "/automated-collections";

export interface AutomatedCollectionRule {
  id: number;
  name: string;
  status: boolean;
  condition_type: { id: number; code: string; name: string };
  comparison_operator: { id: number; code: string; symbol: string; name: string };
  time_period: {
    id: number;
    quantity: number;
    unit: { id: number; code: string; name: string };
  };
  message: { id: number; name: string };
  message_type: { id: number; code: string; name: string };
}

export interface AutomatedCollectionCatalogs {
  conditionTypes: { id: number; code: string; name: string }[];
  comparisonOperators: { id: number; code: string; symbol: string; name: string }[];
  timePeriods: {
    id: number;
    quantity: number;
    unit: { id: number; code: string; name: string };
  }[];
  messages: { id: number; name: string }[];
  messageTypes: { id: number; code: string; name: string }[];
}

export interface CreateAutomatedCollectionPayload {
  name: string;
  message_id: number;
  message_type_id: number;
  condition_type_id: number;
  comparison_operator_id: number;
  time_period_id: number;
  status?: boolean;
}

export interface UpdateAutomatedCollectionPayload {
  name?: string;
  message_id?: number;
  message_type_id?: number;
  condition_type_id?: number;
  comparison_operator_id?: number;
  time_period_id?: number;
  status?: boolean;
}

interface ListResponse {
  data: AutomatedCollectionRule[];
  total: number;
}

export async function getAutomatedCollectionRules(): Promise<
  ApiResult<ListResponse>
> {
  return get<ListResponse>(BASE);
}

export async function getAutomatedCollectionCatalogs(): Promise<
  ApiResult<AutomatedCollectionCatalogs>
> {
  return get<AutomatedCollectionCatalogs>(`${BASE}/catalogs`);
}

export async function createAutomatedCollectionRule(
  payload: CreateAutomatedCollectionPayload
): Promise<ApiResult<AutomatedCollectionRule>> {
  return post<AutomatedCollectionRule>(BASE, payload);
}

export async function updateAutomatedCollectionRule(
  id: number,
  payload: UpdateAutomatedCollectionPayload
): Promise<ApiResult<AutomatedCollectionRule>> {
  return patch<AutomatedCollectionRule>(`${BASE}/${id}`, payload);
}

export async function deleteAutomatedCollectionRule(
  id: number
): Promise<ApiResult<ApiSuccessPayload>> {
  return del<ApiSuccessPayload>(`${BASE}/${id}`);
}

export type AutomatedCollectionMessageDeliveryStatus =
  | "SUCCESS"
  | "FAILED"
  | "PENDING";

export interface AutomatedCollectionMessageLogItem {
  id: number;
  sentAt: string;
  phone: string;
  clientName: string;
  status: AutomatedCollectionMessageDeliveryStatus;
}

export interface AutomatedCollectionMessageHistoryResponse {
  items: AutomatedCollectionMessageLogItem[];
  page: number;
  limit: number;
  total: number;
  messagesSentLastMonth: number;
}

export interface ListAutomatedCollectionMessageHistoryParams {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}

export async function getAutomatedCollectionMessageHistory(
  ruleId: number,
  params?: ListAutomatedCollectionMessageHistoryParams
): Promise<ApiResult<AutomatedCollectionMessageHistoryResponse>> {
  const searchParams = new URLSearchParams();
  if (params?.page != null) searchParams.set("page", String(params.page));
  if (params?.limit != null) searchParams.set("limit", String(params.limit));
  if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom);
  if (params?.dateTo) searchParams.set("dateTo", params.dateTo);
  const query = searchParams.toString();
  const url = query
    ? `${BASE}/${ruleId}/message-history?${query}`
    : `${BASE}/${ruleId}/message-history`;
  return get<AutomatedCollectionMessageHistoryResponse>(url);
}
