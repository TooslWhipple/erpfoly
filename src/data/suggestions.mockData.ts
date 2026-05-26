// ============================================================================
// MOCK DATA - Product Suggestions
// ============================================================================

import type { ProductSuggestion } from "@/types/suggestions.types";

export const MOCK_SUGGESTIONS: ProductSuggestion[] = [
    {
        id: "1",
        name: "Secadora Mabe 20kg SMG26N...",
        sku: "04ET-123456",
        currentStock: 2,
        demandData: {
            lastYear: 155,
            lastMonth: 32,
            currentMonth: 13,
        },
        score: 0,
        trendData: [
            { month: "Ene", value: 8 },
            { month: "Feb", value: 12 },
            { month: "Mar", value: 15 },
            { month: "Abr", value: 18 },
            { month: "May", value: 22 },
            { month: "Jun", value: 28 },
            { month: "Jul", value: 32 },
        ],
    },
    {
        id: "2",
        name: "Lavadora Mabe 19kg LMA19...",
        sku: "04ET-123457",
        currentStock: 3,
        demandData: {
            lastYear: 142,
            lastMonth: 28,
            currentMonth: 11,
        },
        score: 0,
        trendData: [
            { month: "Ene", value: 7 },
            { month: "Feb", value: 10 },
            { month: "Mar", value: 14 },
            { month: "Abr", value: 16 },
            { month: "May", value: 20 },
            { month: "Jun", value: 25 },
            { month: "Jul", value: 28 },
        ],
    },
    {
        id: "3",
        name: "Refrigerador Samsung 20ft...",
        sku: "04ET-123458",
        currentStock: 1,
        demandData: {
            lastYear: 168,
            lastMonth: 35,
            currentMonth: 15,
        },
        score: 0,
        trendData: [
            { month: "Ene", value: 10 },
            { month: "Feb", value: 14 },
            { month: "Mar", value: 18 },
            { month: "Abr", value: 22 },
            { month: "May", value: 26 },
            { month: "Jun", value: 30 },
            { month: "Jul", value: 35 },
        ],
    },
];

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

export async function getSuggestions(): Promise<ProductSuggestion[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_SUGGESTIONS;
}
