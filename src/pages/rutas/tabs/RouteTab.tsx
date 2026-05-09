import dynamic from "next/dynamic";
import type { RouteMapPayloadApi } from "@/types/rutas-api.types";
import { MapPlaceholderLarge } from "@/styles/rutas.styles";

const RouteCircuitMapLazy = dynamic(
  () =>
    import("@/components/RouteCircuitMap").then((m) => ({
      default: m.RouteCircuitMap,
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
  if (!map?.path?.length) {
    return (
      <MapPlaceholderLarge>
        {/* Empty state is handled by parent loading / no coordinates */}
      </MapPlaceholderLarge>
    );
  }

  return <RouteCircuitMapLazy map={map} />;
}

const RouteTabPage = () => null;

export default RouteTabPage;
