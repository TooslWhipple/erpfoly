import { get, post, patch } from "@/lib/axios";
import type { ApiResult, ApiSuccessPayload, PaginatedResponse } from "@/lib/axios";
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

export interface SupplierDetail extends SupplierListItem {
  website: string | null;
  observations: string | null;
  contacts: SupplierContactItem[];
  creditData: SupplierCreditDataItem;
  bankAccounts: SupplierBankAccountItem[];
  promotions: SupplierPromotionItem[];
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

export type GetSuppliersResponse = PaginatedResponse<SupplierListItem>;

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

export async function getSuppliersCatalog(): Promise<
  ApiResult<SupplierCatalogItem[]>
> {
  return get<SupplierCatalogItem[]>(`${SUPPLIERS_BASE}/catalog`);
}
