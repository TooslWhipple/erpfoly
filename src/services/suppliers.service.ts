import { get, post, patch, unwrapOrThrow } from "@/lib/axios";
import type { ApiResult, ApiSuccessPayload, PaginatedRowsResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";

export type SupplierTypeApi = "national" | "foreign";
export type FreightTypeApi = "prepaid" | "collect";

export interface SupplierListItem {
  id: number;
  name: string;
  businessName: string | null;
  rfc: string | null;
  email: string | null;
  type: SupplierTypeApi | null;
  paymentTerm: number | null;
  freight: FreightTypeApi | null;
  accountingAccount?: string | null;
  accountingAccountName?: string | null;
}

export interface SupplierContactItem {
  id: number;
  jobTitleId: number | null;
  jobTitleName: string | null;
  name: string;
  phone: string | null;
}

export interface SupplierCreditDataItem {
  attention: string | null;
  jobTitleId: number | null;
  jobTitleName: string | null;
  phone: string | null;
}

export interface SupplierBankAccountItem {
  id: number;
  bank: string;
  city: string | null;
  branch: string | null;
  account: string;
}

export interface SupplierPromotionItem {
  id: number;
  description: string;
  percentage: number;
  startDate: string;
  endDate: string | null;
}

export type SupplierPortalStatus = "NONE" | "PENDING" | "ACTIVE";

export interface SupplierDetail extends SupplierListItem {
  website: string | null;
  observations: string | null;
  contacts: SupplierContactItem[];
  creditData: SupplierCreditDataItem;
  bankAccounts: SupplierBankAccountItem[];
  promotions: SupplierPromotionItem[];
  hasUser: boolean;
  portalStatus: SupplierPortalStatus;
  inviteUrl: string | null;
  inviteExpiresAt: string | null;
}

export interface ContactJobTitleOption {
  id: number;
  code: string;
  name: string;
}

export interface GetSuppliersParams {
  page: number;
  limit: number;
  search?: string;
}

export type GetSuppliersResponse = PaginatedRowsResponse<SupplierListItem>;

export interface CreateSupplierPayload {
  name: string;
  businessName: string;
  rfc: string;
  website?: string;
  email?: string;
  type: SupplierTypeApi;
  paymentTerm: number;
  freight: FreightTypeApi;
  observations?: string;
  accountingAccount?: string;
  contacts: Array<{
    id?: number;
    jobTitleId?: number | null;
    name: string;
    phone?: string;
  }>;
  creditData: {
    attention: string;
    jobTitleId?: number;
    phone?: string;
  };
  bankAccounts: Array<{
    id?: number;
    bank: string;
    city?: string;
    branch?: string;
    account: string;
  }>;
  promotionIds?: number[];
  newPromotions?: Array<{
    description: string;
    discountRate: number;
    startDate: string;
    endDate?: string;
  }>;
}

export type UpdateSupplierPayload = CreateSupplierPayload;

const SUPPLIERS_BASE = "/suppliers";
const CATALOG_BASE = "/catalog";

export async function getSuppliers(
  params: GetSuppliersParams
): Promise<ApiResult<GetSuppliersResponse>> {
  return get<GetSuppliersResponse>(buildListUrl(SUPPLIERS_BASE, params));
}

export const SUPPLIER_SEARCH_DEFAULT_LIMIT = 100;

/** Row shape returned by GET /suppliers/search */
export interface SupplierSearchItem {
  id: number;
  name: string;
  businessName?: string | null;
}

export interface SupplierSearchParams {
  q: string;
  limit?: number;
  page?: number;
}

export type SupplierSearchPage = PaginatedRowsResponse<SupplierSearchItem>;

function normalizeSupplierSearchPage(
  data: unknown,
  fallbackLimit: number,
): SupplierSearchPage | null {
  if (Array.isArray(data)) {
    const rows = data as SupplierSearchItem[];
    return {
      rows,
      total: rows.length,
      page: 1,
      limit: fallbackLimit,
      totalPages: 1,
    };
  }

  if (
    data != null &&
    typeof data === "object" &&
    "rows" in data &&
    Array.isArray((data as { rows: unknown }).rows)
  ) {
    const page = data as Partial<SupplierSearchPage> & {
      rows: SupplierSearchItem[];
    };
    const limit = page.limit ?? fallbackLimit;
    const total = page.total ?? page.rows.length;
    return {
      rows: page.rows,
      total,
      page: page.page ?? 1,
      limit,
      totalPages: page.totalPages ?? (Math.ceil(total / limit) || 1),
    };
  }

  return null;
}

export async function searchSuppliers(
  params: SupplierSearchParams,
): Promise<ApiResult<SupplierSearchPage>> {
  const limit = params.limit ?? SUPPLIER_SEARCH_DEFAULT_LIMIT;
  const page = params.page ?? 1;
  const result = await get<unknown>(`${SUPPLIERS_BASE}/search`, {
    params: { q: params.q.trim(), limit, page },
  });

  if (result.error != null) {
    return { data: null, error: result.error };
  }

  const normalized = normalizeSupplierSearchPage(result.data, limit);
  if (normalized == null) {
    return {
      data: null,
      error: { message: "No se pudieron cargar los proveedores" },
    };
  }

  return { data: normalized, error: null };
}

export async function getSupplierById(
  id: number
): Promise<ApiResult<SupplierDetail>> {
  return get<SupplierDetail>(`${SUPPLIERS_BASE}/${id}`);
}

export async function createSupplier(
  payload: CreateSupplierPayload
): Promise<ApiResult<ApiSuccessPayload>> {
  return post<ApiSuccessPayload>(SUPPLIERS_BASE, payload);
}

export async function updateSupplier(
  id: number,
  payload: UpdateSupplierPayload
): Promise<ApiResult<ApiSuccessPayload>> {
  return patch<ApiSuccessPayload>(`${SUPPLIERS_BASE}/${id}`, payload);
}

export async function inviteSupplier(
  id: number,
  force = false
): Promise<ApiResult<{ message: string; setPasswordUrl: string }>> {
  return post<{ message: string; setPasswordUrl: string }>(
    `${SUPPLIERS_BASE}/${id}/invite`,
    { force }
  );
}

export async function getContactJobTitles(): Promise<
  ApiResult<ContactJobTitleOption[]>
> {
  return get<ContactJobTitleOption[]>(`${CATALOG_BASE}/contact-job-titles`);
}

// ============================================================================
// CATALOG (GET /suppliers/catalog — Suppliers.Read)
// ============================================================================

export interface SupplierCatalogItem {
  id: number;
  name: string;
  businessName: string | null;
}

export async function getSuppliersCatalog(): Promise<SupplierCatalogItem[]> {
  return unwrapOrThrow(await get<SupplierCatalogItem[]>(`${SUPPLIERS_BASE}/catalog`));
}
