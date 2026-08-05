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

export interface ApportionmentConfig {
  id: number;
  calculationDay: number;
  calculationType: ApportionmentCalculationType;
  updatedAt: string;
}

export interface ApportionmentSnapshotItem {
  id: number;
  calculationDate: string;
  periodStartDate: string;
  periodEndDate: string;
  calculationType: ApportionmentCalculationType;
  totalGlobalAmount: number;
}

export interface ApportionmentSnapshotDetail extends ApportionmentSnapshotItem {
  data: ApportionmentResponse;
}
