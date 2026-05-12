"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GoogleMapReact from "google-map-react";
import { Typography } from "@mui/material";
import type { RouteMapPayloadApi } from "@/types/rutas-api.types";
import { googleMapsBrowserApiKey } from "@/config/maps";
import { MapPlaceholderLarge } from "@/styles/rutas.styles";
import { theme } from "@/styles/theme";

export interface RouteCircuitMapProps {
  map: RouteMapPayloadApi;
}

interface RoutePoint {
  lat: number;
  lng: number;
}

interface RouteLibrary {
  Route: {
    computeRoutes: (request: {
      origin: RoutePoint;
      destination: RoutePoint;
      intermediates?: Array<{ location: RoutePoint }>;
      travelMode: string;
      optimizeWaypointOrder?: boolean;
      fields: string[];
    }) => Promise<{
      routes?: Array<{
        path?: unknown[];
      }>;
    }>;
  };
}

interface GoogleMapLike {
  fitBounds: (bounds: unknown, padding?: number | Record<string, number>) => void;
  getZoom?: () => number;
  setZoom?: (zoom: number) => void;
}

interface GoogleMapsLike {
  Polyline: new (opts: Record<string, unknown>) => {
    setMap: (m: unknown) => void;
  };
  LatLngBounds: new () => {
    extend: (point: RoutePoint) => void;
  };
}

const routePathCache = new Map<string, RoutePoint[]>();

function toCircuitPoints(
  points: readonly RoutePoint[],
): RoutePoint[] {
  if (points.length < 2) {
    return [...points];
  }

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const alreadyClosed =
    firstPoint.lat === lastPoint.lat && firstPoint.lng === lastPoint.lng;

  return alreadyClosed ? [...points] : [...points, firstPoint];
}

function toRoutePoint(point: unknown): RoutePoint | null {
  if (
    typeof point === "object" &&
    point !== null &&
    "lat" in point &&
    "lng" in point
  ) {
    const candidate = point as {
      lat: number | (() => number);
      lng: number | (() => number);
    };
    const latValue =
      typeof candidate.lat === "function" ? candidate.lat() : candidate.lat;
    const lngValue =
      typeof candidate.lng === "function" ? candidate.lng() : candidate.lng;
    if (!Number.isFinite(latValue) || !Number.isFinite(lngValue)) {
      return null;
    }
    return { lat: latValue, lng: lngValue };
  }

  return null;
}

function buildRouteCacheKey(points: readonly RoutePoint[]): string {
  return points
    .map((point) => `${point.lat.toFixed(6)},${point.lng.toFixed(6)}`)
    .join("|");
}

function computeViewportFromPath(points: readonly RoutePoint[]) {
  if (points.length === 0) {
    return {
      center: { lat: 0, lng: 0 },
      zoom: 13,
    };
  }

  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLng = points[0].lng;
  let maxLng = points[0].lng;

  for (const point of points) {
    minLat = Math.min(minLat, point.lat);
    maxLat = Math.max(maxLat, point.lat);
    minLng = Math.min(minLng, point.lng);
    maxLng = Math.max(maxLng, point.lng);
  }

  const center = {
    lat: (minLat + maxLat) / 2,
    lng: (minLng + maxLng) / 2,
  };

  const latFraction = Math.max((maxLat - minLat) / 180, 1e-9);
  const lngFraction = Math.max((maxLng - minLng) / 360, 1e-9);
  const latZoom = Math.log2(1 / latFraction);
  const lngZoom = Math.log2(1 / lngFraction);
  const computedZoom = Math.floor(Math.min(latZoom, lngZoom) + 0.6);
  const zoom = Math.max(11, Math.min(17, computedZoom));

  return { center, zoom };
}

interface StopMarkerProps {
  lat: number;
  lng: number;
  sequence: number;
}

