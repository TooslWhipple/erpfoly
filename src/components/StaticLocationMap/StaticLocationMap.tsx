import dynamic from "next/dynamic";
import type { Props as GoogleMapReactProps, Point } from "google-map-react";
import { Box } from "@mui/material";

const GoogleMapReact = dynamic<GoogleMapReactProps>(() => import("google-map-react"), { ssr: false });

interface MapMarkerProps {
  lat: number;
  lng: number;
}

function MapMarker({ lat, lng }: MapMarkerProps) {
  return (
    <div
      data-lat={lat}
      data-lng={lng}
      style={{
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        border: "2px solid #FFFFFF",
        backgroundColor: "#ef4444",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.35)",
        transform: "translate(-50%, -50%)",
      }}
    />
  );
}

/**
 * google-map-react calcula la distancia del mouse a cada marcador en cada
 * mousemove usando una caché interna de posiciones en píxeles. Si el mouse
 * se mueve antes de que esa caché registre el marcador (p. ej. justo después
 * de montar el mapa o de cambiar el centro), la posición llega undefined y
 * su implementación por defecto truena leyendo `.x`. Esta versión defensiva
 * evita el crash tratando esos casos como "lejos del mouse".
 */
function safeDistanceToMouse(markerPos: Point | undefined, mousePos: Point): number {
  if (!markerPos || !mousePos) {
    return Infinity;
  }
  return Math.sqrt((markerPos.x - mousePos.x) ** 2 + (markerPos.y - mousePos.y) ** 2);
}

interface StaticLocationMapProps {
  coords: { lat: number; lng: number };
  apiKey: string;
  height?: number;
  borderRadius?: number;
}

export function StaticLocationMap({ coords, apiKey, height = 130, borderRadius = 1 }: StaticLocationMapProps) {
  return (
    <Box sx={{ width: "100%", height, borderRadius, overflow: "hidden" }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: apiKey }}
        center={coords}
        defaultCenter={coords}
        defaultZoom={16}
        zoom={16}
        distanceToMouse={safeDistanceToMouse}
        options={{
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
        }}
      >
        <MapMarker lat={coords.lat} lng={coords.lng} />
      </GoogleMapReact>
    </Box>
  );
}
