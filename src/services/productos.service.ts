import { get, patch, post, unwrapOrThrow, type ApiResult, type PaginatedRowsResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
    CreateProductPackageItemPayload,
    CreateProductRequest,
    CreateProductResponse,
    GeneralDataFormState,
    PriceFormState,
    ProductBasePrice,
    ProductSupplier,
    ProductBranch,
    ProductGalleryImage,
    ProductPackage,
    CostBasisForCalculation,
    ProductPreviewCodeResponse,
} from "@/types/productos.types";
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

function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
            } else {
                reject(new Error("Unexpected FileReader result"));
            }
        };
        reader.onerror = () => {
            reject(reader.error ?? new Error("Failed to read image file"));
        };
        reader.readAsDataURL(file);
    });
}

export async function resolveGalleryImageUrlsForCreate(
    items: ProductGalleryImage[]
): Promise<string[]> {
    const urls: string[] = [];
    for (const item of items) {
        if (item.file) {
            urls.push(await readFileAsDataUrl(item.file));
        } else if (
            /^https?:\/\//i.test(item.previewUrl) ||
            /^data:image\//i.test(item.previewUrl)
        ) {
            urls.push(item.previewUrl);
        }
    }
    return urls;
}

export function buildCreateProductRequest(
    input: {
        generalData: GeneralDataFormState;
        priceData: PriceFormState;
        suppliers: ProductSupplier[];
        branches: ProductBranch[];
        images: string[];
        packages: ProductPackage[];
    },
    mode: "create" | "update"
): CreateProductRequest {
    const { generalData, priceData, suppliers, branches, images, packages } = input;

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
        images: images
            .filter(
                (url) =>
                    /^https?:\/\//i.test(url) ||
                    /^data:image\//i.test(url)
            )
            .map((imageUrl, index) => ({ imageUrl, sortOrder: index })),
        branches: branches.map((b) => ({
            branchId: b.branchId,
            minStock: b.minInventory,
            maxStock: b.maxInventory,
            isAvailable: b.enabled,
        })),
    };

    const packageItems = mapProductPackagesToPackageItems(packages);

    const base: Omit<
        CreateProductRequest,
        "warrantyType" | "warrantyMonths" | "warrantyPolicy"
    > =
        mode === "update"
            ? { ...baseFields, code: generalData.code.trim(), packageItems }
            : { ...baseFields, packageItems };

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

export async function createProduct(
    payload: CreateProductRequest
): Promise<ApiResult<CreateProductResponse>> {
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

export interface ProductDetailImageDto {
    imageUrl: string;
    sortOrder: number;
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

export type ProductDetailDto = {
    id: number;
    departmentId: number;
    lineId: number;
    code: string;
    shortName: string;
    description: string;
    pieceCount: number;
    suppliers: ProductDetailSupplierDto[];
    images: ProductDetailImageDto[];
    branches: ProductDetailBranchDto[];
    price?: ProductDetailPriceDto | null;
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

    const sortedImages = [...(detail.images ?? [])].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
    const galleryImages: ProductGalleryImage[] = sortedImages.map((img, index) => ({
        id: `img-${detail.id}-${index}-${img.sortOrder ?? index}`,
        previewUrl: img.imageUrl,
        file: null,
    }));

    return {
        generalData,
        suppliers,
        priceData,
        basePrices,
        galleryImages,
    };
}

export async function getProductById(
    id: number
): Promise<ApiResult<ProductDetailDto>> {
    return get<ProductDetailDto>(`${PRODUCTS_BASE}/${id}`);
}

export async function updateProduct(
    id: number,
    payload: CreateProductRequest
): Promise<ApiResult<ProductDetailDto>> {
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

