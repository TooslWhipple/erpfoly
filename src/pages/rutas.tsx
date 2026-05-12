import { useState, useEffect, useCallback } from "react";
import { Stack, Typography, IconButton, Skeleton, Divider, Button } from "@mui/material";
import { ChevronLeft, ChevronRight, User, Box, Route, Truck, PlusCircle } from "lucide-react";
import {
  MainLayout,
  StatusChip,
  TabFilters,
} from "@/components";
import type { TabItem } from "@/components/Tabs";
import type { UploadedFileItem } from "@/components/FileUpload";
import {
  RouteCard,
  MapPlaceholder,
  DetailHeader,
} from "@/styles/rutas.styles";
import { ArticlesTab, RouteTab, CartaPorteTab, DriverTab } from "@/pages/rutas/tabs";
import { AddArticlesToRouteModal } from "@/pages/rutas/AddArticlesToRouteModal";
import { getRoutesByDate, getRouteDetailById } from "@/data/rutas.mockData";
import type { RouteSummary, RouteDetail } from "@/types/rutas.types";
import { theme } from "@/styles/theme";
import { usePermissions } from "@/hooks/usePermissions";
import { ROUTE_ARTICLES_UPDATE } from "@/lib/permissions";

// ============================================================================
// CONSTANTS
// ============================================================================

const TAB_ARTICLES = "articles";
const TAB_ROUTE = "route";
const TAB_CARTA_PORTE = "carta_porte";
const TAB_DRIVER = "driver";

const TABS: TabItem[] = [
  { value: TAB_ARTICLES, label: "Artículos" },
  { value: TAB_ROUTE, label: "Ruta" },
  { value: TAB_CARTA_PORTE, label: "Carta porte" },
  { value: TAB_DRIVER, label: "Chofer y ayudantes" },
];

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Agendada",
  in_progress: "En curso",
  completed: "Completada",
  cancelled: "Cancelada",
};

// ============================================================================
// DATE HELPERS
// ============================================================================

