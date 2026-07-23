import {
  MOCK_COSTEOS_DETAILS,
  MOCK_COSTEOS_LIST,
  MOCK_EMPTY_COSTEOS,
  MOCK_ERROR_COSTEOS,
} from "@/data/costeos.mockData";
import type {
  AddCosteoExpensePayload,
  CosteoDetail,
  CosteoExpense,
  CosteoInvoice,
  GetCosteosParams,
  GetCosteosResponse,
} from "@/types/costeos.types";

const MOCK_LATENCY_MS = 450;
const VAT_RATE = 0.16;

function delay(ms = MOCK_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function cloneDetail(detail: CosteoDetail): CosteoDetail {
  return structuredClone(detail);
}

function recalculateExpenseSummary(expenses: CosteoExpense[]) {
  const subtotal = expenses.reduce((sum, item) => sum + item.subtotal, 0);
  const vat = expenses.reduce((sum, item) => sum + item.vat, 0);
  return {
    subtotal,
    vat,
    total: subtotal + vat,
  };
}

function buildExpenseFromPayload(
  payload: AddCosteoExpensePayload,
): CosteoExpense {
  const rate = payload.currency === "USD" ? payload.exchangeRate : 1;
  const subtotal = payload.amount * rate;
  const vat = subtotal * VAT_RATE;

  return {
    id: `exp-${Date.now()}`,
    name: payload.name,
    currency: payload.currency,
    exchangeRate: rate,
    amount: payload.amount,
    subtotal,
    vat,
    total: subtotal + vat,
    includedInInvoice: payload.includedInInvoice,
  };
}

export async function getCosteos(
  params: GetCosteosParams = {},
): Promise<GetCosteosResponse> {
  await delay();

  if (MOCK_ERROR_COSTEOS) {
    throw new Error("No se pudieron cargar los costeos");
  }

  if (MOCK_EMPTY_COSTEOS) {
    return { data: [], total: 0 };
  }

  const filter = params.filter ?? "all";
  const data =
    filter === "all"
      ? MOCK_COSTEOS_LIST
      : MOCK_COSTEOS_LIST.filter((item) => item.filterGroup === filter);

  return {
    data: data.map((item) => ({ ...item })),
    total: data.length,
  };
}

export async function getCosteoById(id: number): Promise<CosteoDetail | null> {
  await delay();

  if (MOCK_ERROR_COSTEOS) {
    throw new Error("No se pudo cargar el costeo");
  }

  const detail = MOCK_COSTEOS_DETAILS[id];
  if (!detail) {
    return null;
  }

  return cloneDetail(detail);
}

export async function saveCosteoDetail(
  id: number,
  payload: Partial<
    Pick<CosteoDetail, "exchangeRate" | "affectArticlePrices" | "articles">
  >,
): Promise<CosteoDetail> {
  await delay(300);

  const current = MOCK_COSTEOS_DETAILS[id];
  if (!current) {
    throw new Error("Costeo no encontrado");
  }

  MOCK_COSTEOS_DETAILS[id] = {
    ...current,
    ...payload,
    articles: payload.articles ?? current.articles,
  };

  return cloneDetail(MOCK_COSTEOS_DETAILS[id]);
}

export async function addCosteoExpense(
  costeoId: number,
  payload: AddCosteoExpensePayload,
): Promise<CosteoDetail> {
  await delay(300);

  const current = MOCK_COSTEOS_DETAILS[costeoId];
  if (!current) {
    throw new Error("Costeo no encontrado");
  }

  const expenses = [...current.expenses, buildExpenseFromPayload(payload)];
  MOCK_COSTEOS_DETAILS[costeoId] = {
    ...current,
    expenses,
    expenseSummary: recalculateExpenseSummary(expenses),
  };

  return cloneDetail(MOCK_COSTEOS_DETAILS[costeoId]);
}

export async function removeCosteoExpense(
  costeoId: number,
  expenseId: string,
): Promise<CosteoDetail> {
  await delay(200);

  const current = MOCK_COSTEOS_DETAILS[costeoId];
  if (!current) {
    throw new Error("Costeo no encontrado");
  }

  const expenses = current.expenses.filter((item) => item.id !== expenseId);
  MOCK_COSTEOS_DETAILS[costeoId] = {
    ...current,
    expenses,
    expenseSummary: recalculateExpenseSummary(expenses),
  };

  return cloneDetail(MOCK_COSTEOS_DETAILS[costeoId]);
}

export async function addCosteoInvoices(
  costeoId: number,
  invoiceIds: string[],
): Promise<CosteoDetail> {
  await delay(300);

  const current = MOCK_COSTEOS_DETAILS[costeoId];
  if (!current) {
    throw new Error("Costeo no encontrado");
  }

  const selected = current.availableInvoices.filter((invoice) =>
    invoiceIds.includes(invoice.id),
  );

  const newInvoices: CosteoInvoice[] = selected.map((invoice) => ({
    id: `inv-${Date.now()}-${invoice.id}`,
    externalId: invoice.externalId,
    date: invoice.date,
    type: invoice.type,
    amount:
      invoice.type === "credit_note" ? -Math.abs(invoice.amount) : invoice.amount,
  }));

  const invoices = [...current.invoices, ...newInvoices];
  const totalInvoiced = invoices
    .filter((item) => item.type !== "credit_note")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalCreditNotes = invoices
    .filter((item) => item.type === "credit_note")
    .reduce((sum, item) => sum + item.amount, 0);
  const netInvoiced = totalInvoiced + totalCreditNotes;
  const discrepancy = netInvoiced - current.billingSummary.totalArticles;

  MOCK_COSTEOS_DETAILS[costeoId] = {
    ...current,
    invoices,
    billingSummary: {
      ...current.billingSummary,
      totalInvoiced,
      totalCreditNotes,
      discrepancy,
    },
  };

  return cloneDetail(MOCK_COSTEOS_DETAILS[costeoId]);
}
