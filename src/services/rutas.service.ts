import {
  api,
  del,
  get,
  getApiErrorMessage,
  post,
  type ApiResult,
} from "@/lib/axios";
import type {
  PaginatedRowsApi,
  RouteDetailApi,
  RouteListRowApi,
} from "@/types/rutas-api.types";
import type { ArticleToAdd } from "@/types/rutas.types";

export async function fetchRoutesForDate(params: {
  routeDate: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams({
    route_date: params.routeDate,
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 50),
  });
  const result = await get<PaginatedRowsApi<RouteListRowApi>>(
    `/routes?${searchParams.toString()}`,
  );
  return result;
}

export async function fetchRouteDetail(routeId: number) {
  return get<RouteDetailApi>(`/routes/${routeId}/detail`);
}

export async function fetchAvailableProducts(routeId: number, page = 1) {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: "100",
  });
  return get<PaginatedRowsApi<ArticleToAdd>>(
    `/routes/${routeId}/available-products?${searchParams.toString()}`,
  );
}

export async function addProductsToRoute(routeId: number, productIds: number[]) {
  return post<RouteDetailApi>(`/routes/${routeId}/products`, {
    product_ids: productIds,
  });
}

export async function uploadCartaPorte(
  routeId: number,
  file: File,
): Promise<ApiResult<RouteDetailApi>> {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await api.post<unknown>(
      `/routes/${routeId}/documents/carta-porte`,
      formData,
      {
        transformRequest: [
          (data, headers) => {
            if (data instanceof FormData) {
              delete headers["Content-Type"];
            }
            return data;
          },
        ],
      },
    );
    const raw = response.data as unknown;
    if (
      raw &&
      typeof raw === "object" &&
      "error" in raw &&
      raw.error &&
      typeof raw.error === "object" &&
      "message" in (raw.error as object)
    ) {
      return {
        data: null,
        error: {
          message: String((raw.error as { message: string }).message),
        },
      };
    }
    const body = raw as Record<string, unknown>;
    const shouldUnwrap =
      typeof body === "object" &&
      body !== null &&
      "data" in body &&
      "success" in body;
    const payload = (
      shouldUnwrap ? body.data : raw
    ) as RouteDetailApi;
    return { data: payload, error: null };
  } catch (err: unknown) {
    return {
      data: null,
      error: { message: getApiErrorMessage(err) },
    };
  }
}

export async function deleteCartaPorteDocument(
  routeId: number,
  documentId: number,
) {
  return del<RouteDetailApi>(
    `/routes/${routeId}/documents/carta-porte/${documentId}`,
  );
}

export async function deleteRoute(routeId: number) {
  return del(`/routes/${routeId}`);
}
