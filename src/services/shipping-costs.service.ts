import type {
  BranchShippingCost,
  SaveShippingCostsPayload,
  SaveShippingCostsResponse,
} from "@/types/shipping-costs.types";

// ============================================================================
// MOCK DATA - Realistic branch list (aligned with screenshot)
// ============================================================================

const MOCK_BRANCHES: BranchShippingCost[] = [
  { id: "1", name: "Campestre", shippingCost: 0 },
  { id: "2", name: "Carrera", shippingCost: 0 },
  { id: "3", name: "Estación", shippingCost: 0 },
  { id: "4", name: "Matamoros-Pedro Cárdenas", shippingCost: 0 },
  { id: "5", name: "Matamoros-Plaza Patio", shippingCost: 0 },
  { id: "6", name: "Matamoros-Brisas", shippingCost: 0 },
  { id: "7", name: "Reynosa-Av. Hidalgo", shippingCost: 0 },
  { id: "8", name: "Reynosa-Periferico", shippingCost: 0 },
  { id: "9", name: "Nuevo Laredo", shippingCost: 0 },
];

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

/**
 * Fetches shipping costs configuration per branch.
 * In production, this would call the actual API.
 */
export async function getBranchShippingCosts(): Promise<BranchShippingCost[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return MOCK_BRANCHES.map((b) => ({ ...b }));
}

/**
 * Saves shipping costs for all branches.
 * In production, this would send the payload to the backend.
 */
export async function saveBranchShippingCosts(
  payload: SaveShippingCostsPayload
): Promise<SaveShippingCostsResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const hasNegative = payload.branches.some((b) => b.shippingCost < 0);
  if (hasNegative) {
    return {
      success: false,
      message: "El costo de envío no puede ser negativo",
    };
  }

  // Simulate persistence (in real app, API would return updated data)
  console.log("[ShippingCosts] Saving:", payload);

  return {
    success: true,
    message: "Cambios guardados correctamente",
    data: payload.branches.map((item) => {
      const branch = MOCK_BRANCHES.find((b) => b.id === item.id);
      return {
        id: item.id,
        name: branch?.name ?? "",
        shippingCost: item.shippingCost,
      };
    }),
  };
}
