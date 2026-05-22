import type { GeoPoint } from "@/types/shipping-costs.types";

function squaredDistance(a: GeoPoint, b: GeoPoint): number {
  return (a.lng - b.lng) ** 2 + (a.lat - b.lat) ** 2;
}

function projectPointToSegment(point: GeoPoint, start: GeoPoint, end: GeoPoint): GeoPoint {
  const abLng = end.lng - start.lng;
  const abLat = end.lat - start.lat;
  const apLng = point.lng - start.lng;
  const apLat = point.lat - start.lat;
  const denominator = abLng * abLng + abLat * abLat;
  const t = denominator === 0 ? 0 : (apLng * abLng + apLat * abLat) / denominator;
  const clamped = Math.max(0, Math.min(1, t));
  return {
    lng: start.lng + clamped * abLng,
    lat: start.lat + clamped * abLat,
  };
}

function segmentsIntersect(a: GeoPoint, b: GeoPoint, c: GeoPoint, d: GeoPoint): boolean {
  const det = (p: GeoPoint, q: GeoPoint, r: GeoPoint) =>
    (q.lng - p.lng) * (r.lat - p.lat) - (q.lat - p.lat) * (r.lng - p.lng);
  const onSegment = (p: GeoPoint, q: GeoPoint, r: GeoPoint) =>
    Math.min(p.lng, r.lng) <= q.lng &&
    q.lng <= Math.max(p.lng, r.lng) &&
    Math.min(p.lat, r.lat) <= q.lat &&
    q.lat <= Math.max(p.lat, r.lat);

  const o1 = det(a, b, c);
  const o2 = det(a, b, d);
  const o3 = det(c, d, a);
  const o4 = det(c, d, b);

  if (o1 === 0 && onSegment(a, c, b)) return true;
  if (o2 === 0 && onSegment(a, d, b)) return true;
  if (o3 === 0 && onSegment(c, a, d)) return true;
  if (o4 === 0 && onSegment(c, b, d)) return true;

  return (o1 > 0) !== (o2 > 0) && (o3 > 0) !== (o4 > 0);
}

export function pointInPolygon(point: GeoPoint, polygon: GeoPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersects =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function nearestBoundaryPoint(point: GeoPoint, polygon: GeoPoint[]): GeoPoint {
  let nearest = polygon[0];
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < polygon.length; i++) {
    const start = polygon[i];
    const end = polygon[(i + 1) % polygon.length];
    const projected = projectPointToSegment(point, start, end);
    const dist = squaredDistance(point, projected);
    if (dist < nearestDistance) {
      nearestDistance = dist;
      nearest = projected;
    }
  }
  return nearest;
}

export function isPointInsideAnyPolygon(point: GeoPoint, polygons: GeoPoint[][]): boolean {
  return polygons.some((polygon) => pointInPolygon(point, polygon));
}

export function resolveClickPoint(point: GeoPoint, otherPolygons: GeoPoint[][]): GeoPoint {
  let resolved = point;
  for (let i = 0; i < 3; i++) {
    let moved = false;
    for (const polygon of otherPolygons) {
      if (pointInPolygon(resolved, polygon)) {
        resolved = nearestBoundaryPoint(resolved, polygon);
        moved = true;
      }
    }
    if (!moved) return resolved;
  }
  return resolved;
}

function crossProduct(origin: GeoPoint, a: GeoPoint, b: GeoPoint): number {
  return (a.lng - origin.lng) * (b.lat - origin.lat) - (a.lat - origin.lat) * (b.lng - origin.lng);
}

/** Convex hull (Andrew monotone chain). Orders arbitrary clicks into outer circuit. */
export function computeConvexHull(points: GeoPoint[]): GeoPoint[] {
  if (points.length <= 1) return [...points];

  const sorted = [...points].sort((a, b) =>
    a.lng === b.lng ? a.lat - b.lat : a.lng - b.lng
  );

  const lower: GeoPoint[] = [];
  for (const point of sorted) {
    while (
      lower.length >= 2 &&
      crossProduct(lower[lower.length - 2], lower[lower.length - 1], point) <= 0
    ) {
      lower.pop();
    }
    lower.push(point);
  }

  const upper: GeoPoint[] = [];
  for (let index = sorted.length - 1; index >= 0; index--) {
    const point = sorted[index];
    while (
      upper.length >= 2 &&
      crossProduct(upper[upper.length - 2], upper[upper.length - 1], point) <= 0
    ) {
      upper.pop();
    }
    upper.push(point);
  }

  lower.pop();
  upper.pop();
  return [...lower, ...upper];
}

export function resolveZoneDrawPath(
  points: GeoPoint[],
  useConvexHull: boolean
): GeoPoint[] {
  if (!useConvexHull || points.length < 3) return points;
  return computeConvexHull(points);
}

const DEFAULT_VERTEX_HIT_TOLERANCE = 0.00012;

export function findNearVertexIndex(
  point: GeoPoint,
  path: GeoPoint[],
  tolerance = DEFAULT_VERTEX_HIT_TOLERANCE
): number | null {
  let nearestIndex: number | null = null;
  let nearestDistance = tolerance;
  for (let index = 0; index < path.length; index++) {
    const dx = path[index].lng - point.lng;
    const dy = path[index].lat - point.lat;
    const distance = Math.hypot(dx, dy);
    if (distance <= nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  }
  return nearestIndex;
}

export function polygonsOverlap(left: GeoPoint[], right: GeoPoint[]): boolean {
  for (let i = 0; i < left.length; i++) {
    const leftStart = left[i];
    const leftEnd = left[(i + 1) % left.length];
    for (let j = 0; j < right.length; j++) {
      const rightStart = right[j];
      const rightEnd = right[(j + 1) % right.length];
      if (segmentsIntersect(leftStart, leftEnd, rightStart, rightEnd)) return true;
    }
  }
  if (left.some((point) => pointInPolygon(point, right))) return true;
  if (right.some((point) => pointInPolygon(point, left))) return true;
  return false;
}
