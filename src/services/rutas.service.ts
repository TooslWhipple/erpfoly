import {
  del,
  get,
  patch,
  post,
  type ApiResult,
} from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  PaginatedRowsApi,
  RouteAssistantCandidateApi,
  RouteDetailApi,
  RouteDriverCandidateApi,
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
  return get<RouteDetailApi>(`/routes/${routeId}`);
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
  return post<RouteDetailApi>(
    `/routes/${routeId}/documents/carta-porte`,
    formData,
    {
      skipGlobalErrorToast: true,
      transformRequest: (data, headers) => {
        if (data instanceof FormData && headers) {
          delete headers["Content-Type"];
        }
        return data;
      },
    },
  );
}

export async function deleteCartaPorteDocument(
  routeId: number,
  documentId: number,
) {
  return del<RouteDetailApi>(
    `/routes/${routeId}/documents/carta-porte/${documentId}`,
    { skipGlobalErrorToast: true },
  );
}

export async function deleteRoute(routeId: number) {
  return del(`/routes/${routeId}`);
}

// ============================================================================
// DRIVER / ASSISTANTS
// ============================================================================

export interface AvailableDriverParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AvailableAssistantParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function fetchAvailableDrivers(
  routeId: number,
  params: AvailableDriverParams = {},
) {
  return get<PaginatedRowsApi<RouteDriverCandidateApi>>(
    buildListUrl(`/routes/${routeId}/available-drivers`, params),
  );
}

export function fetchAvailableAssistants(
  routeId: number,
  params: AvailableAssistantParams = {},
) {
  return get<PaginatedRowsApi<RouteAssistantCandidateApi>>(
    buildListUrl(`/routes/${routeId}/available-assistants`, params),
  );
}

export function assignDriverToRoute(routeId: number, userId: number) {
  return patch<RouteDetailApi>(`/routes/${routeId}/driver`, {
    user_id: userId,
  });
}

export function removeDriverFromRoute(routeId: number) {
  return del<RouteDetailApi>(`/routes/${routeId}/driver`);
}

export function addAssistantToRoute(routeId: number, userId: number) {
  return post<RouteDetailApi>(`/routes/${routeId}/assistants`, {
    user_id: userId,
  });
}

export function removeAssistantFromRoute(routeId: number, userId: number) {
  return del<RouteDetailApi>(`/routes/${routeId}/assistants/${userId}`);
}

export function updateRouteVehicleInfo(routeId: number, vehicleInfo: string) {
  return patch<RouteDetailApi>(`/routes/${routeId}/vehicle`, {
    vehicle_info: vehicleInfo,
  });
}
