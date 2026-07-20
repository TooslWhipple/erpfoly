export type SearchType = "facturas" | "clientes" | "pedidos";

export type InvoiceStatus = "activo" | "cancelado" | "pagado";

export type ArticleStatus =
  | "entregado"
  | "reparacion"
  | "pendiente"
  | "cancelado"
  | "esperando_recuperacion"
  | "recuperado";

export type InvoicePaymentType = "credito" | "contado";

export type ServiceOrderStatus =
  | "por_realizar"
  | "listo_para_entregar"
  | "finalizada";

export type ServiceOrderAction =
  | "reparacion"
  | "reemplazar"
  | "cancelar_venta";

export type ServiceOrderRepairBy = "interna" | "terceros";

export type ServiceOrderReplacementBy = "proveedor" | "foly";

export type ServiceOrderCostAssignedTo = "proveedor" | "foly";

export type ServiceOrderRepairPlace = "bodega" | "domicilio";

export type ServiceOrderRecoveryReceiver =
  | "chofer"
  | "empleado"
  | "no_se_recoge";

export type ServiceOrderApprovalMethod = "llamada" | "encuesta";

export interface InvoiceArticle {
  id: string;
  code: string;
  status: ArticleStatus;
  description: string;
  price: number;
  promotions: number;
  total: number;
  points: number;
  supplier?: string;
  deliveryMethod?: string;
  serialNumber?: string;
  quantity?: number;
  serviceOrderId?: string;
  hasRecoveryOrder?: boolean;
}

export interface InvoiceActivity {
  id: string;
  date: string;
  type: "payment" | "adjustment" | "note" | "status_change";
  description: string;
  amount?: number;
}

export interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  purchaseDate: string;
  paymentType: InvoicePaymentType;
  status: InvoiceStatus;
  initialCost: number;
  totalPayments: number;
  remaining: number;
  paymentDate: string;
  nextPayment: number;
  currentPayment: number;
  totalPaymentsCount: number;
  articles: InvoiceArticle[];
  activities: InvoiceActivity[];
  summary: {
    subtotalWithoutTax: number;
    tax: number;
    amountWithTax: number;
    luxuryTax: number;
    total: number;
  };
}

export interface SearchResult {
  id: string;
  type: SearchType;
  title: string;
  subtitle?: string;
  metadata?: Record<string, string>;
}

export interface CreateServiceOrderPayload {
  invoiceId: string;
  articleId: string;
  quantity: number;
  serialNumber: string;
  complaint: string;
  observations: string;
  evidenceFiles: File[];
}

export interface ServiceOrderQueja {
  articleId: string;
  quantity: number;
  serialNumber: string;
  complaint: string;
  evidenceUrls: string[];
  observations: string;
}

export interface ServiceOrderIndicaciones {
  action: ServiceOrderAction;
  repairBy: ServiceOrderRepairBy;
  repairSupplierId: number | null;
  addCost: boolean;
  hours: number;
  cost: number;
  costAssignedTo: ServiceOrderCostAssignedTo;
  repairPlace: ServiceOrderRepairPlace;
  address: string;
  scheduledDate: string;
  damageTypeId: string;
  authorizedById: string;
  observations: string;
  replacementBy: ServiceOrderReplacementBy;
  branchId: number | null;
  recoveryReceiver: ServiceOrderRecoveryReceiver;
  assignedDriverId: number | null;
  assignedEmployeeId: number | null;
}

export interface ServiceOrderSolucion {
  isSolved: boolean;
  solvedDate: string;
  approvalMethod: ServiceOrderApprovalMethod;
  registerAsDamagedGoods: boolean;
  damageTypeId: string;
  observations: string;
  deliveredSolutionId: string;
  acceptanceLetterUrl: string;
  authorizedById: string;
}

export interface ServiceOrder {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  title: string;
  status: ServiceOrderStatus;
  purchaseDate: string;
  paymentType: InvoicePaymentType;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  generatedBy: string;
  generatedAt: string;
  queja: ServiceOrderQueja;
  indicaciones: ServiceOrderIndicaciones;
  solucion: ServiceOrderSolucion;
}

export interface UpdateServiceOrderPayload {
  title?: string;
  status?: ServiceOrderStatus;
  queja?: Partial<ServiceOrderQueja>;
  indicaciones?: Partial<ServiceOrderIndicaciones>;
  solucion?: Partial<ServiceOrderSolucion>;
}

export interface AuthorizerOption {
  id: string;
  name: string;
}

export function createDefaultIndicaciones(
  address = "",
): ServiceOrderIndicaciones {
  return {
    action: "reparacion",
    repairBy: "interna",
    repairSupplierId: null,
    addCost: false,
    hours: 1,
    cost: 0,
    costAssignedTo: "proveedor",
    repairPlace: "bodega",
    address,
    scheduledDate: "",
    damageTypeId: "",
    authorizedById: "",
    observations: "",
    replacementBy: "proveedor",
    branchId: null,
    recoveryReceiver: "chofer",
    assignedDriverId: null,
    assignedEmployeeId: null,
  };
}

export function createDefaultSolucion(): ServiceOrderSolucion {
  return {
    isSolved: false,
    solvedDate: "",
    approvalMethod: "llamada",
    registerAsDamagedGoods: false,
    damageTypeId: "",
    observations: "",
    deliveredSolutionId: "",
    acceptanceLetterUrl: "",
    authorizedById: "",
  };
}

/** Clears cross-scenario fields when switching Indicaciones action. */
export function indicacionesPatchForAction(
  action: ServiceOrderAction,
  current: ServiceOrderIndicaciones,
): Partial<ServiceOrderIndicaciones> {
  const base: Partial<ServiceOrderIndicaciones> = {
    action,
    repairSupplierId: null,
    addCost: false,
    hours: 1,
    cost: 0,
    replacementBy: "proveedor",
    branchId: null,
    recoveryReceiver: "chofer",
    assignedDriverId: null,
    assignedEmployeeId: null,
    observations: "",
  };

  if (action === "reparacion") {
    return {
      ...base,
      repairBy: "interna",
      repairPlace: "bodega",
      address: current.address,
    };
  }

  if (action === "reemplazar") {
    return {
      ...base,
      replacementBy: "proveedor",
      address: current.address,
      scheduledDate: current.scheduledDate,
    };
  }

  return {
    ...base,
    recoveryReceiver: "chofer",
    damageTypeId: current.damageTypeId,
  };
}

export function canCancelInvoice(articles: InvoiceArticle[]): boolean {
  if (articles.length === 0) return false;
  return articles.every((article) => article.status === "cancelado");
}

export function hasOtherUncancelledArticles(
  articles: InvoiceArticle[],
  currentArticleId: string,
): boolean {
  return articles.some(
    (article) =>
      article.id !== currentArticleId && article.status !== "cancelado",
  );
}
