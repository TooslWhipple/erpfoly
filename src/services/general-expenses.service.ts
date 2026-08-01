import type { ApiResult } from "@/lib/axios";
import type {
  PaginatedListParams,
  PaginatedListPayload,
} from "@/hooks/usePaginatedList";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_RESPONSIBLES,
  EXPENSE_SUPPLIERS,
  MOCK_SUPPLIER_INVOICES,
  createExpenseFromPayload,
  mockGeneralExpenses,
  mockUnassignedInvoices,
  replaceMockExpenses,
  replaceMockUnassignedInvoices,
} from "@/data/general-expenses.mockData";
import type {
  CreateGeneralExpensePayload,
  GeneralExpenseCatalogOption,
  GeneralExpenseInvoice,
  GeneralExpenseListItem,
  GeneralExpenseStatus,
  GeneralExpenseStatusTab,
  GeneralExpenseSummary,
  UnassignedInvoice,
  UpdateGeneralExpensePayload,
} from "@/types/general-expenses.types";

function delay(ms = 450): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function ok<T>(data: T): ApiResult<T> {
  return { data, error: null };
}

function fail<T>(message: string): ApiResult<T> {
  return { data: null, error: { message } };
}

function matchesSearch(expense: GeneralExpenseListItem, search?: string): boolean {
  if (!search?.trim()) return true;
  const query = search.trim().toLowerCase();
  return (
    expense.supplierName.toLowerCase().includes(query) ||
    expense.category.toLowerCase().includes(query) ||
    expense.description.toLowerCase().includes(query) ||
    expense.id.toLowerCase().includes(query)
  );
}

function matchesStatus(
  expense: GeneralExpenseListItem,
  statusTab?: GeneralExpenseStatusTab,
): boolean {
  if (!statusTab || statusTab === "all") return true;
  return expense.status === statusTab;
}

function computeSummary(rows: GeneralExpenseListItem[]): GeneralExpenseSummary {
  return rows.reduce(
    (acc, row) => {
      if (row.status === "pending" || row.status === "overdue") {
        acc.totalPending += row.balance;
      }
      if (row.status === "overdue") {
        acc.overdue += row.balance;
      }
      if (row.status === "pending") {
        acc.dueSoon += row.balance;
      }
      return acc;
    },
    { totalPending: 0, overdue: 0, dueSoon: 0 },
  );
}

export type GetGeneralExpensesResponse =
  PaginatedListPayload<GeneralExpenseListItem>;

export async function getGeneralExpenses(
  params: PaginatedListParams,
): Promise<ApiResult<GetGeneralExpensesResponse>> {
  await delay();

  const statusTab =
    typeof params.statusTab === "string"
      ? (params.statusTab as GeneralExpenseStatusTab)
      : undefined;

  const filtered = mockGeneralExpenses.filter(
    (expense) =>
      matchesSearch(expense, params.search) && matchesStatus(expense, statusTab),
  );

  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const start = (page - 1) * limit;
  const rows = filtered.slice(start, start + limit);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return ok({
    rows,
    total,
    page,
    limit,
    totalPages,
  });
}

export async function getGeneralExpensesSummary(): Promise<
  ApiResult<GeneralExpenseSummary>
> {
  await delay(250);
  return ok(computeSummary(mockGeneralExpenses));
}

export async function getGeneralExpenseById(
  id: string,
): Promise<ApiResult<GeneralExpenseListItem>> {
  await delay(300);
  const expense = mockGeneralExpenses.find((item) => item.id === id);
  if (!expense) {
    return fail("No se encontró el gasto solicitado");
  }
  return ok(expense);
}

export async function getUnassignedInvoices(): Promise<
  ApiResult<UnassignedInvoice[]>
> {
  await delay(350);
  return ok([...mockUnassignedInvoices]);
}

export async function searchExpenseSuppliers(
  query: string,
): Promise<ApiResult<GeneralExpenseCatalogOption[]>> {
  await delay(200);
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return ok(EXPENSE_SUPPLIERS);
  }
  return ok(
    EXPENSE_SUPPLIERS.filter(
      (supplier) =>
        supplier.label.toLowerCase().includes(normalized) ||
        (supplier.secondaryLabel?.toLowerCase().includes(normalized) ?? false),
    ),
  );
}

export async function getExpenseCategories(): Promise<
  ApiResult<GeneralExpenseCatalogOption[]>
> {
  await delay(150);
  return ok(EXPENSE_CATEGORIES);
}

