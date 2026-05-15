// ============================================================================
// TYPES - Product Suggestions
// ============================================================================

export interface DemandData {
    lastYear: number;
    lastMonth: number;
    currentMonth: number;
}

export interface DemandTrendPoint {
    month: string;
    value: number;
}

export interface ProductSuggestion {
    id: string;
    name: string;
    sku: string;
    currentStock: number;
    demandData: DemandData;
    trendData: DemandTrendPoint[];
    score: number;
}

export interface SuggestionsResponse {
    products: ProductSuggestion[];
    total: number;
}
