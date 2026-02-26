// ============================================================================
// TYPES - Low rotation strategy (Liquidaciones)
// ============================================================================

export interface LowRotationSummaryStats {
  slowMovement: number;
  inLiquidation: number;
  totalInventory: number;
}

export interface DepartmentLowRotation {
  id: string;
  name: string;
  description: string;
  slowMovement: number;
  inLiquidation: number;
  totalInventory: number;
}

export interface PriceSuggestionOption {
  price: number;
  changePercent: number;
  direction: "up" | "down";
}

export interface PriceSuggestionItem {
  id: string;
  productName: string;
  sku: string;
  suggestedPrice: number;
  changePercent: number;
  direction: "up" | "down";
  alternativePrices: PriceSuggestionOption[];
}

export interface LowRotationStrategyResponse {
  summary: LowRotationSummaryStats;
  departments: DepartmentLowRotation[];
  priceSuggestions: PriceSuggestionItem[];
}
