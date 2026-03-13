// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type WarrantyType = "months" | "policy";

export interface ProductSupplier {
    id: string;
    supplierId: number;
    supplierName: string;
    isDefault: boolean;
}

export interface ProductPrice {
    listCost: number;
    currency: string;
    exchangeRate: number;
    iva: number;
    averageCost: number;
    lastCost: number;
    liquidation: boolean;
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
}

export interface PriceFormState {
    listCost: string;
    currency: string;
    exchangeRate: string;
    iva: string;
    liquidation: boolean;
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
