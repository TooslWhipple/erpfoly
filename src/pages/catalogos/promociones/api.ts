// ============================================================================
// API FUNCTIONS
// ============================================================================

import type { Promotion, PromotionFormState } from "./types";
import { MOCK_PROMOTION } from "./mockData";

export async function getPromotion(id: number): Promise<Promotion | null> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    if (id === 1) {
        return MOCK_PROMOTION;
    }
    
    return null;
}

export async function savePromotion(
    promotion: Omit<Promotion, "id"> & { id?: number }
): Promise<Promotion> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    console.log("[Promotion API] Saving promotion:", promotion);
    
    return {
        ...promotion,
        id: promotion.id || Date.now(),
    };
}
