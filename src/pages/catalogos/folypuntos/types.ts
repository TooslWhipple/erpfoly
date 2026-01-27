// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type PaymentType = "cash" | "credit" | "layaway";

export interface FolypuntosConfiguration {
    /** Payment type this configuration applies to */
    paymentType: PaymentType;
    /** Amount in pesos to earn 1 Folypunto */
    purchaseEquivalence: number;
    /** Value in pesos of 1 Folypunto when redeemed */
    saleEquivalence: number;
}

export interface FolypuntosFormState {
    cash: {
        purchaseEquivalence: number;
        saleEquivalence: number;
    };
    credit: {
        purchaseEquivalence: number;
        saleEquivalence: number;
    };
    layaway: {
        purchaseEquivalence: number;
        saleEquivalence: number;
    };
}

export interface FolypuntosApiResponse {
    success: boolean;
    data?: FolypuntosFormState;
    message?: string;
}
