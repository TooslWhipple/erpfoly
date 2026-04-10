// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PurchaseType {
  id: number;
  code: string;
  name: string;
}

export interface PointEarningRuleConfig {
  purchaseTypeId: number;
  amountToSpend: number;
  pointsAwarded: number;
  amountPerPoint: number;
}

export interface PointsConfigResponse {
  purchaseTypes: PurchaseType[];
  config: PointEarningRuleConfig[];
}

export interface PointsFormState {
  [purchaseTypeId: string]: {
    amountToSpend: number;
    pointsAwarded: number;
    amountPerPoint: number;
  };
}

export interface SavePointsConfigPayload {
  rules: PointEarningRuleConfig[];
}

export interface SavePointsConfigResponse {
  message: string;
}
