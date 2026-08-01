import type { ApiResult } from "@/lib/axios";
import type {
  PaginatedListParams,
  PaginatedListPayload,
} from "@/hooks/usePaginatedList";
import {
  addMockInvoicesToDiscrepancy,
  findMockDiscrepancyDetail,
  getMockMerchandiseReceptionDiscrepancies,
} from "@/data/merchandise-reception-discrepancies.mockData";
import type {
  MerchandiseReceptionDiscrepancyDetail,
  MerchandiseReceptionDiscrepancyListItem,
} from "@/types/merchandise-reception-discrepancies.types";

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
  item: MerchandiseReceptionDiscrepancyListItem,
  search?: string,
): boolean {
  if (!search?.trim()) return true;
  const query = search.trim().toLowerCase();
  return (
    item.supplierName.toLowerCase().includes(query) ||
    item.receptionId.toLowerCase().includes(query) ||
    item.id.toLowerCase().includes(query)
  );
}

export type GetMerchandiseReceptionDiscrepanciesResponse =
  PaginatedListPayload<MerchandiseReceptionDiscrepancyListItem>;

export async function getMerchandiseReceptionDiscrepancies(
  params: PaginatedListParams,
): Promise<ApiResult<GetMerchandiseReceptionDiscrepanciesResponse>> {
  await delay();

  const filtered = getMockMerchandiseReceptionDiscrepancies()
    .filter((item) => matchesSearch(item, params.search))
    .sort(
      (a, b) =>
        new Date(b.receptionDate).getTime() -
        new Date(a.receptionDate).getTime(),
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

export async function getMerchandiseReceptionDiscrepancyDetail(
  id: string,
): Promise<ApiResult<MerchandiseReceptionDiscrepancyDetail>> {
  await delay();
  const detail = findMockDiscrepancyDetail(id);
  if (!detail) {
    return fail("No se encontró la discrepancia solicitada");
  }
  return ok(detail);
}

export async function addInvoicesToMerchandiseReceptionDiscrepancy(
  id: string,
  invoiceIds: string[],
): Promise<ApiResult<MerchandiseReceptionDiscrepancyDetail>> {
  await delay(350);
  if (!invoiceIds.length) {
    return fail("Selecciona al menos una factura");
  }
  const detail = addMockInvoicesToDiscrepancy(id, invoiceIds);
  if (!detail) {
    return fail("No se pudo agregar las facturas");
  }
  return ok(detail);
}
