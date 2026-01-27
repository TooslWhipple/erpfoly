// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type PromotionApplicationType = "Crédito" | "Contado" | "Apartados";

export type PromotionMonth = 3 | 6 | 9 | 12 | 18 | 24;

export type PromotionDay = 30 | 45 | 60;

export interface PromotionClientLevel {
    level: number;
    advancePercentage: number;
}

export interface PromotionDepartment {
    id: string | number;
    code: string;
    name: string;
}

export interface PromotionArticle {
    id: string;
    code: string;
    status: "Activo" | "Draft";
    name: string;
    department: string;
    line: string;
    supplier: string;
    price: number;
}

export interface PromotionBranch {
    id: string | number;
    name: string;
}

export interface PromotionSupplier {
    id: number;
    supplierId: number;
    supplierName: string;
}

export interface PromotionFormState {
    // Configuration
    name: string;
    percentage: string;
    applicationType: PromotionApplicationType;
    months: PromotionMonth[];
    days: PromotionDay[];
    clientLevels: PromotionClientLevel[];
    startDate: string;
    endDate: string | null;
    hasEndDate: boolean;
    
    // Departments
    selectedDepartmentIds: (string | number)[];
    selectedArticleIds: string[];
    
    // Branches
    selectedBranchIds: (string | number)[];
    
    // Suppliers
    suppliers: PromotionSupplier[];
}

export interface Promotion {
    id: number;
    name: string;
    percentage: number;
    applicationType: PromotionApplicationType;
    months: PromotionMonth[];
    days: PromotionDay[];
    clientLevels: PromotionClientLevel[];
    startDate: string;
    endDate: string | null;
    departments: PromotionDepartment[];
    articles: PromotionArticle[];
    branches: PromotionBranch[];
    suppliers: PromotionSupplier[];
}

export interface FormErrors {
    [key: string]: string | undefined;
}
