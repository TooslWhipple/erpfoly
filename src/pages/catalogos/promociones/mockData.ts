// ============================================================================
// MOCK DATA
// ============================================================================

import type {
    PromotionDepartment,
    PromotionArticle,
    PromotionBranch,
    PromotionSupplier,
    Promotion,
} from "./types";

export const MOCK_DEPARTMENTS: PromotionDepartment[] = [
    { id: "01", code: "01", name: "Muebles" },
    { id: "02", code: "02", name: "Colchones" },
    { id: "03", code: "03", name: "Línea Infantil" },
    { id: "04", code: "04", name: "Línea Blanca" },
    { id: "05", code: "05", name: "Muebles Tubulares" },
    { id: "06", code: "06", name: "Cocinetas" },
    { id: "07", code: "07", name: "Ventiladores / Climas" },
    { id: "08", code: "08", name: "Línea Blanca" },
    { id: "09", code: "09", name: "Línea Blanca" },
    { id: "11", code: "11", name: "Línea Blanca" },
];

export const MOCK_ARTICLES: PromotionArticle[] = [
    {
        id: "1",
        code: "04ET12345",
        status: "Draft",
        name: "Estufa Mabe 30 pulgadas 4 quemadores",
        department: "04 - Línea Blanca",
        line: "ET - Estufas",
        supplier: "Mirage - Norage S.A. De C.V.",
        price: 12590,
    },
    {
        id: "2",
        code: "04ET12345",
        status: "Activo",
        name: "Estufa Mabe 30 pulgadas 4 quemadores",
        department: "04 - Línea Blanca",
        line: "ET - Estufas",
        supplier: "Mirage - Norage S.A. De C.V.",
        price: 12590,
    },
    {
        id: "3",
        code: "04ET12345",
        status: "Activo",
        name: "Estufa Mabe 30 pulgadas 4 quemadores",
        department: "04 - Línea Blanca",
        line: "ET - Estufas",
        supplier: "Mirage - Norage S.A. De C.V.",
        price: 12590,
    },
    {
        id: "4",
        code: "04LV67890",
        status: "Activo",
        name: "Lavadora Samsung 18kg WA18R6380BV",
        department: "04 - Línea Blanca",
        line: "LV - Lavadoras",
        supplier: "Samsung Electronics",
        price: 13299,
    },
    {
        id: "5",
        code: "04RF11111",
        status: "Activo",
        name: "Refrigerador LG 22 pies GS65SPP1",
        department: "04 - Línea Blanca",
        line: "RF - Refrigeradores",
        supplier: "LG Electronics",
        price: 18999,
    },
];

export const MOCK_BRANCHES: PromotionBranch[] = [
    { id: 1, name: "Foly Muebles Matriz" },
    { id: 2, name: "Foly Muebles Tampico Centro" },
    { id: 3, name: "Foly Muebles Tampico Aeropuerto" },
    { id: 4, name: "Foly Muebles Avenida Monterrey" },
    { id: 5, name: "Foly Muebles Ejército Mexicano" },
    { id: 6, name: "Foly Muebles Altamira" },
    { id: 7, name: "Foly Muebles Bodega Tampico" },
    { id: 8, name: "Foly Muebles San Luis Potosí Carranza" },
    { id: 9, name: "Foly Muebles San Luis Potosí Soledad" },
    { id: 10, name: "Foly Muebles Poza Rica" },
    { id: 11, name: "Foly Muebles Pánuco" },
    { id: 12, name: "Foly Muebles Veracruz Puerto" },
    { id: 13, name: "Foly Muebles Coatzacoalcos" },
];

export const MOCK_SUPPLIERS_FOR_SELECTION: Array<{
    id: number;
    name: string;
}> = [
    { id: 34340, name: "Arlix Muebles y Electrodomésticos S.A. de C.V." },
    { id: 12345, name: "Mirage - Norage S.A. De C.V." },
    { id: 34341, name: "Hogar Integral de Occidente S.A. de C.V." },
    { id: 9323, name: "Eztra Equipos del Hogar S.A. de C.V." },
    { id: 9324, name: "Equipos Domésticos Modernos S. de R.L. de C.V." },
    { id: 12346, name: "Frosen Línea Blanca S. de R.L. de C.V." },
    { id: 34342, name: "Nevora Distribuidora Doméstica S.A. de C.V." },
    { id: 12347, name: "Sereno Línea Blanca y Hogar S.A. de C.V." },
    { id: 34343, name: "Morvik Soluciones Domésticas S.A. de C.V." },
];

export const MOCK_PROMOTION: Promotion = {
    id: 1,
    name: "Buen fin",
    percentage: 15,
    applicationType: "Crédito",
    months: [12],
    days: [],
    clientLevels: [
        { level: 1, advancePercentage: 5 },
        { level: 2, advancePercentage: 15 },
        { level: 3, advancePercentage: 25 },
    ],
    startDate: "2025-11-13",
    endDate: "2025-11-17",
    departments: [MOCK_DEPARTMENTS[3]], // Línea Blanca
    articles: [MOCK_ARTICLES[1], MOCK_ARTICLES[2]],
    branches: [MOCK_BRANCHES[0]], // Matriz
    suppliers: [
        { id: 1, supplierId: 12345, supplierName: "Mirage - Norage S.A. De C.V." },
    ],
};
