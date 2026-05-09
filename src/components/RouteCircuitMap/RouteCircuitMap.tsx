"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GoogleMapReact from "google-map-react";
import { Typography } from "@mui/material";
import type { RouteMapPayloadApi } from "@/types/rutas-api.types";
import { googleMapsBrowserApiKey } from "@/config/maps";
import { MapPlaceholderLarge } from "@/styles/rutas.styles";
import { theme } from "@/styles/theme";

export interface RouteCircuitMapProps {
  map: RouteMapPayloadApi;
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
  const mapInstanceRef = useRef<unknown>(null);
  const mapsLibRef = useRef<{
    Polyline: new (opts: Record<string, unknown>) => {
      setMap: (m: unknown) => void;
    };
  } | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const handleApiLoaded = useCallback(
    ({ map: gmap, maps }: { map: unknown; maps: typeof mapsLibRef.current }) => {
      mapInstanceRef.current = gmap;
      mapsLibRef.current = maps as typeof mapsLibRef.current;
      setMapReady(true);
    },
    [],
  );

  useEffect(() => {
    const gmap = mapInstanceRef.current;
    const mapsApi = mapsLibRef.current;
    if (!mapReady || !gmap || !mapsApi || map.path.length < 2) {
      return;
    }

    polylineRef.current?.setMap(null);

    const path = map.path.map((p) => ({ lat: p.lat, lng: p.lng }));
    const poly = new mapsApi.Polyline({
      path,
      strokeColor: theme.palette.primary.main,
      strokeOpacity: 1,
      strokeWeight: 5,
      geodesic: true,
    });
    poly.setMap(gmap);
    polylineRef.current = poly;

    return () => {
      poly.setMap(null);
      polylineRef.current = null;
    };
  }, [mapReady, map.path]);

  if (!googleMapsBrowserApiKey) {
    return (
      <MapPlaceholderLarge>
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para ver el mapa de la ruta.
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
        center={map.center}
        defaultCenter={map.center}
        zoom={map.zoom}
        defaultZoom={map.zoom}
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
