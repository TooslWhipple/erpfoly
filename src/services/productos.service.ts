import { get, patch, post, unwrapOrThrow, type ApiResult, type PaginatedRowsResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
    CreateProductImagePayload,
    CreateProductPackageItemPayload,
    CreateProductRequest,
    CreateProductResponse,
    GeneralDataFormState,
    PriceFormState,
    ProductBasePrice,
    ProductPromotionDraft,
    ProductSupplier,
    ProductBranch,
    ProductGalleryImage,
    ProductPackage,
    CostBasisForCalculation,
    ProductPreviewCodeResponse,
} from "@/types/productos.types";
import type { SavePromotionPayload } from "@/services/promociones.service";
import { DEFAULT_PRODUCT_BASE_PRICES } from "@/data/productos.mockData";

const PRODUCTS_BASE = "/products";

function mapProductPackagesToPackageItems(
    packages: ProductPackage[]
): CreateProductPackageItemPayload[] {
    return packages.map((pkg) => {
        if (pkg.type === "article") {
            const productId = Number(pkg.articleId);
            return {
                type: "PRODUCT",
                productId: Number.isFinite(productId) ? productId : null,
                serviceName: null,
                packagePrice: pkg.packagePrice,
                branchIds: [...pkg.branches],
            };
        }
        return {
            type: "SERVICE",
            productId: null,
            serviceName: (pkg.serviceName ?? "").trim() || null,
            packagePrice: pkg.packagePrice,
            branchIds: [...pkg.branches],
        };
    });
}

export function buildProductImagesPayloadFromGallery(
    galleryImages: ProductGalleryImage[]
): CreateProductImagePayload[] {
    let sortOrder = 0;

    const images: CreateProductImagePayload[] = [];
    for (const item of galleryImages) {
        if (item.file !== null) {
            continue;
        }
        const url = (item.previewUrl || item.imageUrl || "").trim();
        if (!/^https?:\/\//i.test(url)) {
            continue;
        }
        images.push({ imageUrl: url, sortOrder });
        sortOrder += 1;
    }
    return images;
}

export function collectNewGalleryFiles(galleryImages: ProductGalleryImage[]): File[] {
    return galleryImages.map((g) => g.file).filter((f): f is File => f !== null);
}

export function buildProductMultipartFormData(
    payload: CreateProductRequest,
    galleryFiles: File[]
): FormData {
    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));
    for (const file of galleryFiles) {
        formData.append("gallery", file);
    }
    return formData;
}

export function buildCreateProductRequest(
    input: {
        generalData: GeneralDataFormState;
        priceData: PriceFormState;
        suppliers: ProductSupplier[];
        branches: ProductBranch[];
        galleryImages: ProductGalleryImage[];
        packages: ProductPackage[];
        promotions?: ProductPromotionDraft[];
    },
    mode: "create" | "update"
): CreateProductRequest {
    const { generalData, priceData, suppliers, branches, galleryImages, packages, promotions } =
        input;

    const departmentId = Number(generalData.departmentId);
    const lineId = Number(generalData.lineId);
    const pieceCount = parseInt(generalData.piecesCount, 10);

    const baseFields = {
        departmentId,
        lineId,
        shortName: generalData.shortName.trim(),
        description: generalData.description.trim(),
        pieceCount: Number.isFinite(pieceCount) ? pieceCount : 1,
        listCost: Number(priceData.listCost),
        currency: priceData.currency,
        exchangeRate: Number(priceData.exchangeRate),
        iva: Number(priceData.iva),
        suppliers: suppliers.map((s) => ({
            supplierId: s.supplierId,
            supplierProductCode: (s.supplierProductCode ?? "").trim(),
            isPrimary: s.isDefault,
        })),
        images: buildProductImagesPayloadFromGallery(galleryImages),
        branches: branches.map((b) => ({
            branchId: b.branchId,
            minStock: b.minInventory,
            maxStock: b.maxInventory,
            isAvailable: b.enabled,
        })),
    };

    const packageItems = mapProductPackagesToPackageItems(packages);

    const promotionPayloads =
        promotions
            ?.map((d) => {
                const rest: SavePromotionPayload = { ...d.payload };
                delete rest.creditTermOptionLabels;
                delete rest.layawayTermOptionLabels;
                return {
                    ...rest,
                    isLiquidation: d.isLiquidation,
                };
            })
            .filter((p) => p.name?.trim()) ?? [];

    /** PATCH must always send `promotions` (even []) so backend full-sync can detach/remove. */
    const base: Omit<
        CreateProductRequest,
        "warrantyType" | "warrantyMonths" | "warrantyPolicy"
    > =
        mode === "update"
            ? {
                ...baseFields,
                code: generalData.code.trim(),
                packageItems,
                promotions: promotionPayloads,
            }
            : {
                ...baseFields,
                packageItems,
                ...(promotionPayloads.length > 0 ? { promotions: promotionPayloads } : {}),
            };

    if (generalData.warrantyType === "policy") {
        return {
            ...base,
            warrantyType: "ANNEX_POLICY",
            warrantyPolicy: generalData.warrantyPolicy.trim(),
        };
    }

    return {
        ...base,
        warrantyType: "MONTHS",
        warrantyMonths: Math.max(0, Number(generalData.warrantyMonths) || 0),
    };
}

