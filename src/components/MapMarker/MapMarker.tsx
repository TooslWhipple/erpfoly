"use client";

import { theme } from "@/styles/theme";

export interface MapMarkerProps {
  lat: number;
  lng: number;
  size?: number;
  color?: string;
}

export function MapMarker({
  lat,
  lng,
  size = 18,
  color = theme.palette.app.chip.variants.error.color,
}: MapMarkerProps) {
  return (
    <div
      data-lat={lat}
      data-lng={lng}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        border: "2px solid #FFFFFF",
        backgroundColor: color,
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.35)",
      }}
    />
  );
}