export async function getExpenseResponsibles(
  query = "",
): Promise<ApiResult<GeneralExpenseCatalogOption[]>> {
  await delay(200);
  const normalized = query.trim().toLowerCase();
  if (!normalized) return ok(EXPENSE_RESPONSIBLES);
  return ok(
    EXPENSE_RESPONSIBLES.filter((item) =>
      item.label.toLowerCase().includes(normalized),
    ),
  );
}

export async function searchSupplierInvoices(
  supplierId: string | null,
): Promise<ApiResult<GeneralExpenseInvoice[]>> {
  await delay(700);
  if (!supplierId) return ok([]);
  const invoices = MOCK_SUPPLIER_INVOICES[supplierId] ?? [];
  return ok(invoices.map((invoice) => ({ ...invoice })));
}

export async function createGeneralExpense(
  payload: CreateGeneralExpensePayload,
): Promise<ApiResult<GeneralExpenseListItem>> {
  await delay(600);

  if (!payload.dueDate) {
    return fail("La fecha de pago es obligatoria");
  }
  if (!payload.category.trim()) {
    return fail("La categoría es obligatoria");
  }
  if (payload.amount <= 0) {
    return fail("El monto debe ser mayor a 0");
  }
  if (payload.assignToSupplier && !payload.supplierId) {
    return fail("Selecciona un proveedor");
  }

  const expense = createExpenseFromPayload(payload);
  replaceMockExpenses([expense, ...mockGeneralExpenses]);
  return ok(expense);
}

export async function updateGeneralExpense(
  payload: UpdateGeneralExpensePayload,
): Promise<ApiResult<GeneralExpenseListItem>> {
  await delay(500);
  const index = mockGeneralExpenses.findIndex((item) => item.id === payload.id);
  if (index < 0) {
    return fail("No se encontró el gasto solicitado");
  }

  const current = mockGeneralExpenses[index];
  const nextAmount = payload.amount ?? current.amount;
  const nextPaid = current.paidAmount;
  const nextBalance = Math.max(Number((nextAmount - nextPaid).toFixed(2)), 0);
  let nextStatus: GeneralExpenseStatus = current.status;
  if (nextBalance <= 0) nextStatus = "paid";
  else if (current.status === "overdue") nextStatus = "overdue";
  else nextStatus = "pending";

  const updated: GeneralExpenseListItem = {
    ...current,
    ...payload,
    amount: nextAmount,
    balance: nextBalance,
    status: nextStatus,
    supplierName:
      payload.supplierName ??
      current.supplierName,
    invoices: payload.invoices ?? current.invoices,
    branchShares: payload.branchShares ?? current.branchShares,
  };

  const next = [...mockGeneralExpenses];
  next[index] = updated;
  replaceMockExpenses(next);
  return ok(updated);
}

export async function removeUnassignedInvoice(
  invoiceId: string,
): Promise<ApiResult<{ removed: boolean }>> {
  await delay(300);
  replaceMockUnassignedInvoices(
    mockUnassignedInvoices.filter((invoice) => invoice.id !== invoiceId),
  );
  return ok({ removed: true });
}

export async function createExpenseFromUnassignedInvoice(
  invoiceId: string,
): Promise<ApiResult<GeneralExpenseListItem>> {
  await delay(500);
  const invoice = mockUnassignedInvoices.find((item) => item.id === invoiceId);
  if (!invoice) {
    return fail("No se encontró la factura sin asignar");
  }

  const supplier = EXPENSE_SUPPLIERS.find(
    (item) => item.secondaryLabel === invoice.supplierRfc,
  );

  const expense = createExpenseFromPayload({
    assignToSupplier: true,
    supplierId: supplier?.id ?? null,
    supplierName: invoice.supplierName,
    dueDate: "2026-05-20",
    category: "Papelería y Art. de Oficina",
    isLocalPurchase: false,
    responsibleId: "user-1",
    responsibleName: "Julio Inzunza",
    description: `Gasto generado desde factura ${invoice.id}`,
    amount: invoice.amount,
    requiresInvoice: true,
    invoices: [
      {
        id: invoice.id,
        externalId: invoice.id.toUpperCase(),
        date: invoice.date,
        paymentType: invoice.paymentType,
        amount: invoice.amount,
      },
    ],
    apportionEnabled: false,
    apportionmentType: "sales_participation",
    applyToForeignBranches: false,
    branchShares: [],
    singleBranchId: "b1",
    singleBranchName: "Ejercito",
  });

  replaceMockExpenses([expense, ...mockGeneralExpenses]);
  replaceMockUnassignedInvoices(
    mockUnassignedInvoices.filter((item) => item.id !== invoiceId),
  );

  return ok(expense);
}
