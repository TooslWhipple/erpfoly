// ============================================================================
// MOCK DATA - Orders (Pedidos)
// ============================================================================

import type { Supplier, Article } from "@/types/pedidos.types";
import type { ProductSuggestion } from "@/types/suggestions.types";

export const MOCK_SUPPLIERS: Supplier[] = [
    {
        id: "34340",
        name: "Arlix Muebles y Electrodomésticos S.A. de C.V.",
    },
    {
        id: "09323",
        name: "Mabe - Mabe S.A. De C.V.",
    },
    {
        id: "12345",
        name: "Mirage - Norage S.A. De C.V.",
    },
    {
        id: "34341",
        name: "Hogar Integral de Occidente S.A. de C.V.",
    },
    {
        id: "09324",
        name: "Eztra Equipos del Hogar S.A. de C.V.",
    },
    {
        id: "09325",
        name: "Equipos Domésticos Modernos S. de R.L. de C.V.",
    },
    {
        id: "12346",
        name: "Frosen Linea Blanca S. de R.L. de C.V.",
    },
    {
        id: "34342",
        name: "Nevora Distribuidora Doméstica S.A. de C.V.",
    },
];

export const MOCK_ARTICLES: Article[] = [
    {
        id: "1",
        name: "Lavadora Whirlpool 20 kg Blanca (Carga Superior Xpert...)",
        folio: "04ET-123456",
        salesYear: 155,
        salesLastMonth: 12,
        salesCurrentMonth: 5,
        inRepair: 1,
        stock: 0,
        pendingSupply: 0,
    },
    {
        id: "2",
        name: "Lavadora Whirlpool 20 kg Blanca Agitador Automatico",
        folio: "04ET-123456",
        salesYear: 155,
        salesLastMonth: 12,
        salesCurrentMonth: 5,
        inRepair: 1,
        stock: 2,
        pendingSupply: 15,
    },
    {
        id: "3",
        name: "Lavadora Whirlpool 20 kg Gris (Modelo WW20LTAHLA)",
        folio: "04ET-123456",
        salesYear: 92,
        salesLastMonth: 56,
        salesCurrentMonth: 17,
        inRepair: 0,
        stock: 15,
        pendingSupply: 0,
    },
    {
        id: "4",
        name: "Lavadora Whirlpool 20 kg Blanca Modelo 8MWTW-20...",
        folio: "04ET-123456",
        salesYear: 92,
        salesLastMonth: 56,
        salesCurrentMonth: 17,
        inRepair: 0,
        stock: 15,
        pendingSupply: 0,
    },
    {
        id: "5",
        name: "Lavadora Whirlpool 20 kg Blanca (Carga Superior, Mod...)",
        folio: "04ET-123456",
        salesYear: 155,
        salesLastMonth: 12,
        salesCurrentMonth: 5,
        inRepair: 1,
        stock: 2,
        pendingSupply: 2,
    },
    {
        id: "6",
        name: "Lavadora Whirlpool 20 kg Blanca Torre de Lavado Eléctrico Bla...",
        folio: "04ET-123456",
        salesYear: 155,
        salesLastMonth: 12,
        salesCurrentMonth: 5,
        inRepair: 1,
        stock: 2,
        pendingSupply: 2,
    },
    {
        id: "7",
        name: "Secadora Whirlpool 18 kg Carga Superior Blanca Electr...",
        folio: "04ET-123456",
        salesYear: 155,
        salesLastMonth: 12,
        salesCurrentMonth: 5,
        inRepair: 1,
        stock: 2,
        pendingSupply: 2,
    },
];

export const MOCK_SUGGESTIONS_FOR_ORDER: ProductSuggestion[] = [
    {
        id: "1",
        name: "Lavadora Whirlp...",
        sku: "04ET-123456",
        currentStock: 2,
        demandData: {
            lastYear: 155,
            lastMonth: 32,
            currentMonth: 13,
        },
        trendData: [
            { month: "Feb", value: 8 },
            { month: "Mar", value: 12 },
            { month: "Abr", value: 15 },
            { month: "May", value: 18 },
            { month: "Jun", value: 22 },
        ],
    },
    {
        id: "2",
        name: "Lavadora...",
        sku: "04ET-123456",
        currentStock: 7,
        demandData: {
            lastYear: 155,
            lastMonth: 32,
            currentMonth: 13,
        },
        trendData: [
            { month: "Feb", value: 8 },
            { month: "Mar", value: 12 },
            { month: "Abr", value: 15 },
            { month: "May", value: 18 },
            { month: "Jun", value: 22 },
        ],
    },
    {
        id: "3",
        name: "Lavadora Whirlp...",
        sku: "04ET-123456",
        currentStock: 15,
        demandData: {
            lastYear: 1243,
            lastMonth: 190,
            currentMonth: 59,
        },
        trendData: [
            { month: "Feb", value: 45 },
            { month: "Mar", value: 52 },
            { month: "Abr", value: 58 },
            { month: "May", value: 65 },
            { month: "Jun", value: 70 },
        ],
    },
    {
        id: "4",
        name: "Lavadora...",
        sku: "04ET-123456",
        currentStock: 7,
        demandData: {
            lastYear: 155,
            lastMonth: 32,
            currentMonth: 13,
        },
        trendData: [
            { month: "Feb", value: 8 },
            { month: "Mar", value: 12 },
            { month: "Abr", value: 15 },
            { month: "May", value: 18 },
            { month: "Jun", value: 22 },
        ],
    },
];

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

export async function getSuppliers(searchQuery?: string): Promise<Supplier[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    if (!searchQuery) {
        return MOCK_SUPPLIERS;
    }
    
    const query = searchQuery.toLowerCase();
    return MOCK_SUPPLIERS.filter(
        (supplier) =>
            supplier.name.toLowerCase().includes(query) ||
            supplier.id.includes(query)
    );
}

export async function getArticles(supplierId: string, searchQuery?: string): Promise<Article[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    let filtered = [...MOCK_ARTICLES];
    
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
            (article) =>
                article.name.toLowerCase().includes(query) ||
                article.folio.toLowerCase().includes(query)
        );
    }
    
    return filtered;
}

export async function getSuggestionsForOrder(supplierId: string): Promise<ProductSuggestion[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_SUGGESTIONS_FOR_ORDER;
}

// ============================================================================
// COST HISTORY MOCK DATA
// ============================================================================

import type { CostHistoryEntry } from "@/components";

export const MOCK_COST_HISTORY: Record<string, CostHistoryEntry[]> = {
    "1": [
        {
            id: "1",
            date: "2025-10-15",
            price: 9349.0,
            changePercentage: 2.0,
            orderId: "12356",
        },
        {
            id: "2",
            date: "2025-10-02",
            price: 9210.0,
            changePercentage: 1.2,
            orderId: "12356",
        },
        {
            id: "3",
            date: "2025-09-04",
            price: 9200.0,
            changePercentage: 1.2,
            orderId: "12356",
        },
        {
            id: "4",
            date: "2025-08-04",
            price: 9150.0,
            changePercentage: 1.2,
            orderId: "12356",
        },
        {
            id: "5",
            date: "2025-07-20",
            price: 8990.0,
            changePercentage: 1.2,
            orderId: "12356",
        },
    ],
};

export async function getCostHistory(articleId: string): Promise<CostHistoryEntry[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_COST_HISTORY[articleId] || [];
}
