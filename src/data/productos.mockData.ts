import type {
    Product,
    CostHistoryEntry,
    ProductBranch,
    ProductBasePrice,
    CostBasisForCalculation,
} from "@/types/productos.types";

// ============================================================================
// MOCK DATA
// ============================================================================

export const MOCK_DEPARTMENTS = [
    { value: "1", label: "04 - Línea Blanca" },
    { value: "2", label: "02 - Muebles" },
    { value: "3", label: "03 - Entretenimiento" },
    { value: "4", label: "06 - Electrónica" },
];

/** Numeric `value` matches backend product line ids (POST /products `lineId`). */
export const MOCK_LINES = [
    { value: "1", label: "LV - Lavadora" },
    { value: "2", label: "RF - Refrigerador" },
    { value: "3", label: "CM - Comedor" },
    { value: "4", label: "RC - Recámara" },
    { value: "5", label: "TV - Televisores" },
    { value: "6", label: "SL - Sala" },
    { value: "7", label: "MW - Microondas" },
    { value: "8", label: "ES - Estufa" },
    { value: "9", label: "HO - Horno" },
    { value: "10", label: "LA - Lavavajillas" },
    { value: "11", label: "SE - Secadora" },
];

export const MOCK_SUPPLIERS = [
    { value: "1", label: "Muebles América" },
    { value: "2", label: "Samsung Electronics" },
    { value: "3", label: "Mabe S.A de C.V" },
    { value: "4", label: "Muebles Dico" },
    { value: "5", label: "Sealy México" },
    { value: "6", label: "LG Electronics" },
    { value: "7", label: "Whirlpool México" },
    { value: "8", label: "Bosch México" },
];

// Mock suppliers for the add supplier modal with ID and name
export interface SupplierForSelection {
    id: number;
    name: string;
}

export const MOCK_SUPPLIERS_FOR_SELECTION: SupplierForSelection[] = [
    { id: 34340, name: "Artix Muebles y Electrodomésticos S.A. de C.V." },
    { id: 12345, name: "Mirage - Norage S.A. De C.V." },
    { id: 34340, name: "Hogar Integral de Occidente S.A. de C.V." },
    { id: 9323, name: "Eztra Equipos del Hogar S.A. de C.V." },
    { id: 9323, name: "Equipos Domésticos Modernos S. de R.L. de C.V." },
    { id: 12345, name: "Frosen Línea Blanca S. de R.L. de C.V." },
    { id: 34340, name: "Nevora Distribuidora Doméstica S.A. de C.V." },
    { id: 12345, name: "Sereno Línea Blanca y Hogar S.A. de C.V." },
    { id: 34340, name: "Morvik Soluciones Domésticas S.A. de C.V." },
    { id: 12345, name: "Plenix Hogar y Estilo S.A. de C.V." },
    { id: 9323, name: "Velmor Muebles y Confort S.A. de C.V." },
    { id: 9323, name: "Veyra Electrodomésticos y Muebles SA de CV" },
];

export const MOCK_BRANCHES = [
    { id: 1, name: "Foly Muebles Matriz" },
    { id: 2, name: "Foly Muebles Tampico Centro" },
    { id: 3, name: "Foly Muebles Tampico Aeropuerto" },
    { id: 4, name: "Foly Muebles Avenida Monterrey" },
    { id: 5, name: "Foly Muebles Ejército Mexicano" },
    { id: 6, name: "Foly Muebles Altamira" },
    { id: 7, name: "Foly Muebles Bodega Tampico" },
];

export const CURRENCIES = [
    { value: "MXN", label: "MXN" },
    { value: "USD", label: "USD" },
];

export const COST_BASIS_FOR_PRICE_OPTIONS: Array<{ value: CostBasisForCalculation; label: string }> = [
    { value: "last_cost", label: "Último costo" },
    { value: "list_cost", label: "Costo de lista" },
    { value: "average_cost", label: "Costo promedio" },
];

export const DEFAULT_PRODUCT_BASE_PRICES: ProductBasePrice[] = [
    { id: "bp-default-1", name: "Contado", marginPercent: 35.75, lastEditedBy: "Gerente" },
];

export const MOCK_COST_HISTORY: CostHistoryEntry[] = [
    { id: "1", date: "15 de Octubre, 2025", price: 9349.0, changePercentage: 2, changeType: "increase" },
    { id: "2", date: "2 de Octubre, 2025", price: 9210.0, changePercentage: 1.2, changeType: "increase" },
    { id: "3", date: "4 de Septiembre, 2025", price: 9200.0, changePercentage: 1.2, changeType: "increase" },
    { id: "4", date: "4 de Agosto, 2025", price: 9150.0, changePercentage: 1.2, changeType: "increase" },
    { id: "5", date: "20 de Julio, 2025", price: 8990.0, changePercentage: 1.2, changeType: "increase" },
    { id: "6", date: "1 de Julio, 2025", price: 8980.0, changePercentage: 1.2, changeType: "increase" },
    { id: "7", date: "16 de Junio, 2025", price: 8890.0, changePercentage: 1.2, changeType: "increase" },
];

export function getInitialBranches(): ProductBranch[] {
    return MOCK_BRANCHES.map((branch) => ({
        id: `branch-${branch.id}`,
        branchId: branch.id,
        branchName: branch.name,
        enabled: false,
        minInventory: 0,
        maxInventory: 20,
    }));
}

// Mock articles for package selection with supplier and price info
export interface ArticleForPackage {
    id: string;
    name: string;
    supplierId: number;
    supplierName: string;
    lastPrice: number;
}

export const MOCK_ARTICLES: ArticleForPackage[] = [
    { id: "1", name: "Secadora Whirlpool 20kg 7MWGD1930JM Blanca", supplierId: 7, supplierName: "Whirlpool México", lastPrice: 13299.0 },
    { id: "2", name: "Lavadora Samsung 18kg WA18R6380BV Gris", supplierId: 2, supplierName: "Samsung Electronics", lastPrice: 13299.0 },
    { id: "3", name: "Refrigerador LG 22 pies GS65SPP1 Acero", supplierId: 6, supplierName: "LG Electronics", lastPrice: 18999.0 },
    { id: "4", name: "Microondas Mabe 1.1 pies MML1110BDB Blanco", supplierId: 3, supplierName: "Mabe S.A de C.V", lastPrice: 2499.0 },
    { id: "5", name: "Estufa Mabe 4 Quemadores EM4444BDB Negra", supplierId: 3, supplierName: "Mabe S.A de C.V", lastPrice: 5499.0 },
    { id: "6", name: "Horno Eléctrico Empotrable Samsung NE63K6711SS", supplierId: 2, supplierName: "Samsung Electronics", lastPrice: 8999.0 },
];
