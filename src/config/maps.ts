/**
 * Google Maps JavaScript API key for browser usage (optional).
 * Prefer NEXT_PUBLIC_ so values are available on the client.
 */
export const googleMapsBrowserApiKey =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
  process.env.GOOGLE_MAPS_API_KEY ??
  "";

/**
 * Google Maps Map ID required for AdvancedMarkerElement.
 */
export const googleMapsMapId =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ??
  process.env.GOOGLE_MAPS_MAP_ID ??
  "";
