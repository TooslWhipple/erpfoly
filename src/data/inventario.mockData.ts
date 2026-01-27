// ============================================================================
// MOCK DATA FOR INVENTORY DETAIL
// ============================================================================

import type {
    InventoryDetail,
    InventorySummary,
    BranchInventory,
    SalesData,
    ActivityLogEntry,
    ProductSupplier,
    PricingStrategy,
    ProductPackage,
    ProductGallery,
} from "@/types/inventario.types";

export const MOCK_INVENTORY_DETAIL: InventoryDetail = {
    id: "1",
    sku: "04ET12345",
    code: "04ET 12345",
    name: "Lavadora Mabe 22kg LMH7220SWBABO Blanca",
    shortName: "Lavadora Mabe 22kg LMH7220SWBABO Blanca",
    description:
        "LAVADORA MABE 22KG LMH7220SWBABO BLANCA Tamaño: Lavadora Mabe 22 kg, Color: Blanco, Estilo: Lavadora Automática. Modelo: LMH7220SWBABO, Panel 5 Perillas, 5 Tamaños de Carga, 6 Niveles de Temperatura, Ahorradora Aquasaver, Despachador de Suavizante, Despachador de Detergente, Tapa Metalica Amortiguada, Canasta Sphere Care",
    status: "active",
    department: {
        id: "4",
        code: "04",
        name: "Línea Blanca",
    },
    line: {
        id: "LV",
        code: "LV",
        name: "Lavadora",
    },
    warranty: "Póliza anexa",
};

export const MOCK_INVENTORY_SUMMARY: InventorySummary = {
    inStock: 98,
    orders: 10,
    inTransit: 0,
    damaged: 2,
};

export const MOCK_BRANCH_INVENTORY: BranchInventory[] = [
    {
        id: "1",
        branchName: "Matriz",
        stock: 14,
        lastPrice: 7900.0,
    },
    {
        id: "2",
        branchName: "Carrera",
        stock: 2,
        lastPrice: 7900.0,
    },
    {
        id: "3",
        branchName: "Estación",
        stock: 4,
        lastPrice: 7900.0,
    },
    {
        id: "4",
        branchName: "Matamoros-Pedro Cárdenas",
        stock: 10,
        lastPrice: 7900.0
    },
    {
        id: "5",
        branchName: "Matamoros-Plaza Patio",
        stock: 9,
        lastPrice: 7900.0,
    },
];

export const MOCK_SALES_DATA: SalesData = {
    lastMonth: 23,
    previousMonth: 19,
    percentageChange: 18,
    monthlyData: [
        { month: "Enero", monthShort: "Ene", sales: 6 },
        { month: "Febrero", monthShort: "Feb", sales: 8 },
        { month: "Marzo", monthShort: "Mar", sales: 6 },
        { month: "Abril", monthShort: "Abr", sales: 20 },
        { month: "Mayo", monthShort: "May", sales: 8 },
        { month: "Junio", monthShort: "Jun", sales: 10 },
        { month: "Julio", monthShort: "Jul", sales: 29 },
        { month: "Agosto", monthShort: "Ago", sales: 22 },
        { month: "Septiembre", monthShort: "Sep", sales: 6 },
        { month: "Octubre", monthShort: "Oct", sales: 0 },
    ],
};

export const MOCK_ACTIVITY_LOG: ActivityLogEntry[] = [
    {
        id: "1",
        type: "edition",
        performedBy: "Francisco Gonzales",
        description: "Se ha actualizado el precio del artículo de $8,600.00 a 7,900.00",
        timestamp: "2025-10-03T15:32:00",
        date: "3 de Octubre, 2025",
        time: "15:32",
    },
    {
        id: "2",
        type: "inventory",
        performedBy: "Mariana Fuentes",
        description: "Se ha registrado una entrada a inventario de 15 unidades",
        timestamp: "2025-10-01T09:15:00",
        date: "1 de Octubre, 2025",
        time: "09:15",
    },
    {
        id: "3",
        type: "sales",
        performedBy: "Arturo Perez",
        description: "Se ha registrado una venta de 1 unidades",
        timestamp: "2025-09-30T09:15:00",
        date: "30 de Septiembre, 2025",
        time: "09:15",
    },
    {
        id: "4",
        type: "sales",
        performedBy: "Arturo Perez",
        description: "Se ha registrado una venta de 2 unidades",
        timestamp: "2025-09-30T09:15:00",
        date: "30 de Septiembre, 2025",
        time: "09:15",
    },
    {
        id: "5",
        type: "inventory",
        performedBy: "Mariana Fuentes",
        description: "Se ha registrado una entrada a inventario de 15 unidades",
        timestamp: "2025-09-28T14:20:00",
        date: "28 de Septiembre, 2025",
        time: "14:20",
    },
];

export const MOCK_SUPPLIERS: ProductSupplier[] = [
    {
        id: "1",
        supplierId: "09323",
        supplierName: "Mabe - Mabe S.A. De C.V.",
        status: "principal",
    },
];

export const MOCK_PRICING_STRATEGY: PricingStrategy = {
    cost: 18100.03,
    listPrice: 21909.03,
    cashPrice: 21909.03,
};

export const MOCK_PACKAGES: ProductPackage[] = [
    {
        id: "1",
        articleName: "Secadora Mabe 20kg SMG26N5MNBAB0 Blanca",
        quantity: 1,
        lastPrice: 9429.0,
        packagePrice: 15844.3,
    },
];

export const MOCK_GALLERY: ProductGallery = {
    images: [
        "/api/placeholder/400/300",
        "/api/placeholder/400/300",
        "/api/placeholder/400/300",
        "/api/placeholder/400/300",
        "/api/placeholder/400/300",
    ],
};
