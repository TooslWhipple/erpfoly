export type ApportionmentCalculationType = 'CASH' | 'CARD' | 'CONFIRMED_SALES';

export interface ApportionmentBranchItem {
  branchId: number;
  branchName: string;
  zoneId: number | null;
  zoneName: string | null;
  baseAmount: number;
  globalPercentage: number;
  relativeZonePercentage: number;
}

export interface ApportionmentZoneItem {
  zoneId: number | null;
  zoneName: string;
  totalBaseAmount: number;
  globalPercentage: number;
  branches: ApportionmentBranchItem[];
}

export interface ApportionmentResponse {
  calculationType: ApportionmentCalculationType;
  startDate: string | null;
  endDate: string | null;
  totalGlobalAmount: number;
  branches: ApportionmentBranchItem[];
  zones: ApportionmentZoneItem[];
}

export interface GetApportionmentParams {
  calculationType?: ApportionmentCalculationType;
  startDate?: string;
  endDate?: string;
}
