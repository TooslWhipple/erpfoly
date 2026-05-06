import { get, type ApiResult, type PaginatedRowsResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";

const DAMAGED_PRODUCTS_BASE = "/damaged-products";

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
