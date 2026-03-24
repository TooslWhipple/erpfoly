import { get, post, type ApiResult } from "@/lib/axios";
import type {
    Product,
    CreateProductRequest,
    CreateProductResponse,
    GeneralDataFormState,
    ProductSupplier,
    ProductBranch,
    ProductGalleryImage,
} from "@/types/productos.types";
import { MOCK_BRANCHES } from "@/data/productos.mockData";

const PRODUCTS_BASE = "/products";

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

/**
 * Builds public `imageUrl` strings for POST /products.
 * Local picks are read as data URLs; existing HTTPS URLs are kept as-is.
 * (If the API only accepts hosted URLs, add an upload step and replace data URLs.)
 */
export async function resolveGalleryImageUrlsForCreate(
    items: ProductGalleryImage[]
): Promise<string[]> {
    const urls: string[] = [];
    for (const item of items) {
        if (item.file) {
            urls.push(await readFileAsDataUrl(item.file));
        } else if (/^https?:\/\//i.test(item.previewUrl)) {
            urls.push(item.previewUrl);
        }
    }
    return urls;
}

export function buildCreateProductRequest(input: {
    generalData: GeneralDataFormState;
    suppliers: ProductSupplier[];
    branches: ProductBranch[];
    images: string[];
}): CreateProductRequest {
    const { generalData, suppliers, branches, images } = input;

    const departmentId = Number(generalData.departmentId);
    const lineId = Number(generalData.lineId);
    const pieceCount = parseInt(generalData.piecesCount, 10);

    const base = {
        departmentId,
        lineId,
        code: generalData.code.trim() || "PENDING",
        shortName: generalData.shortName.trim(),
        description: generalData.description.trim(),
        pieceCount: Number.isFinite(pieceCount) ? pieceCount : 1,
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

// ============================================================================
// CATALOG (GET /products/catalog — Products.Read)
// ============================================================================

export interface ProductWarrantyTypeCatalogOption {
    value: string;
    label: string;
}

export interface ProductsCatalogData {
    warrantyTypes: ProductWarrantyTypeCatalogOption[];
}

export async function getProductsCatalog(): Promise<
    ApiResult<ProductsCatalogData>
> {
    return get<ProductsCatalogData>(`${PRODUCTS_BASE}/catalog`);
}

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

export async function getProduct(id: string): Promise<Product | null> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (id === "nuevo") {
        return null;
    }

    // Simulate existing product data
    if (id === "1") {
        return {
            id: "1",
            code: "ART-001",
            departmentId: 1,
            lineId: "1",
            description: "Lavadora Mabe 19kg 121345",
            shortName: "Lavadora Mabe 19kg",
            warrantyType: "months",
            warrantyMonths: 12,
            suppliers: [
                {
                    id: "1",
                    supplierId: 3,
                    supplierName: "Mabe S.A de C.V",
                    isDefault: true,
                },
            ],
            price: {
                listCost: 9200,
                currency: "MXN",
                exchangeRate: 1.0,
                iva: 16,
                averageCost: 9100,
                lastCost: 9150,
                liquidation: false,
                costBasisForCalculation: "last_cost",
                basePrices: [
                    { id: "bp-1", name: "Contado", marginPercent: 35.75, lastEditedBy: "Gerente" },
                ],
            },
            branches: MOCK_BRANCHES.map((branch, index) => ({
                id: `branch-${branch.id}`,
                branchId: branch.id,
                branchName: branch.name,
                enabled: index < 3 || index === 6,
                minInventory: 0,
                maxInventory: 20,
            })),
            images: [],
        };
    }

    return null;
}

export async function saveProduct(product: Omit<Product, "id"> & { id?: string }): Promise<Product> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const savedProduct: Product = {
        id: product.id || Date.now().toString(),
        code: product.code,
        departmentId: product.departmentId,
        lineId: product.lineId,
        description: product.description,
        shortName: product.shortName,
        warrantyType: product.warrantyType,
        warrantyMonths: product.warrantyMonths,
        suppliers: product.suppliers,
        price: product.price,
        branches: product.branches,
        images: product.images,
    };
    console.log("[API] Saved product:", savedProduct);
    return savedProduct;
}
