import { get, post, type ApiResult, type PaginatedRowsResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";

const DAMAGED_PRODUCTS_BASE = "/damaged-products";
const PRODUCTS_BASE = "/products";

export interface DamagedProductBranchDto {
    id: number;
    name: string;
}

// ---------------------------------------------------------------------------
// Catalog (GET /damaged-products/catalog)
// ---------------------------------------------------------------------------

/**
 * Catalog row from GET /damaged-products/catalog (branches, damageOrigins, damageTypes, etc.).
 * `code` is optional.
 */
export interface DamagedProductCatalogItem {
    id: string | number;
    label: string;
    code?: string;
}

export interface DamagedProductsCatalogData {
    branches: DamagedProductCatalogItem[];
    damageOrigins: DamagedProductCatalogItem[];
    damageTypes: DamagedProductCatalogItem[];
    damageActions: DamagedProductCatalogItem[];
    dispositions: DamagedProductCatalogItem[];
    repairSuppliers: DamagedProductCatalogItem[];
    repairResponsibles?: DamagedProductCatalogItem[];
    solutions?: DamagedProductCatalogItem[];
}

/**
 * Row shape returned by GET /damaged-products (list).
 * Optional `id` is included when the backend exposes a record id for detail routes.
 */
export interface DamagedProductListApiRow {
    id?: number;
    productCode: string;
    branch: DamagedProductBranchDto;
    /** ISO 8601 string (from created_at). */
    registrationDate: string;
    productName: string;
    registeredByUser: string;
    damageType: string;
    status: string;
    /** Human-readable elapsed time in Spanish (e.g. "menos de un minuto", "2 días"). */
    elapsedSinceRegistration: string;
}

export type DamagedProductListItem = DamagedProductListApiRow & {
    /** Stable key for TableCrud when `id` is not provided by the API. */
    rowKey: string;
};

export interface GetDamagedProductsQueryParams {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    [key: string]: unknown;
}

function buildDamagedProductRowKey(row: DamagedProductListApiRow): string {
    if (row.id != null && Number.isFinite(row.id)) {
        return String(row.id);
    }
    return `${row.branch.id}-${row.registrationDate}-${row.productCode}`;
}

function normalizeDamagedProductRows(
    rows: DamagedProductListApiRow[]
): DamagedProductListItem[] {
    return rows.map((row) => ({
        ...row,
        rowKey: buildDamagedProductRowKey(row),
    }));
}

export async function getDamagedProducts(
    params: GetDamagedProductsQueryParams
): Promise<ApiResult<PaginatedRowsResponse<DamagedProductListItem>>> {
    const result = await get<PaginatedRowsResponse<DamagedProductListApiRow>>(
        buildListUrl(DAMAGED_PRODUCTS_BASE, params)
    );

    if (result.error || result.data === null) {
        return result as ApiResult<PaginatedRowsResponse<DamagedProductListItem>>;
    }

    const { rows, ...rest } = result.data;
    return {
        data: {
            ...rest,
            rows: normalizeDamagedProductRows(rows),
        },
        error: null,
    };
}

/**
 * GET /damaged-products/catalog — branches, damage origins/types/actions, dispositions, repair suppliers.
 */
export async function getDamagedProductsCatalog(): Promise<
    ApiResult<DamagedProductsCatalogData>
> {
    return get<DamagedProductsCatalogData>(`${DAMAGED_PRODUCTS_BASE}/catalog`);
}

export interface DamagedProductBranchOption {
    id: number;
    label: string;
}

/**
 * GET /damaged-products/branches-with-stock?productId=
 * Active branches where the product has existence > 0.
 */
export async function getDamagedProductBranchesWithStock(
    productId: number,
): Promise<ApiResult<DamagedProductBranchOption[]>> {
    return get<DamagedProductBranchOption[]>(
        `${DAMAGED_PRODUCTS_BASE}/branches-with-stock`,
        { params: { productId } },
    );
}

export const PRODUCT_SEARCH_DEFAULT_LIMIT = 100;

export interface ProductSearchItem {
    id: number;
    code: string;
    shortName: string;
    description: string;
    listCost: string;
    score: number;
}

export interface ProductSearchParams {
    q: string;
    limit?: number;
}

function normalizeProductSearchResponse(data: unknown): ProductSearchItem[] {
    if (Array.isArray(data)) {
        return data as ProductSearchItem[];
    }
    if (data != null && typeof data === "object" && "rows" in data && Array.isArray((data as { rows: unknown }).rows)) {
        return (data as { rows: ProductSearchItem[] }).rows;
    }
    return [];
}

export async function searchProducts(params: ProductSearchParams): Promise<ApiResult<ProductSearchItem[]>> {
    if (params.q.length < 2) {
        return { data: [], error: null };
    }

    const limit = params.limit ?? PRODUCT_SEARCH_DEFAULT_LIMIT;
    const result = await get<unknown>(`${PRODUCTS_BASE}/search`, {
        params: { q: params.q, limit },
    });

    if (result.error != null) {
        return { data: null, error: result.error };
    }

    return {
        data: normalizeProductSearchResponse(result.data),
        error: null
    };
}

export interface CreateDamagedProductPayload {
    productId: number;
    branchId: number;
    damageOriginId: number;
    damageTypeId: number;
    dispositionCode: string;
    damageDescription: string;
    serialNumber?: string;
    observations?: string;
    invoiceNumber?: string;
    status?: string;
    detectedDate?: string;
    quantity?: number;
    repairCost?: number;
    repairSupplierId?: number;
    assignedToId?: number;
    responsibleId?: number;
    solutionId?: number;
    endDate?: string;
    includeCost?: boolean;
    acceptanceLetterUrl?: string;
    auctionPrice?: number;
    listCost?: number;
    lastCost?: number;
}

export async function createDamagedProduct(
    payload: CreateDamagedProductPayload | FormData
): Promise<ApiResult<{ id: number; folio: string }>> {
    if (payload instanceof FormData) {
        return post<{ id: number; folio: string }>(DAMAGED_PRODUCTS_BASE, payload, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    }
    return post<{ id: number; folio: string }>(DAMAGED_PRODUCTS_BASE, payload);
}

export interface DamagedProductStats {
    totalItems: number;
    itemsCost: number;
    itemsValue: number;
    itemsChange: number;
    costChange: number;
    valueChange: number;
}

export async function getDamagedProductStats(): Promise<ApiResult<DamagedProductStats>> {
    return get<DamagedProductStats>(`${DAMAGED_PRODUCTS_BASE}/stats`);
}
