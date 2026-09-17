import { Stack, Typography } from "@mui/material";
import { Box, Route, Truck } from "lucide-react";

import { StatusChip } from "@/components";
import { RouteCard } from "@/styles/rutas.styles";
import type { RouteSummary } from "@/types/rutas.types";
import {
  ROUTE_TYPE_LABEL,
  getRouteStatusChipConfig,
  getRouteStatusLabel,
} from "./constants";

interface RouteListCardProps {
  route: RouteSummary;
  selected: boolean;
  onSelect: (routeId: number) => void;
}

export function RouteListCard({ route, selected, onSelect }: RouteListCardProps) {
  const statusConfig = getRouteStatusChipConfig(route.status);
  const StatusIcon = statusConfig.Icon;

  return (
    <RouteCard selected={selected} onClick={() => onSelect(route.id)}>
      <Stack flex={1} spacing={0.5} alignItems="flex-start" minWidth={0}>
        <Typography variant="subtitle2" color="primary.main" fontWeight={700}>Ruta {route.name}</Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {route.originBranch?.name ?? "Sin sucursal"}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Box size={16} />
            <Typography variant="body1">{route.articleCount} artículos</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Route size={16} />
            <Typography variant="body1">{route.pointCount} puntos</Typography>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <StatusChip
            size="small"
            startIcon={<Truck size={16} />}
            label={ROUTE_TYPE_LABEL[route.routeType ?? ""]}
          />
          <StatusChip
            variant={statusConfig.variant}
            startIcon={<StatusIcon size={16} />}
            size="small"
            label={getRouteStatusLabel(route.status)}
          />
        </Stack>
      </Stack>
    </RouteCard>
  );
}

const RouteListCardPage = () => null;

export default RouteListCardPage;
