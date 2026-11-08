export type ExpenseRequestClassification =
  | "VIATICOS"
  | "SOLICITUD_GASTOS"
  | "CAJA_CHICA";

export type ExpenseRequestStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
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
  debtor?: {
    id: number;
    employeeNumber: string;
    fullName: string;
    responsibles?: Array<{
      userId: number;
      fullName: string;
      username: string;
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
  IN_VERIFICATION: "En comprobación",
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


