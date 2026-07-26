import { get, patch, post, del, type ApiResult } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  AddCosteoExpensePayload,
  AddCosteoInvoicePayload,
  CosteoAvailableInvoice,
  CosteoDetail,
  GetCosteosParams,
  GetCosteosResponse,
  SaveCosteoDetailPayload,
} from "@/types/costeos.types";

const COSTEO_BASE = "/costeos";

function mapListFilterToStatus(
  filter: GetCosteosParams["filter"],
): GetCosteosParams["status"] | undefined {
  switch (filter) {
    case "captured":
      return "captured";
    case "received":
      return "received";
    case "ordered":
      return "ordered";
    case "all":
    default:
      return undefined;
  }
}

export async function getCosteos(
  params: GetCosteosParams = {},
): Promise<ApiResult<GetCosteosResponse>> {
  const status = params.status ?? mapListFilterToStatus(params.filter);
  const queryParams: GetCosteosParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    ...(params.search ? { search: params.search } : {}),
    ...(status ? { status } : {}),
    ...(params.supplier_id ? { supplier_id: params.supplier_id } : {}),
    ...(params.branch_id ? { branch_id: params.branch_id } : {}),
    ...(params.date_from ? { date_from: params.date_from } : {}),
    ...(params.date_to ? { date_to: params.date_to } : {}),
  };

  return get<GetCosteosResponse>(buildListUrl(COSTEO_BASE, queryParams));
}

export async function getCosteoById(
  id: number,
): Promise<ApiResult<CosteoDetail>> {
  return get<CosteoDetail>(`${COSTEO_BASE}/${id}`);
}

export async function saveCosteoDetail(
  id: number,
  payload: SaveCosteoDetailPayload,
): Promise<ApiResult<CosteoDetail>> {
  return patch<CosteoDetail>(`${COSTEO_BASE}/${id}`, payload);
}

export async function deleteCosteo(id: number): Promise<ApiResult<unknown>> {
  return del(`${COSTEO_BASE}/${id}`);
}

export async function addCosteoExpense(
  costeoId: number,
  payload: AddCosteoExpensePayload,
): Promise<ApiResult<CosteoDetail>> {
  return post<CosteoDetail>(`${COSTEO_BASE}/${costeoId}/expenses`, payload);
}

export async function removeCosteoExpense(
  costeoId: number,
  expenseId: number,
): Promise<ApiResult<CosteoDetail>> {
  return del<CosteoDetail>(`${COSTEO_BASE}/${costeoId}/expenses/${expenseId}`);
}

export async function getAvailableInvoices(
  costeoId: number,
): Promise<ApiResult<CosteoAvailableInvoice[]>> {
  return get<CosteoAvailableInvoice[]>(
    `${COSTEO_BASE}/${costeoId}/invoices/available`,
  );
}

export async function addCosteoInvoices(
  costeoId: number,
  payload: AddCosteoInvoicePayload,
): Promise<ApiResult<CosteoDetail>> {
  return post<CosteoDetail>(
    `${COSTEO_BASE}/${costeoId}/invoices`,
    payload,
  );
}