function StopMarker({ sequence }: StopMarkerProps) {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        backgroundColor: theme.palette.primary.main,
        color: "#fff",
        border: "2px solid #FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 700,
        transform: "translate(-50%, -50%)",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.35)",
      }}
    >
      {sequence}
    </div>
  );
}

export function RouteCircuitMap({ map }: RouteCircuitMapProps) {
  const polylineRef = useRef<{ setMap: (m: unknown) => void } | null>(null);
  const mapInstanceRef = useRef<GoogleMapLike | null>(null);
  const mapsLibRef = useRef<GoogleMapsLike | null>(null);
  const requestCounterRef = useRef(0);
  const [mapReady, setMapReady] = useState(false);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const viewport = useMemo(() => {
    const sourcePath =
      map.path.length > 0
        ? map.path.map((point) => ({ lat: point.lat, lng: point.lng }))
        : map.stops.map((stop) => ({ lat: stop.lat, lng: stop.lng }));
    const circuitPath = toCircuitPoints(sourcePath);
    return computeViewportFromPath(circuitPath);
  }, [map.path, map.stops]);

  const handleApiLoaded = useCallback(
    ({ map: gmap, maps }: { map: unknown; maps: typeof mapsLibRef.current }) => {
      mapInstanceRef.current = gmap as GoogleMapLike;
      mapsLibRef.current = maps as GoogleMapsLike;
      setMapLoadError(null);
      setMapReady(true);
    },
    [],
  );

  useEffect(() => {
    const globalRef = globalThis as {
      gm_authFailure?: () => void;
    };
    const previousAuthFailureHandler = globalRef.gm_authFailure;

    globalRef.gm_authFailure = () => {
      setMapLoadError(
        "No fue posible autenticar Google Maps. Verifica que la API key tenga habilitada Maps JavaScript API y permisos para este dominio.",
      );
      previousAuthFailureHandler?.();
    };

    const loadTimeout = setTimeout(() => {
      if (!mapReady) {
        setMapLoadError(
          "No se pudo cargar Google Maps. Revisa bloqueadores de anuncios/extensiones y confirma que la API key esté activa en Google Cloud.",
        );
      }
    }, 10000);

    return () => {
      clearTimeout(loadTimeout);
      globalRef.gm_authFailure = previousAuthFailureHandler;
    };
  }, [mapReady]);

  useEffect(() => {
    const gmap = mapInstanceRef.current;
    const mapsApi = mapsLibRef.current;
    if (!mapReady || !gmap || !mapsApi) {
      return;
    }

    const clearCurrentPolyline = () => {
      polylineRef.current?.setMap(null);
      polylineRef.current = null;
    };

    const fitMapToPath = (path: RoutePoint[]) => {
      if (path.length < 2 || !mapsApi.LatLngBounds) {
        return;
      }
      const bounds = new mapsApi.LatLngBounds();
      path.forEach((point) => bounds.extend(point));
      gmap.fitBounds(bounds, { top: 28, right: 24, bottom: 28, left: 24 });
      const currentZoom = gmap.getZoom?.();
      if (typeof currentZoom === "number" && currentZoom > 16) {
        gmap.setZoom?.(16);
      }
    };

    const drawPolyline = (path: RoutePoint[]) => {
      if (path.length < 2) return;
      clearCurrentPolyline();
      const poly = new mapsApi.Polyline({
        path,
        strokeColor: theme.palette.primary.main,
        strokeOpacity: 1,
        strokeWeight: 5,
        geodesic: true,
      });
      poly.setMap(gmap);
      polylineRef.current = poly;
      fitMapToPath(path);
    };

    const fallbackPath = toCircuitPoints(
      map.path.map((point) => ({ lat: point.lat, lng: point.lng })),
    );
    const orderedStops = [...map.stops]
      .sort((left, right) => left.sequence - right.sequence)
      .map((stop) => ({ lat: stop.lat, lng: stop.lng }));
    const circuitStops = toCircuitPoints(orderedStops);
    const routeCacheKey = buildRouteCacheKey(circuitStops);

    if (circuitStops.length < 2) {
      drawPolyline(fallbackPath);
      return () => clearCurrentPolyline();
    }

    const cachedPath = routePathCache.get(routeCacheKey);
    if (cachedPath && cachedPath.length > 1) {
      drawPolyline(cachedPath);
      return () => clearCurrentPolyline();
    }

    const MAX_POINTS_PER_REQUEST = 25;
    const requestId = ++requestCounterRef.current;
    let cancelled = false;
    const requestRoutesApi = async (points: RoutePoint[]) => {
      const mapsGlobal = (globalThis as {
        google?: {
          maps?: {
            importLibrary?: (libraryName: string) => Promise<unknown>;
          };
        };
      }).google;
      if (!mapsGlobal?.maps?.importLibrary) {
        throw new Error("Google Maps importLibrary is not available.");
      }
      const routesLibrary = await mapsGlobal.maps.importLibrary("routes") as RouteLibrary;
      const routeResponse = await routesLibrary.Route.computeRoutes({
        origin: points[0],
        destination: points[points.length - 1],
        intermediates: points.slice(1, -1).map((point) => ({ location: point })),
        travelMode: "DRIVING",
        optimizeWaypointOrder: false,
        fields: ["path"],
      });
      const routePath = routeResponse.routes?.[0]?.path ?? [];
      const parsedPath = routePath
        .map((point) => toRoutePoint(point))
        .filter((point): point is RoutePoint => point != null);
      if (parsedPath.length < 2) {
        throw new Error("Routes API returned an empty path.");
      }
      return parsedPath;
    };

    const buildChunks = (points: RoutePoint[]) => {
      const chunks: RoutePoint[][] = [];
      for (let start = 0; start < points.length - 1; start += MAX_POINTS_PER_REQUEST - 1) {
        const end = Math.min(start + MAX_POINTS_PER_REQUEST, points.length);
        chunks.push(points.slice(start, end));
        if (end === points.length) break;
      }
      return chunks;
    };

    const drawRouteByRoad = async () => {
      try {
        const chunks = buildChunks(circuitStops);
        const resolvedChunks = await Promise.all(chunks.map((chunk) => requestRoutesApi(chunk)));
        if (cancelled || requestId !== requestCounterRef.current) return;

        const mergedPath = resolvedChunks.flatMap((chunkPath, index) =>
          index === 0 ? chunkPath : chunkPath.slice(1),
        );
        routePathCache.set(routeCacheKey, mergedPath);
        drawPolyline(mergedPath);
      } catch {
        if (cancelled || requestId !== requestCounterRef.current) return;
        routePathCache.set(routeCacheKey, fallbackPath);
        drawPolyline(fallbackPath);
      }
    };

    void drawRouteByRoad();

    return () => {
      cancelled = true;
      clearCurrentPolyline();
    };
  }, [mapReady, map.path, map.stops]);

  if (!googleMapsBrowserApiKey) {
    return (
      <MapPlaceholderLarge>
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para ver el mapa de la ruta.
        </Typography>
      </MapPlaceholderLarge>
    );
  }

  if (mapLoadError) {
    return (
      <MapPlaceholderLarge>
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          {mapLoadError}
        </Typography>
      </MapPlaceholderLarge>
    );
  }

  if (map.path.length === 0) {
    return (
      <MapPlaceholderLarge>
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          No hay coordenadas de ruta para mostrar.
        </Typography>
      </MapPlaceholderLarge>
    );
  }

  return (
    <div style={{ width: "100%", height: 360, borderRadius: 8, overflow: "hidden" }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: googleMapsBrowserApiKey }}
        defaultCenter={viewport.center}
        defaultZoom={viewport.zoom}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={handleApiLoaded}
        options={{
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
        }}
      >
        {map.stops.map((s) => (
          <StopMarker key={s.sequence} lat={s.lat} lng={s.lng} sequence={s.sequence} />
        ))}
      </GoogleMapReact>
    </div>
  );
}
