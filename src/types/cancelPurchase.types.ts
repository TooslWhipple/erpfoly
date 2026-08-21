export type SaleCancelBlockReason =
  | "IN_ROUTE"
  | "DELIVERED"
  | "ALREADY_CANCELLED";

export interface SaleCancelReason {
  id: number;
  code: string;
  name: string;
  description: string | null;
  allowsCustomText: boolean;
}

export interface CancelClientPurchasePayload {
  reasonId: number;
  notes?: string;
}
