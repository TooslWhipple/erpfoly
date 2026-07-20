import type {
  AuthorizerOption,
  CreateServiceOrderPayload,
  InvoiceActivity,
  InvoiceArticle,
  InvoiceDetail,
  InvoiceStatus,
  SearchResult,
  ServiceOrder,
  ServiceOrderStatus,
  UpdateServiceOrderPayload,
} from "@/types/atencion-cliente.types";
import {
  canCancelInvoice,
  createDefaultIndicaciones,
  createDefaultSolucion,
} from "@/types/atencion-cliente.types";

export const MOCK_AUTHORIZERS: AuthorizerOption[] = [
  { id: "1", name: "Lizeth Montoya" },
  { id: "2", name: "Gustavo Alfonso Fuentes" },
  { id: "3", name: "Ricardo Montes" },
];

export { canCancelInvoice };

const SEED_SERVICE_ORDER_ID = "OS-1249941-1";

export const MOCK_INVOICE_ARTICLES: InvoiceArticle[] = [
  {
    id: "1",
    code: "04-EN-00101",
    status: "reparacion",
    description: "[1] Sofa Cama Gris Venecia",
    price: 6890.4,
    promotions: 0,
    total: 6890.4,
    points: 68,
    supplier: "Mabe S.A de C.V",
    deliveryMethod: "Piso",
    serialNumber: "123456788990",
    quantity: 1,
    serviceOrderId: SEED_SERVICE_ORDER_ID,
  },
  {
    id: "2",
    code: "04-EN-00101",
    status: "entregado",
    description: "[1] Lavadora Mabe 19kg 121345",
    price: 6890.4,
    promotions: 0,
    total: 6890.4,
    points: 68,
    supplier: "Mabe S.A de C.V",
    deliveryMethod: "Piso",
    serialNumber: "998877665544",
    quantity: 1,
  },
];

export const MOCK_INVOICE_ACTIVITIES: InvoiceActivity[] = [];

export const MOCK_INVOICE_DETAIL: InvoiceDetail = {
  id: "1249941",
  invoiceNumber: "1249941",
  customerId: "12234",
  customerName: "Jose Antonio Montes Molina",
  customerPhone: "667 123 4567",
  customerAddress:
    "Circuito del Valle 1234, Rincón del Valle, Culiacán Sinaloa.",
  purchaseDate: "02 de Julio, 2025",
  paymentType: "credito",
  status: "activo",
  initialCost: 23890.5,
  totalPayments: 1990.87,
  remaining: 21899.63,
  paymentDate: "30 de Jun",
  nextPayment: 1990.87,
  currentPayment: 1,
  totalPaymentsCount: 12,
  articles: MOCK_INVOICE_ARTICLES,
  activities: MOCK_INVOICE_ACTIVITIES,
  summary: {
    subtotalWithoutTax: 11880.0,
    tax: 1900.8,
    amountWithTax: 13780.8,
    luxuryTax: 0,
    total: 13780.8,
  },
};

const seedAddress =
  "Circuito del Valle 1234, Rincón del Valle, Culiacán Sinaloa.";

const seedServiceOrder: ServiceOrder = {
  id: SEED_SERVICE_ORDER_ID,
  invoiceId: "1249941",
  invoiceNumber: "193270",
  title: "Sofá hundido",
  status: "por_realizar",
  purchaseDate: "03 Mayo 2025",
  paymentType: "credito",
  customerName: "Lucía Montes Guerrero",
  customerPhone: "667 123 4567",
  customerAddress: seedAddress,
  generatedBy: "Gustavo Alfonso Fuentes",
  generatedAt: "21 de Mayo, 2025, 11:45 am",
  queja: {
    articleId: "1",
    quantity: 1,
    serialNumber: "123456788990",
    complaint:
      "El cliente comenta que se ha hundido una parte del asiento del sofa a los pocos días de comprarlo.",
    evidenceUrls: [],
    observations: "",
  },
  indicaciones: {
    ...createDefaultIndicaciones(seedAddress),
    action: "reparacion",
    repairBy: "interna",
    scheduledDate: "2025-08-15",
    authorizedById: "1",
  },
  solucion: createDefaultSolucion(),
};

const serviceOrdersById = new Map<string, ServiceOrder>([
  [SEED_SERVICE_ORDER_ID, structuredClone(seedServiceOrder)],
]);

let invoiceArticlesStore: InvoiceArticle[] = structuredClone(MOCK_INVOICE_ARTICLES);
let invoiceStatusStore: InvoiceStatus = MOCK_INVOICE_DETAIL.status;

