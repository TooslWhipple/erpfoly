import { get, post } from "@/lib/axios";
import type { ApiResult, PaginatedRowsResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type {
  ClientCollectionActivity,
  ClientCollectionActivityType,
  ClientDetailHeader,
  CreateClientCollectionActivityPayload,
} from "@/types/clientes.types";

export type ClientStatus = "active" | "inactive" | "blocked";

export interface ClientAddressItem {
  id: number;
  addressType: string;
  isPrimary: boolean;
  street: string;
  externalNumber: string | null;
  internalNumber: string | null;
  postalCode: string | null;
  neighborhoodName: string;
}

export interface Client {
  id: number;
  firstName: string;
  lastSurname: string;
  secondSurname: string | null;
  fullName: string;
  phoneNumber: string | null;
  email: string | null;
  status: string | null;
  addresses: ClientAddressItem[];
  primaryAddressFormatted: string | null;
}

export interface GetClientsParams {
  page: number;
  limit: number;
  search?: string;
  status?: ClientStatus;
}

export type GetClientsResponse = PaginatedRowsResponse<Client>;

const BASE = "/clients";

export async function getClients(
  params: GetClientsParams
): Promise<ApiResult<GetClientsResponse>> {
  return get<GetClientsResponse>(buildListUrl(BASE, params));
}

export async function getClientDetail(
  clientId: number
): Promise<ApiResult<ClientDetailHeader>> {
  return get<ClientDetailHeader>(`${BASE}/${clientId}/detail`);
}

export async function getClientCollectionActivities(
  clientId: number
): Promise<ApiResult<ClientCollectionActivity[]>> {
  return get<ClientCollectionActivity[]>(
    `${BASE}/${clientId}/collection-activities`
  );
}

export async function getClientCollectionActivityTypes(): Promise<
  ApiResult<ClientCollectionActivityType[]>
> {
  return get<ClientCollectionActivityType[]>(`${BASE}/collection-activity-types`);
}

export async function createClientCollectionActivity(
  clientId: number,
  payload: CreateClientCollectionActivityPayload
): Promise<ApiResult<ClientCollectionActivity>> {
  return post<ClientCollectionActivity>(
    `${BASE}/${clientId}/collection-activities`,
    payload
  );
}
