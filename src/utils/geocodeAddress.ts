import { googleMapsBrowserApiKey } from "@/config/maps";

const API_KEY = googleMapsBrowserApiKey;

export interface GeocodeAddressInput {
  street: string;
  externalNumber?: string;
  neighborhoodName?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export async function geocodeAddress(
  input: GeocodeAddressInput
): Promise<GeocodeResult | null> {
  if (!API_KEY) return null;

  const addressParts = [
    input.street,
    input.externalNumber,
    input.neighborhoodName,
    input.city,
    input.state,
    input.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  if (!addressParts.trim()) return null;

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        addressParts
      )}&key=${API_KEY}`
    );
    const data = await response.json();

    if (data.status !== "OK" || !data.results?.length) {
      return null;
    }

    const result = data.results[0];
    const location = result.geometry?.location;

    if (!location?.lat || !location?.lng) {
      return null;
    }

    return {
      lat: location.lat,
      lng: location.lng,
      formattedAddress: result.formatted_address,
    };
  } catch {
    return null;
  }
}
