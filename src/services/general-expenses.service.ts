import { get, post, patch, type ApiResult } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type { PaginatedListParams } from "@/hooks/usePaginatedList";
import type {
  ApportionmentPreview,
  ApportionmentType,
  CreateExpensePaymentPayload,
  CreateGeneralExpensePayload,
  GeneralExpenseCatalogOption,
  GeneralExpenseListItem,
  GeneralExpenseSummary,
  UnassignedInvoice,
  UpdateGeneralExpensePayload,
} from "@/types/general-expenses.types";

const BASE = "/internal-payables";

const APPORTIONMENT_TYPE_TO_API: Record<ApportionmentType, string> = {
  sales_participation: "SALES_PARTICIPATION",
  credit_card_sales: "CREDIT_CARD_SALES",
  cash_sales: "CASH_SALES",
  free: "FREE",
};

export type GetGeneralExpensesResponse = {
  rows: GeneralExpenseListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

function toApiPayload(payload: CreateGeneralExpensePayload) {
  return {
    assignToSupplier: payload.assignToSupplier,
    supplierId: payload.assignToSupplier
      ? Number(payload.supplierId)
      : undefined,
    detail: payload.assignToSupplier ? undefined : payload.detail,
    dueDate: payload.dueDate,
    categoryId: Number(payload.categoryId),
    isLocalPurchase: payload.isLocalPurchase,
    responsibleUserId: payload.responsibleId
      ? Number(payload.responsibleId)
      : undefined,
    description: payload.description || undefined,
    amount: payload.amount,
    requiresInvoice: payload.requiresInvoice,
    payableInvoiceIds: payload.requiresInvoice
      ? payload.payableInvoiceIds.map(Number)
      : [],
    apportionEnabled: payload.apportionEnabled,
    apportionmentType: payload.apportionEnabled
      ? APPORTIONMENT_TYPE_TO_API[payload.apportionmentType]
      : undefined,
    singleBranchId:
      !payload.apportionEnabled && payload.singleBranchId
        ? Number(payload.singleBranchId)
        : undefined,
    branchShares:
      payload.apportionEnabled && payload.apportionmentType === "free"
        ? payload.branchShares.map((share) => ({
            branchId: Number(share.branchId),
            percentage: share.percentage,
          }))
        : undefined,
  };
}

export async function getGeneralExpenses(
  params: PaginatedListParams,
): Promise<ApiResult<GetGeneralExpensesResponse>> {
  return get<GetGeneralExpensesResponse>(buildListUrl(BASE, params));
}

export async function getGeneralExpensesSummary(): Promise<
  ApiResult<GeneralExpenseSummary>
> {
  return get<GeneralExpenseSummary>(`${BASE}/summary`);
}

export async function getGeneralExpenseById(
  id: string,
): Promise<ApiResult<GeneralExpenseListItem>> {
  return get<GeneralExpenseListItem>(`${BASE}/${id}`);
}

export async function getUnassignedInvoices(
  supplierId?: string | null,
): Promise<ApiResult<UnassignedInvoice[]>> {
  const url = buildListUrl(`${BASE}/available-invoices`, {
    supplierId: supplierId ? Number(supplierId) : undefined,
  });
  return get<UnassignedInvoice[]>(url);
}

export async function getExpenseCategories(): Promise<
  ApiResult<GeneralExpenseCatalogOption[]>
> {
  return get<GeneralExpenseCatalogOption[]>("/internal-payable-categories");
}

export async function getApportionmentPreview(
  type: ApportionmentType,
  amount: number,
): Promise<ApiResult<ApportionmentPreview>> {
  return get<ApportionmentPreview>(
    buildListUrl(`${BASE}/apportionment-preview`, {
      type: APPORTIONMENT_TYPE_TO_API[type],
      amount,
    }),
  );
}

export async function createGeneralExpense(
  payload: CreateGeneralExpensePayload,
): Promise<ApiResult<GeneralExpenseListItem>> {
  return post<GeneralExpenseListItem>(BASE, toApiPayload(payload));
}

export async function updateGeneralExpense(
  payload: UpdateGeneralExpensePayload,
): Promise<ApiResult<GeneralExpenseListItem>> {
  const { id, ...rest } = payload;
  return patch<GeneralExpenseListItem>(
    `${BASE}/${id}`,
    toApiPayload({
      assignToSupplier: rest.assignToSupplier ?? false,
      supplierId: rest.supplierId ?? null,
      detail: rest.detail,
      dueDate: rest.dueDate ?? "",
      categoryId: rest.categoryId ?? "",
      isLocalPurchase: rest.isLocalPurchase ?? false,
      responsibleId: rest.responsibleId ?? null,
      description: rest.description ?? "",
      amount: rest.amount ?? 0,
      requiresInvoice: rest.requiresInvoice ?? false,
      payableInvoiceIds: rest.payableInvoiceIds ?? [],
      apportionEnabled: rest.apportionEnabled ?? false,
      apportionmentType: rest.apportionmentType ?? "sales_participation",
      branchShares: rest.branchShares ?? [],
      singleBranchId: rest.singleBranchId ?? null,
    }),
  );
}

export async function createExpenseFromUnassignedInvoice(
  invoiceId: string,
): Promise<ApiResult<GeneralExpenseListItem>> {
  return post<GeneralExpenseListItem>(`${BASE}/from-invoice`, {
    payableInvoiceId: Number(invoiceId),
  });
}

export async function createExpensePayment(
  expenseId: string,
  payload: CreateExpensePaymentPayload,
): Promise<ApiResult<GeneralExpenseListItem>> {
  return post<GeneralExpenseListItem>(`${BASE}/${expenseId}/payments`, payload);
}

export async function uploadExpensePaymentReceipt(
  expenseId: string,
  paymentId: string,
  file: File,
): Promise<ApiResult<GeneralExpenseListItem>> {
  const formData = new FormData();
  formData.append("file", file);
  return post<GeneralExpenseListItem>(
    `${BASE}/${expenseId}/payments/${paymentId}/receipt`,
    formData,
    {
      transformRequest: (data, headers) => {
        if (data instanceof FormData && headers) {
          delete headers["Content-Type"];
        }
        return data;
      },
    },
  );
}