const MULTIPART_UPLOAD_TIMEOUT_MS = 120_000;

export async function createProduct(
    payload: CreateProductRequest,
    options?: { galleryFiles?: File[] }
): Promise<ApiResult<CreateProductResponse>> {
    const galleryFiles = options?.galleryFiles ?? [];
    if (galleryFiles.length > 0) {
        const formData = buildProductMultipartFormData(payload, galleryFiles);
        return post<CreateProductResponse>(PRODUCTS_BASE, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: MULTIPART_UPLOAD_TIMEOUT_MS,
        });
    }
    return post<CreateProductResponse>(PRODUCTS_BASE, payload);
}

export async function getProductPreviewCode(
    lineId: number
): Promise<ApiResult<ProductPreviewCodeResponse>> {
    return get<ProductPreviewCodeResponse>(`${PRODUCTS_BASE}/preview-code`, {
        params: { lineId },
    });
}

export interface ProductDetailSupplierDto {
    supplierId: number;
    supplierProductCode?: string | null;
    isPrimary: boolean;
    supplierName?: string | null;
}

export interface ProductDetailBranchDto {
    branchId: number;
    branchName?: string | null;
    minStock: number;
    maxStock: number;
    isAvailable: boolean;
}

export interface ProductDetailPriceDto {
    listCost: number;
    currency: string;
    exchangeRate: number;
    iva: number;
    averageCost: number;
    lastCost: number;
    liquidation: boolean;
    costBasisForCalculation?: string | null;
    lastEditedBy?: string | null;
    lastEditedDate?: string | null;
    basePrices?: Array<{
        id?: string;
        name: string;
        marginPercent: number;
        lastEditedBy?: string | null;
    }> | null;
}

export interface ProductDetailPromotionPayloadDto {
    name: string;
    discountRate: number;
    startDate: string;
    endDate?: string | null;
    purchaseTypeId?: number | null;
    creditTermIds?: number[];
    creditTermOptionLabels?: string[];
    layawayTermIds?: number[];
    layawayTermOptionLabels?: string[];
    customerLevelDownPayments?: Array<{
        customerLevelId: number;
        percentage: number;
    }>;
    productIds?: number[];
    branchIds?: number[];
    supplierIds?: number[];
}

export interface ProductDetailPromotionDto {
    promotionId: number;
    isLiquidation: boolean;
    purchaseTypeCode: string;
    payload: ProductDetailPromotionPayloadDto;
}

