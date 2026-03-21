import type { Product } from "@/types/productos.types";
import { MOCK_BRANCHES } from "@/data/productos.mockData";

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

export async function getProduct(id: string): Promise<Product | null> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (id === "nuevo") {
        return null;
    }

    // Simulate existing product data
    if (id === "1") {
        return {
            id: "1",
            code: "ART-001",
            departmentId: 1,
            lineId: "LV",
            description: "Lavadora Mabe 19kg 121345",
            shortName: "Lavadora Mabe 19kg",
            warrantyType: "months",
            warrantyMonths: 12,
            suppliers: [
                {
                    id: "1",
                    supplierId: 3,
                    supplierName: "Mabe S.A de C.V",
                    isDefault: true,
                },
            ],
            price: {
                listCost: 9200,
                currency: "MXN",
                exchangeRate: 1.0,
                iva: 16,
                averageCost: 9100,
                lastCost: 9150,
                liquidation: false,
                costBasisForCalculation: "last_cost",
                basePrices: [
                    { id: "bp-1", name: "Contado", marginPercent: 35.75, lastEditedBy: "Gerente" },
                ],
            },
            branches: MOCK_BRANCHES.map((branch, index) => ({
                id: `branch-${branch.id}`,
                branchId: branch.id,
                branchName: branch.name,
                enabled: index < 3 || index === 6,
                minInventory: 0,
                maxInventory: 20,
            })),
            images: [],
        };
    }

    return null;
}

export async function saveProduct(product: Omit<Product, "id"> & { id?: string }): Promise<Product> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const savedProduct: Product = {
        id: product.id || Date.now().toString(),
        code: product.code,
        departmentId: product.departmentId,
        lineId: product.lineId,
        description: product.description,
        shortName: product.shortName,
        warrantyType: product.warrantyType,
        warrantyMonths: product.warrantyMonths,
        suppliers: product.suppliers,
        price: product.price,
        branches: product.branches,
        images: product.images,
    };
    console.log("[API] Saved product:", savedProduct);
    return savedProduct;
}
