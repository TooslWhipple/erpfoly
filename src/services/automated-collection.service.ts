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