export type ProductDetailDto = {
    id: number;
    departmentId: number;
    lineId: number;
    code: string;
    shortName: string;
    description: string;
    pieceCount: number;
    suppliers: ProductDetailSupplierDto[];
    images: ProductGalleryImage[];
    branches: ProductDetailBranchDto[];
    price?: ProductDetailPriceDto | null;
    promotions?: ProductDetailPromotionDto[];
} & (
        | { warrantyType: "MONTHS"; warrantyMonths: number }
        | { warrantyType: "ANNEX_POLICY"; warrantyPolicy: string }
    );

export interface LoadedProductFormSnapshot {
    generalData: GeneralDataFormState;
    suppliers: ProductSupplier[];
    priceData: PriceFormState;
    basePrices: ProductBasePrice[];
    galleryImages: ProductGalleryImage[];
    productPromotionDrafts: ProductPromotionDraft[];
}

const COST_BASIS_VALUES: CostBasisForCalculation[] = [
    "last_cost",
    "list_cost",
    "average_cost",
];

function normalizeCostBasis(value: string | null | undefined): CostBasisForCalculation {
    if (value && COST_BASIS_VALUES.includes(value as CostBasisForCalculation)) {
        return value as CostBasisForCalculation;
    }
    return "last_cost";
}

function detailPromotionsToDrafts(
    rows: ProductDetailPromotionDto[] | undefined,
): ProductPromotionDraft[] {
    if (!rows?.length) {
        return [];
    }
    return rows.map((row, index) => ({
        id: `promo-${row.promotionId}-${index}`,
        isLiquidation: Boolean(row.isLiquidation),
        purchaseTypeCode: row.purchaseTypeCode ?? "",
        payload: {
            promotionId: row.promotionId,
            name: row.payload.name,
            discountRate: row.payload.discountRate,
            startDate: row.payload.startDate,
            endDate: row.payload.endDate ?? null,
            purchaseTypeId: row.payload.purchaseTypeId ?? null,
            creditTermIds: row.payload.creditTermIds,
            layawayTermIds: row.payload.layawayTermIds,
            creditTermOptionLabels: row.payload.creditTermOptionLabels,
            layawayTermOptionLabels: row.payload.layawayTermOptionLabels,
            customerLevelDownPayments: row.payload.customerLevelDownPayments,
            productIds: row.payload.productIds,
            branchIds: row.payload.branchIds,
            supplierIds: row.payload.supplierIds,
            isLiquidation: row.isLiquidation,
        },
    }));
}

