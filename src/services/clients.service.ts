import { get } from "@/lib/axios";
import type { ApiResult, PaginatedResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";

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

export type GetClientsResponse = PaginatedResponse<Client>;

const BASE = "/clients";

export async function getClients(
  params: GetClientsParams
): Promise<ApiResult<GetClientsResponse>> {
  return get<GetClientsResponse>(buildListUrl(BASE, params));
}
