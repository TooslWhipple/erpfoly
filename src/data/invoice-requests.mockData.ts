import type {
  CreateInvoiceRequestPayload,
  GetInvoiceRequestsParams,
  InvoiceOrderOption,
  InvoiceRequestListItem,
  InvoiceSupplierOption,
  ParsedInvoiceFileData,
} from "@/types/invoice-requests.types";

const MOCK_DELAY_MS = 450;
const PARSE_DELAY_MS = 800;

let nextId = 11;

let invoiceRequests: InvoiceRequestListItem[] = [
  {
    id: 1,
    invoiceNumber: "12345XX9PLL12",
    origin: "providers",
    details: "MABE S.A. de C.V.",
    requestedAt: "2026-04-30T10:00:00.000Z",
    status: "pending",
    amount: 40930,
    concept: "Compra de electrodomésticos",
    paymentType: "PUE",
    subtotal: 35284.48,
    vat: 5645.52,
    requestingArea: "Administración",
    assignToSupplier: true,
    supplierName: "MABE S.A. de C.V.",
  },
  {
    id: 2,
    invoiceNumber: "12345XX9PLL12",
    origin: "administration",
    details: "Pago de publicidad",
    requestedAt: "2026-03-30T10:00:00.000Z",
    status: "accepted",
    amount: 98560,
    concept: "Campaña publicitaria digital",
    paymentType: "PPD",
    subtotal: 84965.52,
    vat: 13594.48,
    requestingArea: "Administración",
    assignToSupplier: false,
    paymentDetails: "Pago de publicidad",
  },
  {
    id: 3,
    invoiceNumber: "12345XX9PLL12",
    origin: "providers",
    details: "MABE S.A. de C.V.",
    requestedAt: "2026-02-28T10:00:00.000Z",
    status: "rejected",
    amount: 23450,
    concept: "Refacciones de línea blanca",
    paymentType: "PUE",
    subtotal: 20215.52,
    vat: 3234.48,
    requestingArea: "Administración",
    assignToSupplier: true,
    supplierName: "MABE S.A. de C.V.",
  },
  {
    id: 4,
    invoiceNumber: "12345XX9PLL12",
    origin: "administration",
    details: "Pago de publicidad",
    requestedAt: "2026-01-30T10:00:00.000Z",
    status: "pending",
    amount: 12090,
    concept: "Pauta en redes sociales",
    paymentType: "PUE",
    subtotal: 10422.41,
    vat: 1667.59,
    requestingArea: "Administración",
    assignToSupplier: false,
    paymentDetails: "Pago de publicidad",
  },
  {
    id: 5,
    invoiceNumber: "A89012BC34DE56",
    origin: "providers",
    details: "Whirlpool México S.A.",
    requestedAt: "2026-04-15T14:30:00.000Z",
    status: "accepted",
    amount: 67500,
    concept: "Equipos de refrigeración",
    paymentType: "PPD",
    subtotal: 58189.66,
    vat: 9310.34,
    requestingArea: "Administración",
    assignToSupplier: true,
    supplierName: "Whirlpool México S.A.",
  },
  {
    id: 6,
    invoiceNumber: "FG7812HK90LM34",
    origin: "administration",
    details: "Servicios de limpieza",
    requestedAt: "2026-04-10T09:15:00.000Z",
    status: "pending",
    amount: 8500,
    concept: "Mantenimiento de oficinas",
    paymentType: "PUE",
    subtotal: 7327.59,
    vat: 1172.41,
    requestingArea: "Administración",
    assignToSupplier: false,
    paymentDetails: "Servicios de limpieza",
  },
  {
    id: 7,
    invoiceNumber: "NP4567QR89ST01",
    origin: "providers",
    details: "LG Electronics México",
    requestedAt: "2026-03-22T11:45:00.000Z",
    status: "rejected",
    amount: 152300,
    concept: "Televisores y equipos de audio",
    paymentType: "PPD",
    subtotal: 131293.1,
    vat: 21006.9,
    requestingArea: "Administración",
    assignToSupplier: true,
    supplierName: "LG Electronics México",
  },
  {
    id: 8,
    invoiceNumber: "UV2345WX67YZ89",
    origin: "administration",
    details: "Consultoría legal",
    requestedAt: "2026-03-05T16:00:00.000Z",
    status: "accepted",
    amount: 45000,
    concept: "Asesoría jurídica corporativa",
    paymentType: "PUE",
    subtotal: 38793.1,
    vat: 6206.9,
    requestingArea: "Administración",
    assignToSupplier: false,
    paymentDetails: "Consultoría legal",
  },
  {
    id: 9,
    invoiceNumber: "92139130102ABC",
    origin: "providers",
    details: "MABE S.A. de C.V.",
    requestedAt: "2026-04-02T08:20:00.000Z",
    status: "pending",
    amount: 150567.3,
    concept: "Servicios de desarrollo y mantenimiento de software",
    paymentType: "PUE",
    subtotal: 126476.53,
    vat: 24090.77,
    requestingArea: "Administración",
    assignToSupplier: true,
    supplierName: "MABE S.A. de C.V.",
    orderId: "1234",
  },
  {
    id: 10,
    invoiceNumber: "ZX9988AB12CD34",
    origin: "administration",
    details: "Pago a cuenta de servicios externos",
    requestedAt: "2026-04-20T13:10:00.000Z",
    status: "pending",
    amount: 32000,
    concept: "Servicios de desarrollo y mantenimiento de software",
    paymentType: "PUE",
    subtotal: 27586.21,
    vat: 4413.79,
    requestingArea: "Administración",
    assignToSupplier: false,
    paymentDetails: "Pago a cuenta de servicios externos",
  },
];

