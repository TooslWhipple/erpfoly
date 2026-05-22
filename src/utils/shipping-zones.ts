import type { GeoJsonPolygon, GeoPoint, ShippingZone } from "@/types/shipping-costs.types";

export const DEFAULT_ZONE_COLORS = [
  "#8B5CF6",
  "#3B82F6",
  "#EAB308",
  "#22C55E",
  "#EC4899",
  "#06B6D4",
  "#F97316",
  "#EF4444",
];

export function zoneToMapPath(zone: ShippingZone): GeoPoint[] {
  const ring = zone.polygon.coordinates[0] ?? [];
  const normalized = ring.length > 1 ? ring.slice(0, -1) : ring;
  return normalized.map(([lng, lat]) => ({ lat, lng }));
}

export function mapPathToGeoJson(path: GeoPoint[]): GeoJsonPolygon {
  if (path.length === 0) {
    return { type: "Polygon", coordinates: [[]] };
  }
  const ring = path.map((point) => [point.lng, point.lat]);
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([first[0], first[1]]);
  }
  return {
    type: "Polygon",
    coordinates: [ring],
  };
}

export function getZonesMapViewport(
  zones: ShippingZone[]
): { center: GeoPoint; zoom: number } | null {
  const allPoints = zones.flatMap((zone) => zoneToMapPath(zone));
  if (allPoints.length === 0) return null;

  const lat = allPoints.reduce((sum, point) => sum + point.lat, 0) / allPoints.length;
  const lng = allPoints.reduce((sum, point) => sum + point.lng, 0) / allPoints.length;
  return { center: { lat, lng }, zoom: 13 };
}

export function isPersistedZoneId(id: number | undefined): id is number {
  return typeof id === "number" && id > 0;
}

/** Client-only negative ids so finalized drafts stay distinct from the active one (id null). */
export function getNextTempZoneId(zones: ShippingZone[]): number {
  let minId = 0;
  for (const zone of zones) {
    if (typeof zone.id === "number" && zone.id < minId) {
      minId = zone.id;
    }
  }
  return minId - 1;
}
