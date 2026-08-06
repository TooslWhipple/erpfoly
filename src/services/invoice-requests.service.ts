import type { ApiResult } from "@/lib/axios";
import { get, patch, post } from "@/lib/axios";
import type {
  PaginatedListParams,
  PaginatedListPayload,
} from "@/hooks/usePaginatedList";
import type {
  CreateInvoiceRequestPayload,
  InvoiceRequestDetail,
  InvoiceRequestListItem,
  InvoiceRequestStatusTab,
  ParsedInvoiceFileData,
} from "@/types/invoice-requests.types";

export type {
  CreateInvoiceRequestPayload,
  InvoiceRequestDetail,
  InvoiceRequestListItem,
  InvoiceRequestStatusTab,
  ParsedInvoiceFileData,
};

export type GetInvoiceRequestsResponse = PaginatedListPayload<InvoiceRequestListItem>;

function isXmlFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return (
    name.endsWith(".xml") ||
    type === "application/xml" ||
    type === "text/xml"
  );
}

export async function getInvoiceRequests(
  params: PaginatedListParams,
): Promise<ApiResult<GetInvoiceRequestsResponse>> {
  const statusTab =
    typeof params.statusTab === "string"
      ? (params.statusTab as InvoiceRequestStatusTab)
      : undefined;

  return get<GetInvoiceRequestsResponse>("/invoice-requests", {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
      statusTab: statusTab && statusTab !== "all" ? statusTab : undefined,
    },
  });
}

export async function createInvoiceRequest(
  payload: CreateInvoiceRequestPayload,
): Promise<ApiResult<InvoiceRequestListItem>> {
  return post<InvoiceRequestListItem>("/invoice-requests", payload, {
    skipGlobalErrorToast: true,
  });
}

export async function getInvoiceRequestDetail(
  id: number,
): Promise<ApiResult<InvoiceRequestDetail>> {
  return get<InvoiceRequestDetail>(`/invoice-requests/${id}`);
}

export async function approveInvoiceRequest(
  id: number,
): Promise<ApiResult<InvoiceRequestDetail>> {
  return patch<InvoiceRequestDetail>(
    `/invoice-requests/${id}/approve`,
    undefined,
    { skipGlobalErrorToast: true },
  );
}

export async function rejectInvoiceRequest(
  id: number,
): Promise<ApiResult<InvoiceRequestDetail>> {
  return patch<InvoiceRequestDetail>(
    `/invoice-requests/${id}/reject`,
    undefined,
    { skipGlobalErrorToast: true },
  );
}

export async function parseInvoiceFile(
  files: File[],
): Promise<ApiResult<ParsedInvoiceFileData>> {
  const xmlFile = files.find(isXmlFile);
  if (!xmlFile) {
    return {
      data: null,
      error: {
        message: "Se requiere el archivo XML para leer los datos fiscales",
      },
    };
  }

  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }

  return post<ParsedInvoiceFileData>(
    "/invoice-requests/parse-cfdi",
    formData,
    {
      skipGlobalErrorToast: true,
      timeout: 60_000,
      transformRequest: (data, headers) => {
        if (data instanceof FormData && headers) {
          delete headers["Content-Type"];
        }
        return data;
      },
    },
  );
}