export function productDetailDtoToFormSnapshot(detail: ProductDetailDto): LoadedProductFormSnapshot {
    const warrantyIsAnnex = detail.warrantyType === "ANNEX_POLICY";

    const generalData: GeneralDataFormState = {
        departmentId: String(detail.departmentId),
        lineId: String(detail.lineId),
        code: detail.code ?? "",
        description: detail.description ?? "",
        shortName: detail.shortName ?? "",
        piecesCount: String(
            Number.isFinite(detail.pieceCount) && detail.pieceCount >= 1 ? detail.pieceCount : 1
        ),
        warrantyType: warrantyIsAnnex ? "policy" : "months",
        warrantyMonths: warrantyIsAnnex
            ? "0"
            : String(
                detail.warrantyType === "MONTHS" && Number.isFinite(detail.warrantyMonths)
                    ? detail.warrantyMonths
                    : 0
            ),
        warrantyPolicy:
            detail.warrantyType === "ANNEX_POLICY" ? (detail.warrantyPolicy ?? "") : "",
    };

    let suppliers: ProductSupplier[] = (detail.suppliers ?? []).map((s, index) => ({
        id: `supplier-${detail.id}-${s.supplierId}-${index}`,
        supplierId: s.supplierId,
        supplierName: (s.supplierName ?? "").trim() || `Supplier ${s.supplierId}`,
        isDefault: Boolean(s.isPrimary),
        supplierProductCode: s.supplierProductCode ?? undefined,
    }));
    if (suppliers.length > 0 && !suppliers.some((s) => s.isDefault)) {
        suppliers = suppliers.map((s, i) => ({ ...s, isDefault: i === 0 }));
    }

    const price = detail.price;
    const priceData: PriceFormState = {
        listCost: (price?.listCost ?? 0).toFixed(2),
        currency: price?.currency ?? "MXN",
        exchangeRate: (price?.exchangeRate ?? 1).toFixed(2),
        iva: String(price?.iva ?? 16),
        liquidation: Boolean(price?.liquidation),
        costBasisForCalculation: normalizeCostBasis(price?.costBasisForCalculation ?? undefined),
        lastCost: (price?.lastCost ?? 0).toFixed(2),
        averageCost: (price?.averageCost ?? 0).toFixed(2),
        lastEditedBy: (price?.lastEditedBy ?? "").trim(),
        lastEditedDate: (price?.lastEditedDate ?? "").trim(),
    };

    const basePrices: ProductBasePrice[] =
        price?.basePrices && price.basePrices.length > 0
            ? price.basePrices.map((bp, i) => ({
                id: bp.id ?? `bp-${detail.id}-${i}`,
                name: bp.name,
                marginPercent: bp.marginPercent,
                lastEditedBy: bp.lastEditedBy ?? undefined,
            }))
            : [...DEFAULT_PRODUCT_BASE_PRICES];

    return {
        generalData,
        suppliers,
        priceData,
        basePrices,
        galleryImages: detail.images,
        productPromotionDrafts: detailPromotionsToDrafts(detail.promotions),
    };
}

export async function getProductById(
    id: number
): Promise<ApiResult<ProductDetailDto>> {
    return get<ProductDetailDto>(`${PRODUCTS_BASE}/${id}`);
}

export async function updateProduct(
    id: number,
    payload: CreateProductRequest,
    options?: { galleryFiles?: File[] }
): Promise<ApiResult<ProductDetailDto>> {
    const galleryFiles = options?.galleryFiles ?? [];
    if (galleryFiles.length > 0) {
        const formData = buildProductMultipartFormData(payload, galleryFiles);
        return patch<ProductDetailDto>(`${PRODUCTS_BASE}/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: MULTIPART_UPLOAD_TIMEOUT_MS,
        });
    }
    return patch<ProductDetailDto>(`${PRODUCTS_BASE}/${id}`, payload);
}
export interface ProductListItem {
    id: number;
    code: string;
    status: string;
    name: string;
    department: string;
    line: string;
    supplier: string | null;
}
export interface GetProductsQueryParams {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    [key: string]: unknown;
}

export async function getProducts(
    params: GetProductsQueryParams
): Promise<ApiResult<PaginatedRowsResponse<ProductListItem>>> {
    return get<PaginatedRowsResponse<ProductListItem>>(
        buildListUrl(PRODUCTS_BASE, params)
    );
}

export const PRODUCT_SEARCH_DEFAULT_LIMIT = 100;

/** Row shape returned by GET /products/search */
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
    if (data != null && typeof data === "object" && "rows" in data && Array.isArray((data as { rows: unknown }).rows) ) {
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
export interface ProductWarrantyTypeCatalogOption {
    value: string;
    label: string;
}

export interface CurrencyCatalogOption {
    value: string;
    label: string;
}

export interface ProductsCatalogData {
    warrantyTypes: ProductWarrantyTypeCatalogOption[];
    currencies: CurrencyCatalogOption[];
}

export async function getProductsCatalog(): Promise<
    ApiResult<ProductsCatalogData>
> {
    return get<ProductsCatalogData>(`${PRODUCTS_BASE}/catalog`);
}

export async function getProductsByLineIds(lineIds: number[]): Promise<ProductListItem[]> {
    return unwrapOrThrow(
        await post<ProductListItem[]>(`${PRODUCTS_BASE}/by-lines`, {
            line_ids: lineIds,
        })
    );
}

