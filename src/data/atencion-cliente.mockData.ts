// ============================================================================
// MOCK DATA - Customer Service Module
// ============================================================================

import type { InvoiceDetail, InvoiceArticle, InvoiceActivity, SearchResult } from "@/types/atencion-cliente.types";

export const MOCK_INVOICE_ARTICLES: InvoiceArticle[] = [
    {
        id: "1",
        code: "04-EN-00101",
        status: "reparacion",
        description: "[1] Comedor Denver 6 Sillas",
        price: 6890.40,
        promotions: 0.0,
        total: 6890.40,
        points: 68,
    },
    {
        id: "2",
        code: "04-EN-00101",
        status: "entregado",
        description: "[1] Lavadora Mabe 19kg 121345",
        price: 6890.40,
        promotions: 0.0,
        total: 6890.40,
        points: 68,
    },
];

export const MOCK_INVOICE_ACTIVITIES: InvoiceActivity[] = [
    // Empty for now - will show "No hay actividad reciente"
];

export const MOCK_INVOICE_DETAIL: InvoiceDetail = {
    id: "1249941",
    invoiceNumber: "1249941",
    customerId: "12234",
    customerName: "Jose Antonio Montes Molina",
    purchaseDate: "02 de Julio, 2025",
    status: "activo",
    initialCost: 23890.50,
    totalPayments: 1990.87,
    remaining: 21899.63,
    paymentDate: "30 de Jun",
    nextPayment: 1990.87,
    currentPayment: 1,
    totalPaymentsCount: 12,
    articles: MOCK_INVOICE_ARTICLES,
    activities: MOCK_INVOICE_ACTIVITIES,
    summary: {
        subtotalWithoutTax: 0.0,
        tax: 0.0,
        amountWithTax: 0.0,
        luxuryTax: 0.0,
        total: 0.0,
    },
};

export const MOCK_SEARCH_RESULTS: SearchResult[] = [
    {
        id: "1249941",
        type: "facturas",
        title: "Factura 1249941",
        subtitle: "Jose Antonio Montes Molina",
        metadata: {
            date: "02 de Julio, 2025",
            amount: "$23,890.50",
        },
    },
    {
        id: "12234",
        type: "clientes",
        title: "Jose Antonio Montes Molina",
        subtitle: "Cliente ID: 12234",
        metadata: {
            invoices: "5 facturas",
            status: "Activo",
        },
    },
];

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

export async function searchInvoices(query: string, type: "facturas" | "clientes" | "pedidos"): Promise<SearchResult[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    if (!query.trim()) {
        return [];
    }

    const searchLower = query.toLowerCase().trim();
    
    // Filter results by type first
    const filteredResults = MOCK_SEARCH_RESULTS.filter((result) => {
        if (type === "facturas" && result.type !== "facturas") return false;
        if (type === "clientes" && result.type !== "clientes") return false;
        if (type === "pedidos" && result.type !== "pedidos") return false;
        return true;
    });

    // If no results match the type, return empty
    if (filteredResults.length === 0) {
        return [];
    }

    // Search within filtered results
    const matchingResults = filteredResults.filter((result) => {
        return (
            result.title.toLowerCase().includes(searchLower) ||
            result.subtitle?.toLowerCase().includes(searchLower) ||
            result.id.toLowerCase().includes(searchLower) ||
            result.id === searchLower // Exact match
        );
    });

    // If no exact matches found, return default result for the selected type
    // This makes the search more user-friendly for demo purposes
    if (matchingResults.length === 0) {
        if (type === "facturas") {
            // For invoices, always return default invoice for demo
            return [MOCK_SEARCH_RESULTS[0]]; // Return default invoice
        } else if (type === "clientes") {
            // For clients, always return default client for demo
            return [MOCK_SEARCH_RESULTS[1]]; // Return default client
        }
        // For pedidos, return empty if no matches
        return [];
    }

    return matchingResults;
}

export async function getInvoiceDetail(invoiceId: string): Promise<InvoiceDetail> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Return mock data with the requested ID
    return {
        ...MOCK_INVOICE_DETAIL,
        id: invoiceId,
        invoiceNumber: invoiceId,
    };
}
