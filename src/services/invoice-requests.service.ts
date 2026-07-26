import type { ApiResult } from "@/lib/axios";
import type {
  PaginatedListParams,
  PaginatedListPayload,
} from "@/hooks/usePaginatedList";
import {
  createMockInvoiceRequest,
  getMockInvoiceRequests,
  MOCK_INVOICE_ORDERS,
  MOCK_INVOICE_SUPPLIERS,
  parseMockInvoiceFile,
} from "@/data/invoice-requests.mockData";
import type {
  CreateInvoiceRequestPayload,
  InvoiceOrderOption,
  InvoiceRequestListItem,
  InvoiceRequestStatusTab,
  InvoiceSupplierOption,
  ParsedInvoiceFileData,
} from "@/types/invoice-requests.types";

export type {
  CreateInvoiceRequestPayload,
  InvoiceRequestListItem,
  InvoiceRequestStatusTab,
  ParsedInvoiceFileData,
};

export type GetInvoiceRequestsResponse = PaginatedListPayload<InvoiceRequestListItem>;

export async function getInvoiceRequests(
  params: PaginatedListParams,
): Promise<ApiResult<GetInvoiceRequestsResponse>> {
  try {
    const statusTab =
      typeof params.statusTab === "string"
        ? (params.statusTab as InvoiceRequestStatusTab)
        : undefined;

    const data = await getMockInvoiceRequests({
      page: params.page,
      limit: params.limit,
      search: params.search,
      statusTab,
    });
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message:
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las solicitudes de facturas",
      },
    };
  }
}

export async function createInvoiceRequest(
  payload: CreateInvoiceRequestPayload,
): Promise<ApiResult<InvoiceRequestListItem>> {
  try {
    const data = await createMockInvoiceRequest(payload);
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message:
          error instanceof Error
            ? error.message
            : "No se pudo enviar la solicitud de factura",
      },
    };
  }
}

export async function parseInvoiceFile(
  file: File,
): Promise<ApiResult<ParsedInvoiceFileData>> {
  try {
    const data = await parseMockInvoiceFile(file);
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message:
          error instanceof Error
            ? error.message
            : "No se pudo leer el archivo de la factura",
      },
    };
  }
}

export function getInvoiceSupplierOptions(): InvoiceSupplierOption[] {
  return MOCK_INVOICE_SUPPLIERS;
}

export function getInvoiceOrderOptions(): InvoiceOrderOption[] {
  return MOCK_INVOICE_ORDERS;
}