function formatDateLabel(date: Date): string {
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

// ============================================================================
// PAGE
// ============================================================================

export default function RutaPage() {
  const { hasPermission } = usePermissions();
  const canUpdateRouteArticles = hasPermission(ROUTE_ARTICLES_UPDATE);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [routes, setRoutes] = useState<RouteSummary[]>([]);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [routesError, setRoutesError] = useState<string | null>(null);

  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [routeDetail, setRouteDetail] = useState<RouteDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [activeTab, setActiveTab] = useState(TAB_ARTICLES);
  const [cartaPorteFiles, setCartaPorteFiles] = useState<UploadedFileItem[]>([]);
  const [addArticlesModalOpen, setAddArticlesModalOpen] = useState(false);

  const loadRoutes = useCallback(async () => {
    setRoutesLoading(true);
    setRoutesError(null);
    try {
      const data = await getRoutesByDate(selectedDate);
      setRoutes(data);
      if (data.length > 0 && !selectedRouteId) {
        setSelectedRouteId(data[0].id);
      }
    } catch {
      setRoutesError("No se pudieron cargar las rutas.");
    } finally {
      setRoutesLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const loadRouteDetail = useCallback(async (id: number) => {
    setDetailLoading(true);
    try {
      const detail = await getRouteDetailById(id);
      setRouteDetail(detail ?? null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRouteId != null) {
      loadRouteDetail(selectedRouteId);
    } else {
      setRouteDetail(null);
    }
  }, [selectedRouteId, loadRouteDetail]);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <MainLayout>
      <Stack
        spacing={1.5}
        direction="row"
        height="100%"
        divider={<Divider orientation="vertical" flexItem />}>

        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1} minWidth="260px">
            <IconButton
              size="small"
              onClick={handlePrevDay}>
              <ChevronLeft size={20} />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleNextDay}>
              <ChevronRight size={20} />
            </IconButton>
            <Typography variant="body1" fontWeight={500}>{formatDateLabel(selectedDate)}</Typography>
          </Stack>
          {
            routesLoading ?
              [1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
              ))
              : routesError ?
                <Typography variant="body2" color="error">{routesError}</Typography>
                :
                routes.map((route) => (
                  <RouteCard
                    key={route.id}
                    selected={selectedRouteId === route.id}
                    onClick={() => setSelectedRouteId(route.id)}
                  >
                    <MapPlaceholder />
                    <Stack flex={1} spacing={0.5} alignItems="flex-start">
                      <Typography variant="subtitle2" fontWeight={700} color="primary.main">{route.name}</Typography>
                      <StatusChip
                        size="small"
                        label={STATUS_LABEL[route.status] ?? route.status}
                      />
                      <Typography variant="body1" fontWeight={600}>{route.location}</Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Box size={16} />
                        <Typography variant="body1">{route.articleCount} artículos</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Route size={16} />
                        <Typography variant="body1">{route.pointCount} puntos</Typography>
                      </Stack>
                    </Stack>
                  </RouteCard>
                ))
          }



        </Stack>

        <Stack flex={1}>
          {!selectedRouteId ? (
            <Stack flex={1} alignItems="center" justifyContent="center" p={4}>
              <Typography variant="body2" color="text.secondary">
                Selecciona una ruta
              </Typography>
            </Stack>
          ) : detailLoading ? (
            <Stack flex={1} p={3} spacing={2}>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
            </Stack>
          ) : routeDetail ? (
            <Stack spacing={2}>
              <DetailHeader>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="h6" color="primary.main">{routeDetail.name}</Typography>
                  <StatusChip
                    variant="pending"
                    size="small"
                    label={STATUS_LABEL[routeDetail.status] ?? routeDetail.status}
                  />
                </Stack>

                <Typography variant="h5">{routeDetail.location}</Typography>

                <Stack direction="row" alignItems="center" spacing={2}>
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Box size={16} color={theme.palette.text.secondary} />
                    <Typography variant="body2">{routeDetail.articleCount} artículos</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Route size={16} color={theme.palette.text.secondary} />
                    <Typography variant="body2">{routeDetail.pointCount} puntos</Typography>
                  </Stack>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={2}>
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <User size={16} color={theme.palette.text.secondary} />
                    <Typography variant="body2">{routeDetail.driverName}</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Truck size={16} color={theme.palette.text.secondary} />
                    <Typography variant="body2">{routeDetail.vehicleInfo}</Typography>
                  </Stack>
                </Stack>
              </DetailHeader>

              <Stack spacing={2} direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center">
                <TabFilters
                  tabs={TABS}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
                {canUpdateRouteArticles && (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<PlusCircle size={16} />}
                    onClick={() => setAddArticlesModalOpen(true)}
                  >
                    Agregar
                  </Button>
                )}
              </Stack>

              {activeTab === TAB_ARTICLES && (
                <ArticlesTab articles={routeDetail.articles} />
              )}

              {activeTab === TAB_ROUTE && <RouteTab />}

              {activeTab === TAB_CARTA_PORTE && (
                <CartaPorteTab
                  value={cartaPorteFiles}
                  onChange={setCartaPorteFiles}
                />
              )}

              {activeTab === TAB_DRIVER && (
                <DriverTab routeDetail={routeDetail} />
              )}

              {
                selectedRouteId && (
                  <AddArticlesToRouteModal
                    open={addArticlesModalOpen}
                    onClose={() => setAddArticlesModalOpen(false)}
                    routeId={selectedRouteId}
                    onConfirm={async (articleIds) => {
                      if (selectedRouteId) await loadRouteDetail(selectedRouteId);
                    }}
                  />
                )
              }
            </Stack>
          ) :
            <Typography variant="body2" color="text.secondary">
              No se encontró la ruta
            </Typography>
          }
        </Stack>
      </Stack>
    </MainLayout>
  );
}
