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
    branchGroupingId:
      payload.apportionEnabled &&
      payload.apportionmentType !== "free" &&
      payload.branchGroupingId
        ? Number(payload.branchGroupingId)
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

export async function getGeneralExpensesSummary(params?: {
  configuration?: string;
}): Promise<ApiResult<GeneralExpenseSummary>> {
  const url = params ? buildListUrl(`${BASE}/summary`, params) : `${BASE}/summary`;
  return get<GeneralExpenseSummary>(url);
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

export async function checkGeneralExpenseCfdiUuid(
  uuid: string,
  options?: { supplierId?: string | number; rfcEmisor?: string },
): Promise<ApiResult<{ available: boolean; reason?: string }>> {
  const url = buildListUrl(`${BASE}/check-cfdi-uuid`, {
    uuid,
    supplierId: options?.supplierId ? Number(options.supplierId) : undefined,
    rfcEmisor: options?.rfcEmisor || undefined,
  });
  return get<{ available: boolean; reason?: string }>(url);
}

export async function getExpenseCategories(params?: {
  configuration?: string;
}): Promise<ApiResult<GeneralExpenseCatalogOption[]>> {
  const url = params
    ? buildListUrl("/internal-payable-categories", params)
    : "/internal-payable-categories";
  const result = await get<any>(url);
  if (result.data) {
    const list = Array.isArray(result.data)
      ? result.data
      : (result.data.rows ?? result.data.data ?? []);
    return { ...result, data: list };
  }
  return result;
}

export async function getApportionmentPreview(
  type: ApportionmentType,
  amount: number,
  branchGroupingId?: number | null,
): Promise<ApiResult<ApportionmentPreview>> {
  return get<ApportionmentPreview>(
    buildListUrl(`${BASE}/apportionment-preview`, {
      type: APPORTIONMENT_TYPE_TO_API[type],
      amount,
      branchGroupingId: branchGroupingId ?? undefined,
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

export async function uploadExpenseEvidence(
  expenseId: string,
  file: File,
): Promise<ApiResult<GeneralExpenseListItem>> {
  const formData = new FormData();
  formData.append("file", file);
  return post<GeneralExpenseListItem>(
    `${BASE}/${expenseId}/evidence`,
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

export async function uploadExpenseVoucher(
  expenseId: string,
  voucher: {
    date: string;
    concept: string;
    amount: number;
    subtotal?: number;
    iva?: number;
    isDeductible: boolean;
    supplierName?: string;
    supplierRfc?: string;
    fiscalUuid?: string;
    concepts?: Array<{
      description: string;
      issuerSku?: string | null;
      quantity: number;
      unitPrice: number;
      amount: number;
    }>;
    xmlFile?: File | null;
    pdfFile?: File | null;
    imageFile?: File | null;
  },
): Promise<ApiResult<GeneralExpenseListItem>> {
  const formData = new FormData();
  formData.append("date", voucher.date);
  formData.append("concept", voucher.concept);
  formData.append("amount", String(voucher.amount));
  if (voucher.subtotal != null) formData.append("subtotal", String(voucher.subtotal));
  if (voucher.iva != null) formData.append("iva", String(voucher.iva));
  formData.append("isDeductible", String(voucher.isDeductible));
  if (voucher.supplierName) formData.append("supplierName", voucher.supplierName);
  if (voucher.supplierRfc) formData.append("supplierRfc", voucher.supplierRfc);
  if (voucher.fiscalUuid) formData.append("fiscalUuid", voucher.fiscalUuid);
  if (voucher.concepts?.length) {
    formData.append("concepts", JSON.stringify(voucher.concepts));
  }
  if (voucher.xmlFile) formData.append("xml", voucher.xmlFile);
  if (voucher.pdfFile) formData.append("pdf", voucher.pdfFile);
  if (voucher.imageFile) formData.append("image", voucher.imageFile);

  return post<GeneralExpenseListItem>(
    `${BASE}/${expenseId}/vouchers`,
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
