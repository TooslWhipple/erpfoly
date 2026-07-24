export interface MoratoryRateConfigResponse {
  annualRate: number;
  updatedAt: string | null;
  updatedBy: number | null;
}

export interface UpdateMoratoryRateConfigPayload {
  annualRate: number;
}
