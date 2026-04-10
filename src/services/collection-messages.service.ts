import { del, get, patch, post } from "@/lib/axios";
import type { ApiResult, ApiSuccessPayload, PaginatedRowsResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";

export interface CollectionMessage {
  id: number;
  name: string;
  content: string;
  status: "ACTIVE" | "INACTIVE";
  inUse: boolean;
}

export interface GetCollectionMessagesParams {
  page: number;
  limit: number;
  search?: string;
}

export type GetCollectionMessagesResponse =
  PaginatedRowsResponse<CollectionMessage>;

export interface CreateCollectionMessagePayload {
  name: string;
  content: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface UpdateCollectionMessagePayload {
  name?: string;
  content?: string;
  status?: "ACTIVE" | "INACTIVE";
}

const BASE = "/collection-messages";

export async function getCollectionMessages(
  params: GetCollectionMessagesParams
): Promise<ApiResult<GetCollectionMessagesResponse>> {
  return get<GetCollectionMessagesResponse>(buildListUrl(BASE, params));
}

export async function createCollectionMessage(
  payload: CreateCollectionMessagePayload
): Promise<ApiResult<CollectionMessage>> {
  return post<CollectionMessage>(BASE, payload);
}

export async function updateCollectionMessage(
  id: number,
  payload: UpdateCollectionMessagePayload
): Promise<ApiResult<CollectionMessage>> {
  return patch<CollectionMessage>(`${BASE}/${id}`, payload);
}

export async function getCollectionMessageById(
  id: number
): Promise<ApiResult<CollectionMessage>> {
  return get<CollectionMessage>(`${BASE}/${id}`);
}

export async function deleteCollectionMessage(
  id: number
): Promise<ApiResult<ApiSuccessPayload>> {
  return del<ApiSuccessPayload>(`${BASE}/${id}`);
}
