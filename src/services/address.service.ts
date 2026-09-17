import { get, post, unwrapOrThrow } from "@/lib/axios";

export interface NeighborhoodPostalLookupItem {
  full_code: string;
  name: string;
  locality_name: string;
  municipality_name: string;
  state_name: string;
}

export async function getNeighborhoodsByPostalCode(
  postalCode: string
): Promise<NeighborhoodPostalLookupItem[]> {
  const result = await get<NeighborhoodPostalLookupItem[]>("/addresses/neighborhoods", {
    params: { postalCode },
  });
  return unwrapOrThrow(result);
}

export interface HousingTypeCatalogItem {
  id: number;
  code: string;
  name: string;
}

export async function getHousingTypes(): Promise<HousingTypeCatalogItem[]> {
  const result = await get<HousingTypeCatalogItem[]>("/addresses/housing-types");
  return unwrapOrThrow(result);
}

export interface CreateAddressPayload {
  neighborhoodFullCode: string;
  street: string;
  externalNumber: string;
  internalNumber?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface CreatedAddress {
  id: number;
  latitude: number;
  longitude: number;
}

export async function previewAddressGeocode(
  payload: CreateAddressPayload
): Promise<{ latitude: number; longitude: number }> {
  const result = await post<{ latitude: number; longitude: number }>(
    "/addresses/geocode-preview",
    payload
  );
  return unwrapOrThrow(result);
}

export async function createAddress(
  payload: CreateAddressPayload
): Promise<CreatedAddress> {
  const result = await post<CreatedAddress>("/addresses", payload);
  return unwrapOrThrow(result);
}