export const MOCK_INVOICE_SUPPLIERS: InvoiceSupplierOption[] = [
  { id: "sup-1", label: "MABE S.A. de C.V." },
  { id: "sup-2", label: "Whirlpool México S.A." },
  { id: "sup-3", label: "LG Electronics México" },
  { id: "sup-4", label: "Samsung Electronics México" },
];

export const MOCK_INVOICE_ORDERS: InvoiceOrderOption[] = [
  { id: "1234", label: "1234" },
  { id: "2345", label: "2345" },
  { id: "3456", label: "3456" },
  { id: "4567", label: "4567" },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function matchesSearch(item: InvoiceRequestListItem, search: string): boolean {
  const normalized = search.trim().toLowerCase();
  if (!normalized) return true;

  return [
    item.invoiceNumber,
    item.details,
    item.origin === "providers" ? "proveedores" : "administración",
    item.concept ?? "",
    item.supplierName ?? "",
    item.paymentDetails ?? "",
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

export async function getMockInvoiceRequests(params: GetInvoiceRequestsParams): Promise<{
  rows: InvoiceRequestListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  await delay(MOCK_DELAY_MS);

  const page = Math.max(1, params.page);
  const limit = Math.max(1, params.limit);
  const statusTab = params.statusTab ?? "all";

  const filtered = invoiceRequests
    .filter((item) => (statusTab === "all" ? true : item.status === statusTab))
    .filter((item) => matchesSearch(item, params.search ?? ""))
    .sort(
      (a, b) =>
        new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
    );

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const rows = filtered.slice(start, start + limit);

  return { rows, total, page, limit, totalPages };
}

export async function createMockInvoiceRequest(
  payload: CreateInvoiceRequestPayload,
): Promise<InvoiceRequestListItem> {
  await delay(MOCK_DELAY_MS);

  const created: InvoiceRequestListItem = {
    id: nextId++,
    invoiceNumber: payload.invoiceNumber,
    origin: payload.assignToSupplier ? "providers" : "administration",
    details: payload.assignToSupplier
      ? (payload.supplierName ?? "Proveedor")
      : (payload.paymentDetails ?? payload.concept),
    requestedAt: new Date().toISOString(),
    status: "pending",
    amount: payload.total,
    concept: payload.concept,
    paymentType: payload.paymentType,
    subtotal: payload.subtotal,
    vat: payload.vat,
    issuedAt: payload.issuedAt,
    paymentDueAt: payload.paymentDueAt,
    requestingArea: payload.requestingArea,
    assignToSupplier: payload.assignToSupplier,
    supplierId: payload.supplierId,
    supplierName: payload.supplierName,
    orderId: payload.orderId,
    paymentDetails: payload.paymentDetails,
  };

  invoiceRequests = [created, ...invoiceRequests];
  return created;
}

/** ponytail: no real XML/PDF parser; returns fixed fixture until backend extraction exists */
export async function parseMockInvoiceFile(
  file: File,
): Promise<ParsedInvoiceFileData> {
  await delay(PARSE_DELAY_MS);

  const isXml = file.name.toLowerCase().endsWith(".xml");

  return {
    invoiceNumber: isXml ? "92139130102ABC" : "PDF-92139130102",
    concept: "Servicios de desarrollo y mantenimiento de software",
    paymentType: "PUE",
    subtotal: 126476.53,
    vat: 24090.768,
    total: 150567.3,
    issuedAt: "2026-04-02",
    paymentDueAt: "2026-04-30",
    requestingArea: "Administración",
    supplierName: "MABE S.A. de C.V.",
    paymentDetails: "Pago a cuenta de servicios externos",
  };
}