export const MOCK_SEARCH_RESULTS: SearchResult[] = [
  {
    id: "1249941",
    type: "facturas",
    title: "Factura 1249941",
    subtitle: "Jose Antonio Montes Molina",
    metadata: {
      date: "02 de Julio, 2025",
      amount: "$23,890.50",
    },
  },
  {
    id: "12234",
    type: "clientes",
    title: "Jose Antonio Montes Molina",
    subtitle: "Cliente ID: 12234",
    metadata: {
      invoices: "5 facturas",
      status: "Activo",
    },
  },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildTitleFromComplaint(complaint: string): string {
  const trimmed = complaint.trim();
  if (!trimmed) return "Órden de servicio";
  const firstSentence = trimmed.split(/[.!\n]/)[0]?.trim() ?? trimmed;
  if (firstSentence.length <= 48) return firstSentence;
  return `${firstSentence.slice(0, 45)}…`;
}

export async function searchInvoices(
  query: string,
  type: "facturas" | "clientes" | "pedidos",
): Promise<SearchResult[]> {
  await delay(500);

  if (!query.trim()) {
    return [];
  }

  const searchLower = query.toLowerCase().trim();

  const filteredResults = MOCK_SEARCH_RESULTS.filter((result) => {
    if (type === "facturas" && result.type !== "facturas") return false;
    if (type === "clientes" && result.type !== "clientes") return false;
    if (type === "pedidos" && result.type !== "pedidos") return false;
    return true;
  });

  if (filteredResults.length === 0) {
    return [];
  }

  const matchingResults = filteredResults.filter((result) => {
    return (
      result.title.toLowerCase().includes(searchLower) ||
      result.subtitle?.toLowerCase().includes(searchLower) ||
      result.id.toLowerCase().includes(searchLower) ||
      result.id === searchLower
    );
  });

  if (matchingResults.length === 0) {
    if (type === "facturas") {
      return [MOCK_SEARCH_RESULTS[0]];
    }
    if (type === "clientes") {
      return [MOCK_SEARCH_RESULTS[1]];
    }
    return [];
  }

  return matchingResults;
}

export async function getInvoiceDetail(
  invoiceId: string,
): Promise<InvoiceDetail> {
  await delay(500);

  return {
    ...MOCK_INVOICE_DETAIL,
    id: invoiceId,
    invoiceNumber: invoiceId,
    status: invoiceStatusStore,
    articles: structuredClone(invoiceArticlesStore),
  };
}

export async function getServiceOrderById(
  serviceOrderId: string,
): Promise<ServiceOrder | null> {
  await delay(300);
  const order = serviceOrdersById.get(serviceOrderId);
  return order ? structuredClone(order) : null;
}

export async function getServiceOrderByArticleId(
  articleId: string,
): Promise<ServiceOrder | null> {
  await delay(300);
  const article = invoiceArticlesStore.find((item) => item.id === articleId);
  if (!article?.serviceOrderId) return null;
  return getServiceOrderById(article.serviceOrderId);
}

export async function createServiceOrder(
  payload: CreateServiceOrderPayload,
): Promise<ServiceOrder> {
  await delay(600);

  const id = `OS-${payload.invoiceId}-${payload.articleId}-${Date.now()}`;
  const now = new Date();
  const generatedAt = now.toLocaleString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const order: ServiceOrder = {
    id,
    invoiceId: payload.invoiceId,
    invoiceNumber: payload.invoiceId,
    title: buildTitleFromComplaint(payload.complaint),
    status: "por_realizar",
    purchaseDate: MOCK_INVOICE_DETAIL.purchaseDate,
    paymentType: MOCK_INVOICE_DETAIL.paymentType,
    customerName: MOCK_INVOICE_DETAIL.customerName,
    customerPhone: MOCK_INVOICE_DETAIL.customerPhone,
    customerAddress: MOCK_INVOICE_DETAIL.customerAddress,
    generatedBy: "Usuario actual",
    generatedAt,
    queja: {
      articleId: payload.articleId,
      quantity: payload.quantity,
      serialNumber: payload.serialNumber,
      complaint: payload.complaint,
      evidenceUrls: payload.evidenceFiles.map((file) =>
        URL.createObjectURL(file),
      ),
      observations: payload.observations,
    },
    indicaciones: createDefaultIndicaciones(MOCK_INVOICE_DETAIL.customerAddress),
    solucion: createDefaultSolucion(),
  };

  serviceOrdersById.set(id, order);

  invoiceArticlesStore = invoiceArticlesStore.map((item) =>
    item.id === payload.articleId
      ? {
          ...item,
          status: "reparacion",
          serviceOrderId: id,
          serialNumber: payload.serialNumber || item.serialNumber,
          quantity: payload.quantity,
        }
      : item,
  );

  return structuredClone(order);
}

export async function updateServiceOrder(
  serviceOrderId: string,
  payload: UpdateServiceOrderPayload,
): Promise<ServiceOrder> {
  await delay(500);

  const existing = serviceOrdersById.get(serviceOrderId);
  if (!existing) {
    throw new Error("Orden de servicio no encontrada");
  }

  const updated: ServiceOrder = {
    ...existing,
    title: payload.title ?? existing.title,
    status: payload.status ?? existing.status,
    queja: payload.queja
      ? { ...existing.queja, ...payload.queja }
      : existing.queja,
    indicaciones: payload.indicaciones
      ? { ...existing.indicaciones, ...payload.indicaciones }
      : existing.indicaciones,
    solucion: payload.solucion
      ? { ...existing.solucion, ...payload.solucion }
      : existing.solucion,
  };

  serviceOrdersById.set(serviceOrderId, updated);

  const articleId = updated.queja.articleId;
  if (updated.indicaciones.action === "cancelar_venta") {
    invoiceArticlesStore = invoiceArticlesStore.map((item) =>
      item.id === articleId
        ? {
            ...item,
            status: "esperando_recuperacion",
            hasRecoveryOrder: true,
            serviceOrderId: updated.id,
          }
        : item,
    );
  }

  return structuredClone(updated);
}

export async function updateServiceOrderStatus(
  serviceOrderId: string,
  status: ServiceOrderStatus,
): Promise<ServiceOrder> {
  return updateServiceOrder(serviceOrderId, { status });
}

export async function cancelInvoiceArticle(articleId: string): Promise<void> {
  await delay(400);
  invoiceArticlesStore = invoiceArticlesStore.map((item) =>
    item.id === articleId ? { ...item, status: "cancelado" } : item,
  );
}

export async function cancelInvoice(invoiceId: string): Promise<void> {
  await delay(500);
  void invoiceId;

  if (!canCancelInvoice(invoiceArticlesStore)) {
    throw new Error(
      "No se puede cancelar la factura: cancela todos los artículos primero.",
    );
  }

  invoiceStatusStore = "cancelado";
}
