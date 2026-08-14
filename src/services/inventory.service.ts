import { get, type ApiResult, type PaginatedRowsResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  ActivityLogEntry,
  BranchInventory,
  InventoryDetail,
  InventorySummary,
  PricingStrategy,
  ProductGallery,
  ProductPackage,
  ProductSupplier,
  SalesBranchConfig,
  SalesData,
} from "@/types/inventario.types";
import {
  getProductById,
  mapDetailPackageItemsToProductPackages,
  type ProductDetailDto,
} from "@/services/productos.service";
import { getBranchesCatalog } from "@/services/branches.service";

const INVENTORY_BASE = "/inventory";

// ---------------------------------------------------------------------------
// API shapes
// ---------------------------------------------------------------------------

export interface InventoryListApiRow {
  id: number;
  code: string;
  status: "active" | "inactive";
  name: string;
  department: string;
  line: string;
  inStock: number;
  inTransit: number;
  damaged: number;
  ordered?: number;
}

export type InventoryListItem = InventoryListApiRow;

export interface GetInventoryListParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  [key: string]: unknown;
}

export interface InventoryStats {
  totalItems: number;
  inStock: number;
  inTransit: number;
  damaged: number;
}

export interface InventoryDetailApiResponse {
  product: {
    id: number;
    code: string;
    name: string;
    shortName: string;
    description: string | null;
    status: "active" | "inactive";
    department: { id: number; code: string; name: string };
    line: { id: number; code: string; name: string };
    warranty: string | null;
  };
  summary: {
    inStock: number;
    orders: number;
    inTransit: number;
    damaged: number;
  };
  branches: Array<{
    id: string;
    branchId: number;
    branchName: string;
    stock: number;
    ordered: number;
    inTransit: number;
    damaged: number;
    creditPrice: number;
    price: number;
  }>;
}

export interface InventorySalesApiResponse {
  lastMonth: number;
  previousMonth: number;
  percentageChange: number;
  monthlyData: Array<{
    month: string;
    monthShort: string;
    sales: number;
  }>;
}

export interface InventoryActivityApiRow {
  id: string;
  type: "edition" | "inventory" | "sales";
  performedBy: string;
  description: string;
  timestamp: string;
  date: string;
  time: string;
}

export interface MappedInventoryDetail {
  inventoryDetail: InventoryDetail;
  summary: InventorySummary;
  branchInventory: BranchInventory[];
}

