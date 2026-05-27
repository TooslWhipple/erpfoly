import { googleMapsBrowserApiKey } from "@/config/maps";
import type { GeoPoint } from "@/types/shipping-costs.types";

const geocodeCache = new Map<string, GeoPoint>();

export function clearMunicipalityGeocodeCache(): void {
  geocodeCache.clear();
}

export async function geocodeMunicipality(
  municipalityName: string,
  stateName: string
): Promise<GeoPoint> {
  const cacheKey = `${municipalityName}__${stateName}`;
  const cached = geocodeCache.get(cacheKey);
  if (cached) return cached;

  if (!googleMapsBrowserApiKey) {
    throw new Error("Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para geocodificar.");
  }

  const address = `${municipalityName}, ${stateName}, México`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&region=mx&key=${googleMapsBrowserApiKey}`;
  const response = await fetch(url);
  const payload = (await response.json()) as {
    status: string;
    results?: Array<{ geometry: { location: { lat: number; lng: number } } }>;
  };

  if (payload.status !== "OK" || !payload.results?.[0]?.geometry?.location) {
    throw new Error(`No se pudo geocodificar ${municipalityName} (${stateName}).`);
  }

  const { lat, lng } = payload.results[0].geometry.location;
  const point = { lat, lng };
  geocodeCache.set(cacheKey, point);
  return point;
}
