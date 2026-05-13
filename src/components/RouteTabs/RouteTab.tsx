import dynamic from "next/dynamic";
import { MapPlaceholderLarge } from "@/styles/rutas.styles";
import type { RouteMapPayloadApi } from "@/types/rutas-api.types";

const RouteCircuitMapLazy = dynamic(
  () =>
    import("@/components/RouteCircuitMap").then((module) => ({
      default: module.RouteCircuitMap,
    })),
  {
    ssr: false,
    loading: () => <MapPlaceholderLarge />,
  },
);

export interface RouteTabProps {
  map?: RouteMapPayloadApi | null;
}

export function RouteTab({ map }: RouteTabProps) {
  if (!map || (map.stops.length === 0 && map.path.length === 0)) {
    return <MapPlaceholderLarge />;
  }

  return <RouteCircuitMapLazy map={map} />;
}
