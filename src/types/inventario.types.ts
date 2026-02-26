// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface InventoryDetail {
    id: string;
    sku: string;
    code: string;
    name: string;
    shortName: string;
    description: string;
    status: "active" | "inactive";
    department: {
        id: string;
        code: string;
        name: string;
    };
    line: {
        id: string;
        code: string;
        name: string;
    };
    warranty: string;
}

export interface InventorySummary {
    inStock: number;
    orders: number;
    inTransit: number;
    damaged: number;
}

export interface BranchInventory {
    id: string;
    branchName: string;
    stock: number;
    creditPrice: number;
    price: number;
    tags?: string[];
}

export interface SalesData {
    lastMonth: number;
    previousMonth: number;
    percentageChange: number;
    monthlyData: MonthlySalesData[];
}

export interface MonthlySalesData {
    month: string;
    monthShort: string;
    sales: number;
}

export type ActivityType = "edition" | "inventory" | "sales";

export interface ActivityLogEntry {
    id: string;
    type: ActivityType;
    performedBy: string;
    description: string;
    timestamp: string;
    date: string;
    time: string;
}

export interface ProductSupplier {
    id: string;
    supplierId: string;
    supplierName: string;
    status: "principal" | "secondary";
}

export interface PricingStrategy {
    cost: number;
    listPrice: number;
    cashPrice: number;
}

export interface ProductPackage {
    id: string;
    articleName: string;
    quantity: number;
    lastPrice: number;
    packagePrice: number;
}

export interface ProductGallery {
    images: string[];
}

export interface SalesBranchConfig {
    id: string;
    name: string;
    enabled: boolean;
}
