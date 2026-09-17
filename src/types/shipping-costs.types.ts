export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeoJsonPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

export interface ShippingZone {
  id?: number;
  name: string;
  color: string;
  sortOrder: number;
  polygon: GeoJsonPolygon;
  price: number;
}

export interface MunicipalityShippingCatalogItem {
  municipalityId: number;
  municipalityName: string;
  stateName: string;
  configId?: number;
}

export interface MunicipalityShippingConfig {
  municipalityId: number;
  municipalityName: string;
  stateName: string;
  priceInZone: number;
  priceOutOfZone: number;
  mapCenter: GeoPoint | null;
  mapDefaultZoom: number;
  zones: ShippingZone[];
}

export interface UpsertMunicipalityShippingConfigPayload {
  priceInZone: number;
  priceOutOfZone: number;
  mapCenter?: GeoPoint;
  mapDefaultZoom?: number;
  zones: ShippingZone[];
}

export interface SaveMunicipalityShippingConfigResponse {
  message: string;
  municipalityId: number;
}

export type MapEditMode =
  | { type: "idle" }
  | { type: "creating" }
  | { type: "editing"; zoneId: number | undefined };
