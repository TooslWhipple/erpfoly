import type { ApiResult } from "@/lib/axios";
import type {
  PaginatedListParams,
  PaginatedListPayload,
} from "@/hooks/usePaginatedList";
import {
  applyScheduledPayment,
  findMockStatement,
  getMockDiscrepancies,
  getMockListItems,
  getMockStatements,
} from "@/data/supplier-payables.mockData";
import type {
  SchedulePaymentPayload,
  SupplierPayableDiscrepancy,
  SupplierPayableListItem,
  SupplierPayableStatement,
  SupplierPayableStatusTab,
  SupplierPayableSummary,
} from "@/types/supplier-payables.types";

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

function matchesSearch(
  item: SupplierPayableListItem,
  search?: string,
): boolean {
  if (!search?.trim()) return true;
  const query = search.trim().toLowerCase();
  return (
    item.supplierName.toLowerCase().includes(query) ||
    item.periodLabel.toLowerCase().includes(query) ||
    item.id.toLowerCase().includes(query)
  );
}

function matchesStatus(
  item: SupplierPayableListItem,
  statusTab?: SupplierPayableStatusTab,
): boolean {
  if (!statusTab || statusTab === "all") return true;
  return item.status === statusTab;
}

function computeSummary(
  rows: SupplierPayableListItem[],
): SupplierPayableSummary {
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

export type GetSupplierPayablesResponse =
  PaginatedListPayload<SupplierPayableListItem>;

export async function getSupplierPayables(
  params: PaginatedListParams,
): Promise<ApiResult<GetSupplierPayablesResponse>> {
  await delay();

  const statusTab =
    typeof params.statusTab === "string"
      ? (params.statusTab as SupplierPayableStatusTab)
      : undefined;

  const filtered = getMockListItems().filter(
    (item) =>
      matchesSearch(item, params.search) && matchesStatus(item, statusTab),
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

export async function getSupplierPayablesSummary(): Promise<
  ApiResult<SupplierPayableSummary>
> {
  await delay(250);
  return ok(computeSummary(getMockListItems()));
}

export async function getSupplierPayableStatement(
  id: string,
): Promise<ApiResult<SupplierPayableStatement>> {
  await delay(300);
  const statement = findMockStatement(id);
  if (!statement) {
    return fail("No se encontró el estado de cuenta");
  }
  return ok(statement);
}

export async function getSupplierPayableDiscrepancies(): Promise<
  ApiResult<SupplierPayableDiscrepancy[]>
> {
  await delay(250);
  return ok(getMockDiscrepancies());
}

export async function getSupplierPayableDiscrepancyCount(): Promise<
  ApiResult<{ count: number }>
> {
  await delay(200);
  return ok({ count: getMockDiscrepancies().length });
}

export async function scheduleSupplierPayablePayment(
  statementId: string,
  payload: SchedulePaymentPayload,
): Promise<ApiResult<SupplierPayableStatement>> {
  await delay(500);

  if (!payload.amount || payload.amount <= 0) {
    return fail("Ingresa un monto válido");
  }
  if (!payload.scheduledDate) {
    return fail("Selecciona la fecha del pago");
  }

  const statement = findMockStatement(statementId);
  if (!statement) {
    return fail("No se encontró el estado de cuenta");
  }

  if (statement.movements.some((m) => m.requiresAttention)) {
    return fail(
      "No es posible registrar pagos en este estado de cuenta ya que existen movimientos que requieren atención",
    );
  }

  if (payload.amount > statement.balance) {
    return fail("El monto no puede ser mayor al saldo pendiente");
  }

  const updated = applyScheduledPayment(statementId, payload);
  if (!updated) {
    return fail("No se pudo programar el pago");
  }

  // Keep reference so list mirrors mutations
  void getMockStatements();
  return ok(updated);
}
