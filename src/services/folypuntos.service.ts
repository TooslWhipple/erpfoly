import type { FolypuntosFormState, FolypuntosApiResponse } from "@/types/folypuntos.types";

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

/**
 * Mock function to fetch Folypuntos configuration
 * In production, this would call the actual API
 */
export async function getFolypuntosConfiguration(): Promise<FolypuntosFormState> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock data - in production, this would come from the API
    return {
        cash: {
            purchaseEquivalence: 10,
            saleEquivalence: 1,
        },
        credit: {
            purchaseEquivalence: 10,
            saleEquivalence: 1,
        },
        layaway: {
            purchaseEquivalence: 10,
            saleEquivalence: 1,
        },
    };
}

/**
 * Mock function to save Folypuntos configuration
 * In production, this would call the actual API
 */
export async function saveFolypuntosConfiguration(
    configuration: FolypuntosFormState
): Promise<FolypuntosApiResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate API validation
    const hasInvalidValues = Object.values(configuration).some(
        (config) =>
            config.purchaseEquivalence <= 0 ||
            config.saleEquivalence <= 0 ||
            !Number.isInteger(config.purchaseEquivalence) ||
            !Number.isFinite(config.saleEquivalence)
    );

    if (hasInvalidValues) {
        return {
            success: false,
            message: "Los valores deben ser números positivos válidos",
        };
    }

    // In production, this would save to the backend
    console.log("[Folypuntos] Saving configuration:", configuration);

    return {
        success: true,
        data: configuration,
        message: "Configuración guardada exitosamente",
    };
}
