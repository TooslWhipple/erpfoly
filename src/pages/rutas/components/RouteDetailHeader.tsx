import { Button, Stack, Typography } from "@mui/material";
import { Box, Repeat2, Route, Truck } from "lucide-react";

import { StatusChip } from "@/components";
import { DetailHeader } from "@/styles/rutas.styles";
import { theme } from "@/styles/theme";
import { formatDateOnly } from "@/utils/date";
import type { RouteDetailView } from "@/utils/rutas-api.mapper";
import {
  ROUTE_TYPE_LABEL,
  getRouteStatusChipConfig,
  getRouteStatusLabel,
} from "./constants";

interface RouteDetailHeaderProps {
  routeDetail: RouteDetailView;
}

export function RouteDetailHeader({ routeDetail }: RouteDetailHeaderProps) {
  const statusConfig = getRouteStatusChipConfig(routeDetail.status);
  const StatusIcon = statusConfig.Icon;

  return (
    <DetailHeader>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "flex-start" }}
        spacing={2}
      >
        <Stack spacing={1} flex={1} minWidth={0}>
          <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
            <Typography variant="h6" color="primary.main">Ruta {routeDetail.name}</Typography>
            <StatusChip
              size="small"
              startIcon={<Truck size={16} />}
              label={ROUTE_TYPE_LABEL[routeDetail.routeType ?? ""]}
            />
            <StatusChip
              variant={statusConfig.variant}
              startIcon={<StatusIcon size={16} />}
              size="small"
              label={getRouteStatusLabel(routeDetail.status)}
            />
          </Stack>
          <Typography variant="h3">{routeDetail.originBranch?.name ?? "Sin sucursal"}</Typography>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            flexWrap="wrap"
          >
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Box size={16} color={theme.palette.text.secondary} />
              <Typography variant="body2">
                {routeDetail.articleCount} artículos
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Route size={16} color={theme.palette.text.secondary} />
              <Typography variant="body2">
                {routeDetail.pointCount} puntos
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Repeat2 size={14} color={theme.palette.text.secondary} />
            <Typography variant="body2" color="text.secondary">
              {routeDetail.scheduledDate
                ? formatDateOnly(
                  routeDetail.scheduledDate,
                  "D [de] MMMM, YYYY",
                )
                : "—"}
            </Typography>
            <Button variant="text" size="small">
              Editar
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </DetailHeader>
  );
}

const RouteDetailHeaderPage = () => null;

export default RouteDetailHeaderPage;
