export interface PromotionSupplier {
  id: number;
  supplierId: number;
  supplierName: string;
}

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
  selectedBranchIds: number[];
  suppliers: PromotionSupplier[];
}

export interface FormErrors {
  [key: string]: string | undefined;
}
