// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type WarrantyType = "months" | "policy";

/** Backend warranty values for POST /products */
export type ProductWarrantyTypeApi = "MONTHS" | "ANNEX_POLICY";

export interface CreateProductSupplierPayload {
    supplierId: number;
    supplierProductCode: string;
    isPrimary: boolean;
}

export interface CreateProductImagePayload {
    imageUrl: string;
    sortOrder: number;
}

export interface CreateProductBranchPayload {
    branchId: number;
    minStock: number;
    maxStock: number;
    isAvailable: boolean;
}

export type ProductPackageItemApiType = "PRODUCT" | "SERVICE";

export interface CreateProductPackageItemPayload {
    type: ProductPackageItemApiType;
    productId: number | null;
    serviceName: string | null;
    packagePrice: number;
    branchIds: number[];
}

export type CreateProductRequest = {
    departmentId: number;
    lineId: number;
    code?: string;
    shortName: string;
    description: string;
    pieceCount: number;
    suppliers: CreateProductSupplierPayload[];
    images: CreateProductImagePayload[];
    branches: CreateProductBranchPayload[];
    packageItems?: CreateProductPackageItemPayload[];
} & (
    | { warrantyType: "MONTHS"; warrantyMonths: number }
    | { warrantyType: "ANNEX_POLICY"; warrantyPolicy: string }
);

export interface CreateProductResponse {
    id: number;
}

/** GET /products/preview-code?lineId= */
export interface ProductPreviewCodeResponse {
    code: string;
}

export interface ProductSupplier {
    id: string;
    supplierId: number;
    supplierName: string;
    isDefault: boolean;
    /** Supplier reference code sent to POST /products */
    supplierProductCode?: string;
}

export type CostBasisForCalculation = "last_cost" | "list_cost" | "average_cost";

export interface ProductBasePrice {
    id: string;
    name: string;
    marginPercent: number;
    lastEditedBy?: string;
}

export interface ProductPrice {
    listCost: number;
    currency: string;
    exchangeRate: number;
    iva: number;
    averageCost: number;
    lastCost: number;
    liquidation: boolean;
    costBasisForCalculation?: CostBasisForCalculation;
    basePrices?: ProductBasePrice[];
}

export interface ProductBranch {
    id: string;
    branchId: number;
    branchName: string;
    enabled: boolean;
    minInventory: number;
    maxInventory: number;
}

export interface Product {
    id: string;
    code: string;
    departmentId: number;
    lineId: string;
    description: string;
    shortName: string;
    warrantyType: WarrantyType;
    warrantyMonths: number;
    suppliers: ProductSupplier[];
    price: ProductPrice;
    branches: ProductBranch[];
    images: string[];
}

/** Gallery row: preview URL (blob or https) plus optional file for API payload */
export interface ProductGalleryImage {
    id: string;
    previewUrl: string;
    file: File | null;
}

export interface CostHistoryEntry {
    id: string;
    date: string;
    price: number;
    changePercentage: number;
    changeType: "increase" | "decrease";
}

// ============================================================================
// FORM STATE INTERFACES
// ============================================================================

export interface GeneralDataFormState {
    departmentId: string;
    lineId: string;
    code: string;
    description: string;
    shortName: string;
    piecesCount: string;
    warrantyType: WarrantyType;
    warrantyMonths: string;
    warrantyPolicy: string;
}

export interface PriceFormState {
    listCost: string;
    currency: string;
    exchangeRate: string;
    iva: string;
    liquidation: boolean;
    costBasisForCalculation: CostBasisForCalculation;
    lastCost: string;
    averageCost: string;
    lastEditedBy: string;
    lastEditedDate: string;
}

export interface FormErrors {
    [key: string]: string;
}

// ============================================================================
// PACKAGE TYPES
// ============================================================================

export type PackageType = "article" | "service";

export interface ProductPackage {
    id: string;
    type: PackageType;
    articleId?: string;
    articleName?: string;
    serviceName?: string;
    /** Units included in the package (default 1 when adding from the modal). */
    quantity: number;
    /** Effective line price for articles; services use 0 when complimentary. */
    packagePrice: number;
    branches: number[];
}

export interface PackageFormData {
    type: PackageType;
    articleId?: string;
    serviceName?: string;
    packagePrice?: number;
    branches: number[];
}

export type SelectableItem = {
    id: string | number;
    label: string;
};
