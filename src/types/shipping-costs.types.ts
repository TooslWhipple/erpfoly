/**
 * Shipping costs (costos de envío) domain types.
 * Used for branch-level shipping cost configuration.
 */

export interface BranchShippingCost {
  id: string;
  name: string;
  shippingCost: number;
}

export interface ShippingCostsState {
  branches: BranchShippingCost[];
}

export interface SaveShippingCostsPayload {
  branches: { id: string; shippingCost: number }[];
}

export interface SaveShippingCostsResponse {
  success: boolean;
  message?: string;
  data?: BranchShippingCost[];
}
