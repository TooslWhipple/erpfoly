export type BranchGroupingStatus = "ACTIVE" | "INACTIVE";

export interface BranchGroupingListItem {
  id: number;
  name: string;
  status: BranchGroupingStatus;
  createdAt?: string;
  updatedAt?: string | null;
  branches: { id: number; name: string }[];
}

export interface BranchGroupingCatalogItem {
  id: number;
  name: string;
}

export interface BranchGroupingAvailableBranch {
  id: number;
  name: string;
}

export interface GetBranchGroupingsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: BranchGroupingStatus;
}

export interface CreateBranchGroupingPayload {
  name: string;
  branchIds?: number[];
}

export interface UpdateBranchGroupingPayload {
  name?: string;
  status?: BranchGroupingStatus;
  branchIds?: number[];
}