export interface MappedProductTechnicalData {
  suppliers: ProductSupplier[];
  pricingStrategy: PricingStrategy;
  packages: ProductPackage[];
  gallery: ProductGallery;
  salesBranches: SalesBranchConfig[];
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

export function mapInventoryDetailResponse(
  data: InventoryDetailApiResponse,
): MappedInventoryDetail {
  const p = data.product;
  return {
    inventoryDetail: {
      id: String(p.id),
      sku: p.code.replace(/\s+/g, ""),
      code: p.code,
      name: p.name,
      shortName: p.shortName,
      description: p.description ?? "",
      status: p.status,
      department: {
        id: String(p.department.id),
        code: p.department.code,
        name: p.department.name,
      },
      line: {
        id: String(p.line.id),
        code: p.line.code,
        name: p.line.name,
      },
      warranty: p.warranty ?? "",
    },
    summary: {
      inStock: data.summary.inStock,
      orders: data.summary.orders,
      inTransit: data.summary.inTransit,
      damaged: data.summary.damaged,
    },
    branchInventory: data.branches.map((b) => ({
      id: b.id,
      branchName: b.branchName,
      stock: b.stock,
      creditPrice: b.creditPrice,
      price: b.price,
    })),
  };
}

export function mapProductDetailToTechnicalData(
  detail: ProductDetailDto,
  branchCatalog: Array<{ id: number; name: string }>,
  fallbackListPrice = 0,
): MappedProductTechnicalData {
  const suppliers: ProductSupplier[] = (detail.suppliers ?? []).map(
    (s, index) => ({
      id: `supplier-${detail.id}-${s.supplierId}-${index}`,
      supplierId: String(s.supplierId),
      supplierName:
        (s.supplierName ?? "").trim() || `Proveedor ${s.supplierId}`,
      status: s.isPrimary ? "principal" : "secondary",
    }),
  );

  const cost = detail.price?.lastCost ?? detail.price?.listCost ?? 0;
  const listPrice =
    fallbackListPrice > 0 ? fallbackListPrice : detail.price?.listCost ?? cost;

  const pricingStrategy: PricingStrategy = {
    cost,
    listPrice,
    cashPrice: listPrice,
  };

  const packages: ProductPackage[] = mapDetailPackageItemsToProductPackages(
    detail.packageItems,
  ).map((pkg) => ({
    id: pkg.id,
    articleName:
      pkg.type === "service"
        ? (pkg.serviceName ?? "Servicio")
        : (pkg.articleName ?? "Artículo"),
    quantity: pkg.quantity,
    lastPrice: pkg.packagePrice,
    packagePrice: pkg.packagePrice,
  }));

  const gallery: ProductGallery = {
    images: (detail.images ?? [])
      .map((img) => {
        const preview =
          typeof img === "object" && img !== null
            ? ((img as { previewUrl?: string | null; imageUrl?: string })
                .previewUrl ??
              (img as { imageUrl?: string }).imageUrl ??
              "")
            : "";
        return preview;
      })
      .filter((url) => url.length > 0),
  };

  const branchNameById = new Map(
    branchCatalog.map((b) => [b.id, b.name] as const),
  );
  const productBranchById = new Map(
    (detail.branches ?? []).map((b) => [b.branchId, b] as const),
  );

  const salesBranches: SalesBranchConfig[] = branchCatalog.map((b) => {
    const pb = productBranchById.get(b.id);
    return {
      id: String(b.id),
      name: pb?.branchName?.trim() || branchNameById.get(b.id) || b.name,
      enabled: pb?.isAvailable ?? false,
    };
  });

  // If catalog empty, fall back to product branches only
  if (salesBranches.length === 0) {
    for (const b of detail.branches ?? []) {
      salesBranches.push({
        id: String(b.branchId),
        name: b.branchName?.trim() || `Sucursal ${b.branchId}`,
        enabled: b.isAvailable,
      });
    }
  }

  return {
    suppliers,
    pricingStrategy,
    packages,
    gallery,
    salesBranches,
  };
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

export async function getInventoryList(
  params: GetInventoryListParams,
): Promise<ApiResult<PaginatedRowsResponse<InventoryListItem>>> {
  const query: GetInventoryListParams = { ...params };
  if (query.status === "all") {
    delete query.status;
  }
  return get<PaginatedRowsResponse<InventoryListItem>>(
    buildListUrl(INVENTORY_BASE, query),
  );
}

export async function getInventoryStats(): Promise<ApiResult<InventoryStats>> {
  return get<InventoryStats>(`${INVENTORY_BASE}/stats`);
}

export async function getInventoryDetail(
  sku: string,
): Promise<ApiResult<MappedInventoryDetail>> {
  const result = await get<InventoryDetailApiResponse>(
    `${INVENTORY_BASE}/${encodeURIComponent(sku)}`,
  );
  if (result.error || result.data === null) {
    return { data: null, error: result.error };
  }
  return {
    data: mapInventoryDetailResponse(result.data),
    error: null,
  };
}

export async function getInventorySales(
  sku: string,
): Promise<ApiResult<SalesData>> {
  return get<InventorySalesApiResponse>(
    `${INVENTORY_BASE}/${encodeURIComponent(sku)}/sales`,
  );
}

export async function getInventoryActivity(
  sku: string,
  params?: { page?: number; limit?: number },
): Promise<ApiResult<PaginatedRowsResponse<ActivityLogEntry>>> {
  return get<PaginatedRowsResponse<InventoryActivityApiRow>>(
    buildListUrl(
      `${INVENTORY_BASE}/${encodeURIComponent(sku)}/activity`,
      params ?? {},
    ),
  );
}

/**
 * Loads product catalog detail + branch catalog for technical/config tabs.
 */
export async function getInventoryProductExtras(
  productId: number,
  fallbackListPrice = 0,
): Promise<ApiResult<MappedProductTechnicalData>> {
  const [productResult, branches] = await Promise.all([
    getProductById(productId),
    getBranchesCatalog().catch(() => [] as Array<{ id: number; name: string }>),
  ]);

  if (productResult.error || productResult.data === null) {
    return { data: null, error: productResult.error };
  }

  return {
    data: mapProductDetailToTechnicalData(
      productResult.data,
      branches,
      fallbackListPrice,
    ),
    error: null,
  };
}
