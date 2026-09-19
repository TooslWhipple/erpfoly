export interface PromotionListItem {
  id: number;
  code: string;
  name: string;
  discount_rate: number;
  start_date: string;
  end_date: string | null;
  purchase_type_code: string;
  purchase_type_label: string;
  department_summary: string;
  branch_summary: string;
}

export interface PromotionSupplier {
  id: number;
  supplierId: number;
  supplierName: string;
}

export interface PromotionProductSelectionState {
  selectAll: boolean;
  excludedIds: number[];
  includedIds: number[];
}

export const EMPTY_PRODUCT_SELECTION: PromotionProductSelectionState = {
  selectAll: false,
  excludedIds: [],
  includedIds: [],
};

export interface PromotionFormState {
  name: string;
  percentage: string;
  advancePercentage: string;
  purchaseTypeId: number | null;
  creditTermIds: number[];
  layawayTermIds: number[];
  customerLevelDownPayments: Array<{
    customer_level_id: number;
    percentage: number;
  }>;
  startDate: string;
  endDate: string | null;
  hasEndDate: boolean;
  selectedDepartmentIds: number[];
  selectedLineIds: number[];
  selectedProductIds: number[];
  productSelection: PromotionProductSelectionState;
  selectedBranchIds: number[];
  suppliers: PromotionSupplier[];
}

export interface FormErrors {
  [key: string]: string | undefined;
}
