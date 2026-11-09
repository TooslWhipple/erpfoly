export type ExpenseRequestClassification =
  | "VIATICOS"
  | "SOLICITUD_GASTOS"
  | "CAJA_CHICA";

export type ExpenseRequestStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "IN_COMPROBATION"
  | "IN_VERIFICATION"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export type ExpenseVoucherStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface ExpenseVoucher {
  id: number;
  date: string;
  concept: string;
  amount: number;
  supplierName?: string | null;
  supplierRfc?: string | null;
  fiscalUuid?: string | null;
  xmlFileUrl?: string | null;
  pdfFileUrl?: string | null;
  imageFileUrl?: string | null;
  status: ExpenseVoucherStatus;
  rejectionReason?: string | null;
  reviewedBy?: {
    id: number;
    fullName: string;
    username: string;
  } | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface ExpenseRequestListItem {
  id: number;
  folio: string;
  classification: ExpenseRequestClassification;
  startDate: string;
  endDate: string;
  destination?: string | null;
  description?: string | null;
  requestedAmount: number;
  verifiedAmount: number;
  reimbursedAmount: number;
  status: ExpenseRequestStatus;
  dispersionDate?: string | null;
  dispersedAt?: string | null;
  paymentReference?: string | null;
  authorizedAt?: string | null;
  category: {
    id: number;
    code: string;
    name: string;
    configuration?: string | null;
  };
  branch?: {
    id: number;
    name: string;
  } | null;
  debtor?: {
    id: number;
    employeeNumber: string;
    fullName: string;
  } | null;
  applicant?: {
    id: number;
    username: string;
    fullName: string;
  } | null;
  responsible?: {
    id: number;
    username: string;
    fullName: string;
  } | null;
  vouchersCount: number;
  createdAt: string;
}

export interface ExpenseRequestDetail extends ExpenseRequestListItem {
  rejectionReason?: string | null;
  authorizedBy?: {
    id: number;
    fullName: string;
    username: string;
  } | null;
  authorizedAt?: string | null;
  concludedBy?: {
    id: number;
    fullName: string;
    username: string;
  } | null;
  concludedAt?: string | null;
  reimbursementSchedule?: {
    id: number;
    folio: string;
    amount: number;
    scheduledDate: string;
    status: ScheduledPaymentStatus;
    paymentReference?: string | null;
    dispersedAt?: string | null;
  } | null;
  debtor?: {
    id: number;
    employeeNumber: string;
    fullName: string;
    responsibles?: Array<{
      id: number;
      responsibleDebtorId: number;
      employeeNumber: string;
      fullName: string;
      userId: number | null;
      username: string | null;
    }>;
  } | null;
  vouchers: ExpenseVoucher[];
  updatedAt?: string | null;
}

export interface CreateExpenseRequestPayload {
  classification: ExpenseRequestClassification;
  internalPayableCategoryId: number;
  startDate: string;
  endDate: string;
  destination?: string;
  description?: string;
  requestedAmount: number;
  diverseDebtorId?: number;
  branchId?: number;
  responsibleUserId?: number;
}

export type UpdateExpenseRequestPayload = Partial<CreateExpenseRequestPayload>;

export interface ListExpenseRequestsParams {
  page?: number;
  limit?: number;
  search?: string;
  classification?: ExpenseRequestClassification;
  status?: ExpenseRequestStatus;
  applicantUserId?: number;
  diverseDebtorId?: number;
  branchId?: number;
}

export interface CreateExpenseVoucherPayload {
  date: string;
  concept: string;
  amount: number;
  supplierName?: string;
  supplierRfc?: string;
  fiscalUuid?: string;
  xmlFile?: File;
  pdfFile?: File;
  imageFile?: File;
}

export interface ReviewExpenseVoucherPayload {
  action: "ACCEPT" | "REJECT";
  rejectionReason?: string;
}

export interface RejectExpenseRequestPayload {
  rejectionReason: string;
}

export const EXPENSE_REQUEST_CLASSIFICATION_LABELS: Record<
  ExpenseRequestClassification,
  string
> = {
  VIATICOS: "Viáticos",
  SOLICITUD_GASTOS: "Solicitud de gastos",
  CAJA_CHICA: "Caja chica",
};

export const EXPENSE_REQUEST_STATUS_LABELS: Record<
  ExpenseRequestStatus,
  string
> = {
  DRAFT: "Borrador",
  PENDING_APPROVAL: "Por autorizar",
  APPROVED: "Autorizada",
  IN_COMPROBATION: "En comprobación",
  IN_VERIFICATION: "En verificación",
  COMPLETED: "Concluida",
  REJECTED: "Rechazada",
  CANCELLED: "Cancelada",
};

export interface ExpenseRequestsSummary {
  totalRequested: number;
  totalVerified: number;
  totalPending: number;
  totalReimbursed: number;
  pendingApprovalCount: number;
  inVerificationCount: number;
  completedCount: number;
  totalCount: number;
}

export type ScheduledPaymentCategory =
  | "PROVEEDOR"
  | "GASTO_GENERAL"
  | "VIATICOS"
  | "SOLICITUD_GASTOS"
  | "CAJA_CHICA"
  | "REEMBOLSO_VIATICOS";

export type ScheduledPaymentStatus = "PENDIENTE" | "PAGADO" | "CANCELADO";

export interface ScheduledPaymentItem {
  id: number;
  expenseRequestId?: number | null;
  folio: string;
  category: ScheduledPaymentCategory;
  classification?: ExpenseRequestClassification;
  beneficiary: string;
  beneficiaryRfc: string;
  concept: string;
  bankName: string;
  clabe: string;
  scheduledDate: string;
  dispersionDate: string;
  dueDate: string;
  startDate?: string;
  endDate?: string;
  destination?: string | null;
  description?: string | null;
  amount: number;
  requestedAmount: number;
  status: ScheduledPaymentStatus;
  selectedForDispersion: boolean;
  dispersionMethod?: string | null;
  paymentReference?: string | null;
  dispersedAt?: string | null;
  authorizedAt?: string | null;
  branch?: { id: number; name: string } | null;
  debtor?: {
    id: number;
    employeeNumber: string;
    fullName: string;
    rfc?: string | null;
    clabe?: string | null;
  } | null;
  authorizedBy?: {
    id: number;
    username: string;
    fullName: string;
  } | null;
  dispersedBy?: {
    id: number;
    username: string;
    fullName: string;
  } | null;
  createdAt: string;
}

export interface PaymentScheduleSummary {
  pendingCount: number;
  pendingAmount: number;
  dispersedCount: number;
  dispersedAmount: number;
  totalCount: number;
  totalAmount: number;
}

export interface AvailableScheduleDate {
  date: string;
  count: number;
  totalAmount: number;
}

export interface PaymentScheduleResponse {
  rows: ScheduledPaymentItem[];
  availableDates: AvailableScheduleDate[];
  summary: PaymentScheduleSummary;
}

export interface DisperseExpenseRequestsPayload {
  items: Array<{
    id: number;
    dispersionDate?: string;
  }>;
  scheduledDate?: string;
}

export interface CompleteExpenseVerificationPayload {
  scheduledDate?: string;
  scheduleReimbursement?: boolean;
}




