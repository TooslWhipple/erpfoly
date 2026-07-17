import type {
  CreateServiceOrderPayload,
  InvoiceActivity,
  InvoiceArticle,
  InvoiceDetail,
  SearchResult,
} from "@/types/atencion-cliente.types";

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

export async function searchInvoices(
  query: string,
  type: "facturas" | "clientes" | "pedidos",
): Promise<SearchResult[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

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
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    ...MOCK_INVOICE_DETAIL,
    id: invoiceId,
    invoiceNumber: invoiceId,
  };
}

/** ponytail: mock create until reparaciones API exists — swap for service call */
export async function createServiceOrder(
  payload: CreateServiceOrderPayload,
): Promise<{ id: string }> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { id: `OS-${payload.invoiceId}-${payload.articleId}` };
}

/** ponytail: mock cancel until articles API exists — swap for service call */
export async function cancelInvoiceArticle(articleId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  void articleId;
}
