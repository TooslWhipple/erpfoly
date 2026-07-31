export type SupplierPayableStatus = "pending" | "paid" | "overdue";

export type SupplierPayableStatusTab = "all" | SupplierPayableStatus;

export type SupplierPayablePaymentStatus = "paid" | "scheduled";

export interface SupplierPayableListItem {
  id: string;
  periodLabel: string;
  supplierId: string;
  supplierName: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  balance: number;
  status: SupplierPayableStatus;
  hasDiscrepancies: boolean;
}

export interface SupplierPayableMovement {
  id: string;
  date: string;
  concept: string;
  linkId?: string;
  cargo?: number;
  venta?: number;
  requiresAttention?: boolean;
}

export interface SupplierPayablePayment {
  id: string;
  date: string;
  registeredBy: string;
  status: SupplierPayablePaymentStatus;
  amount: number;
}

export interface SupplierPayableStatement {
  id: string;
  periodLabel: string;
  supplierId: string;
  supplierName: string;
  dueDate: string;
  dueDateLabel: string;
  amount: number;
  paidAmount: number;
  balance: number;
  status: SupplierPayableStatus;
  movements: SupplierPayableMovement[];
  payments: SupplierPayablePayment[];
  cargoSubtotal: number;
  ventaSubtotal: number;
}

export interface SupplierPayableSummary {
  totalPending: number;
  overdue: number;
  dueSoon: number;
}

export interface SupplierPayableDiscrepancy {
  id: string;
  statementId: string;
  periodLabel: string;
  supplierName: string;
  movementId: string;
  movementConcept: string;
  movementDate: string;
  amount: number;
}

export interface SchedulePaymentPayload {
  amount: number;
  notes?: string;
  scheduledDate: string;
  receiptFileName?: string;
}
