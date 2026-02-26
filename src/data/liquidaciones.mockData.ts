// ============================================================================
// MOCK DATA - Low rotation strategy (Liquidaciones)
// ============================================================================

import type {
  LowRotationSummaryStats,
  DepartmentLowRotation,
  PriceSuggestionItem,
  LowRotationStrategyResponse,
} from "@/types/liquidaciones.types";

export const MOCK_SUMMARY: LowRotationSummaryStats = {
  slowMovement: 56,
  inLiquidation: 32,
  totalInventory: 298,
};

export const MOCK_DEPARTMENTS: DepartmentLowRotation[] = [
  {
    id: "1",
    name: "Línea Blanca",
    description: "Menos de 3 ventas en 90 días.",
    slowMovement: 12,
    inLiquidation: 8,
    totalInventory: 298,
  },
  {
    id: "2",
    name: "Muebles",
    description: "Menos de 3 ventas en 90 días.",
    slowMovement: 12,
    inLiquidation: 8,
    totalInventory: 298,
  },
  {
    id: "3",
    name: "Colchones",
    description: "Menos de 3 ventas en 90 días.",
    slowMovement: 12,
    inLiquidation: 8,
    totalInventory: 298,
  },
  {
    id: "4",
    name: "Aire acondicionado",
    description: "Menos de 3 ventas en 90 días.",
    slowMovement: 12,
    inLiquidation: 8,
    totalInventory: 298,
  },
  {
    id: "5",
    name: "Electrodomésticos",
    description: "Menos de 3 ventas en 90 días.",
    slowMovement: 12,
    inLiquidation: 8,
    totalInventory: 298,
  },
  {
    id: "6",
    name: "Bicicletas",
    description: "Menos de 3 ventas en 90 días.",
    slowMovement: 12,
    inLiquidation: 8,
    totalInventory: 298,
  },
];

export const MOCK_PRICE_SUGGESTIONS: PriceSuggestionItem[] = [
  {
    id: "1",
    productName: "Secadora Mabe 20kg SMG26N5MN...",
    sku: "04ET-123456",
    suggestedPrice: 7900,
    changePercent: 12,
    direction: "down",
    alternativePrices: [
      { price: 8400, changePercent: 8, direction: "down" },
      { price: 8900, changePercent: 20, direction: "up" },
    ],
  },
  {
    id: "2",
    productName: "Lavadora Mabe 19kg LMA19...",
    sku: "04ET-123457",
    suggestedPrice: 6500,
    changePercent: 15,
    direction: "down",
    alternativePrices: [
      { price: 6800, changePercent: 11, direction: "down" },
      { price: 7200, changePercent: 6, direction: "down" },
    ],
  },
  {
    id: "3",
    productName: "Refrigerador Samsung 20ft...",
    sku: "04ET-123458",
    suggestedPrice: 12400,
    changePercent: 10,
    direction: "down",
    alternativePrices: [
      { price: 12900, changePercent: 6, direction: "down" },
      { price: 13500, changePercent: 2, direction: "down" },
    ],
  },
  {
    id: "4",
    productName: "Estufa Mabe 4 quemadores...",
    sku: "04ET-123459",
    suggestedPrice: 4200,
    changePercent: 18,
    direction: "down",
    alternativePrices: [
      { price: 4500, changePercent: 12, direction: "down" },
      { price: 4800, changePercent: 6, direction: "down" },
    ],
  },
];

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

export async function getLowRotationStrategy(): Promise<LowRotationStrategyResponse> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return {
    summary: MOCK_SUMMARY,
    departments: MOCK_DEPARTMENTS,
    priceSuggestions: MOCK_PRICE_SUGGESTIONS,
  };
}

export async function applyPriceSuggestion(
  _suggestionId: string,
  _price: number
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  // Simulated success; in production would call API
}
