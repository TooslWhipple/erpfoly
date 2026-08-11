import { Button, IconButton, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import dayjs from "@/lib/dayjs";
import {
  RoutesSidebar as RoutesSidebarLayout,
  SidebarHeaderRow,
  NewRouteButton,
  DateHeaderRow,
  DateLabel,
  RoutesList,
  RoundedSkeleton,
} from "@/styles/rutas.styles";
import type { RouteSummary } from "@/types/rutas.types";
import { RouteListCard } from "./RouteListCard";

interface RoutesSidebarProps {
  selectedDate: Date;
  routes: RouteSummary[];
  routesLoading: boolean;
  resolvedRouteId: number | null;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onNewRoute: () => void;
  onSelectRoute: (routeId: number) => void;
}

export function RoutesSidebar({
  selectedDate,
  routes,
  routesLoading,
  resolvedRouteId,
  onPrevDay,
  onNextDay,
  onToday,
  onNewRoute,
  onSelectRoute,
}: RoutesSidebarProps) {
  return (
    <RoutesSidebarLayout>
      <SidebarHeaderRow>
        <DateHeaderRow>
          <IconButton size="small" onClick={onPrevDay}>
            <ChevronLeft size={20} />
          </IconButton>
          <IconButton size="small" onClick={onNextDay}>
            <ChevronRight size={20} />
          </IconButton>
          <DateLabel variant="body1">
            {dayjs(selectedDate).format("dddd DD [de] MMMM")}
          </DateLabel>
          <Button size="small" variant="text" onClick={onToday}>
            Hoy
          </Button>
        </DateHeaderRow>
        <NewRouteButton
          variant="option"
          color="primary"
          startIcon={<Plus size={16} strokeWidth={2} />}
          onClick={onNewRoute}
        >
          Nueva ruta
        </NewRouteButton>
      </SidebarHeaderRow>

      <RoutesList>
        {routesLoading
          ? [1, 2, 3].map((i) => (
              <RoundedSkeleton
                key={i}
                variant="rectangular"
                height={100}
              />
            ))
          : routes.length === 0
            ? (
              <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 2, textAlign: "center" }}>
                No hay rutas para esta fecha
              </Typography>
            )
            : routes.map((route) => (
              <RouteListCard
                key={route.id}
                route={route}
                selected={resolvedRouteId === route.id}
                onSelect={onSelectRoute}
              />
            ))}
      </RoutesList>
    </RoutesSidebarLayout>
  );
}
