export type CancelPurchaseReasonId = "REASON_1" | "REASON_2" | "REASON_3" | "OTHER";

export interface CancelPurchaseReason {
  id: CancelPurchaseReasonId;
  title: string;
  description: string;
  allowsCustomText?: boolean;
}

export interface CancelPurchasePayload {
  purchaseId: string;
  reasonId: CancelPurchaseReasonId;
  customReason?: string;
}
