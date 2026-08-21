import { get, post, patch, type ApiResult, type PaginatedRowsResponse } from "@/lib/axios";
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
 */
export interface DamagedProductListApiRow {
    id: number;
    productCode: string;
    branch: DamagedProductBranchDto;
    /** ISO 8601 string (from created_at). */
    registrationDate: string;
    productName: string;
    registeredByUser: string;
    damageType: string;
    status: string;
    /** Disposition code of the folio (e.g. "RETURN_TO_SUPPLIER"). */
    dispositionCode: string;
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

export type RepairCostAssignee = "supplier" | "foly";

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
    repairCostAssignedTo?: RepairCostAssignee;
    repairSupplierId?: number;
    assignedToId?: number;
    responsibleId?: number;
    solutionId?: number;
    endDate?: string;
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

export interface DamagedProductProductDto {
    id: number;
    code: string;
    name: string;
}

/**
 * Full folio detail returned by GET /damaged-products/:id and
 * PATCH /damaged-products/:id.
 *
 * `assignedToId`, `responsibleId`, `solutionId`, `endDate`, `listCost` and
 * `lastCost` have no backing column in the database: the backend always
 * answers `null` for them.
 */
export interface DamagedProductDetail {
    id: number;
    folio: string;
    productId: number;
    product: DamagedProductProductDto;
    branchId: number;
    branch: DamagedProductBranchDto;
    damageOriginId: number;
    damageTypeId: number;
    dispositionCode: string;
    damageDescription: string;
    serialNumber: string | null;
    observations: string | null;
    invoiceNumber: string | null;
    quantity: number;
    status: string;
    detectedDate: string | null;
    repairCost: number | null;
    repairCostAssignedTo: RepairCostAssignee | null;
    repairSupplierId: number | null;
    /**
     * Ruta cruda del objeto en GCS. Es **estable entre lecturas**: úsala como
     * identidad del adjunto (memos, keys, comparaciones), nunca la URL.
     */
    acceptanceLetterPath: string | null;
    /**
     * URL firmada con 30 minutos de vigencia, **distinta en cada lectura**.
     * Se sirve con `Content-Disposition: attachment`, así que descarga el
     * archivo a disco: para mostrarlo embebido usa `acceptanceLetterPreviewUrl`.
     * No vale como identidad ni como valor a devolver en el `PATCH`.
     */
    acceptanceLetterUrl: string | null;
    /**
     * La misma carta firmada **sin** `Content-Disposition`, para previsualizarla
     * dentro del ERP (un PDF servido como `attachment` se descargaría en vez de
     * mostrarse). Mismas advertencias que la anterior: caduca y cambia en cada
     * lectura.
     */
    acceptanceLetterPreviewUrl: string | null;
    auctionPrice: number | null;
    endDate: null;
    assignedToId: null;
    responsibleId: null;
    solutionId: null;
    listCost: null;
    lastCost: null;
}

/**
 * GET /damaged-products/:id — full folio detail for the edit modal.
 */
export async function getDamagedProduct(
    id: number
): Promise<ApiResult<DamagedProductDetail>> {
    return get<DamagedProductDetail>(`${DAMAGED_PRODUCTS_BASE}/${id}`);
}

/**
 * Body accepted by PATCH /damaged-products/:id. The backend uses
 * `forbidNonWhitelisted`: any field outside this list answers 400.
 * `productId`, `branchId`, `quantity` and `status` are not editable.
 *
 * `acceptanceLetterUrl` is deliberately absent: the letter is replaced by
 * uploading the file itself (`acceptanceLetter`, multipart, same as on create)
 * and the column stores the GCS object path. Sending the signed URL back would
 * overwrite that path with a link that expires in 30 minutes.
 */
export interface UpdateDamagedProductPayload {
    dispositionCode?: string;
    damageOriginId?: number;
    damageTypeId?: number;
    damageDescription?: string;
    serialNumber?: string;
    observations?: string;
    invoiceNumber?: string;
    detectedDate?: string;
    repairCost?: number;
    repairCostAssignedTo?: RepairCostAssignee;
    repairSupplierId?: number;
    auctionPrice?: number;
}

/**
 * PATCH /damaged-products/:id — updates an existing folio.
 *
 * Pass a `FormData` (with an `acceptanceLetter` file part) to replace the
 * acceptance letter; the endpoint accepts multipart just like the create one.
 */
export async function updateDamagedProduct(
    id: number,
    payload: UpdateDamagedProductPayload | FormData
): Promise<ApiResult<DamagedProductDetail>> {
    if (payload instanceof FormData) {
        return patch<DamagedProductDetail>(`${DAMAGED_PRODUCTS_BASE}/${id}`, payload, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    }
    return patch<DamagedProductDetail>(`${DAMAGED_PRODUCTS_BASE}/${id}`, payload);
}

/** Statuses the folio can transition to from the ERP list. */
export type DamagedProductTransitionStatus = "pending" | "completed";

export interface UpdateDamagedProductStatusResult {
    id: number;
    folio: string;
    status: string;
}

/**
 * PATCH /damaged-products/:id/status — closes ("completed") or reopens ("pending") a folio.
 * Only `RETURN_TO_SUPPLIER` folios accept the transition; the backend answers 400 otherwise.
 */
export async function updateDamagedProductStatus(
    id: number,
    status: DamagedProductTransitionStatus
): Promise<ApiResult<UpdateDamagedProductStatusResult>> {
    return patch<UpdateDamagedProductStatusResult>(
        `${DAMAGED_PRODUCTS_BASE}/${id}/status`,
        { status }
    );
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
