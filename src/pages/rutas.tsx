import { useState, useEffect, useCallback } from "react";
import { Stack, Typography, Button, IconButton, Skeleton, Divider } from "@mui/material";
import { ChevronLeft, ChevronRight, Plus, User, Car, Package, MapPin, GripVertical, MoreVertical, Clock, Box, Route } from "lucide-react";
import {
  MainLayout,
  Title,
  Tabs,
  DataTable,
  StatusChip,
  FileUpload,
} from "@/components";
import type { TabItem } from "@/components/Tabs";
import type { DataTableColumn } from "@/components/TableCrud";
import type { UploadedFileItem } from "@/components/FileUpload";
import {
  PageContent,
  RouteListPanel,
  RouteDetailPanel,
  RouteCard,
  MapPlaceholder,
  MapPlaceholderLarge,
  DetailHeader,
  TabContent,
  DriverSection,
  PersonRow,
} from "@/styles/rutas.styles";
import { getRoutesByDate, getRouteDetailById } from "@/data/rutas.mockData";
import type { RouteSummary, RouteDetail, RouteArticle } from "@/types/rutas.types";
import { colors } from "@/styles/theme";

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

const ARTICLE_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const ARTICLE_STATUS_VARIANTS: Record<string, "pending" | "success" | "default"> = {
  pending: "pending",
  delivered: "success",
  cancelled: "default",
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
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [routes, setRoutes] = useState<RouteSummary[]>([]);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [routesError, setRoutesError] = useState<string | null>(null);

  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [routeDetail, setRouteDetail] = useState<RouteDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [activeTab, setActiveTab] = useState(TAB_ARTICLES);
  const [cartaPorteFiles, setCartaPorteFiles] = useState<UploadedFileItem[]>([]);

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

  const articlesColumns: DataTableColumn<RouteArticle>[] = [
    {
      id: "drag",
      label: "",
      format: () => <GripVertical size={16} color={colors.text.secondary} />,
    },
    { id: "invoiceNumber", label: "Factura" },
    {
      id: "status",
      label: "Estatus",
      type: "chip",
      chipLabelMap: ARTICLE_STATUS_LABELS,
      chipVariantMap: ARTICLE_STATUS_VARIANTS,
      format: (_, row) => (
        <StatusChip
          variant={ARTICLE_STATUS_VARIANTS[row.status] ?? "default"}
          label={ARTICLE_STATUS_LABELS[row.status] ?? row.status}
          startIcon={row.status === "pending" ? <Clock size={14} /> : undefined}
        />
      ),
    },
    { id: "articleName", label: "Artículo" },
    { id: "zone", label: "Zona" },
    { id: "address", label: "Dirección" },
    {
      id: "menu",
      label: "",
      format: () => <IconButton size="small"><MoreVertical size={18} /></IconButton>,
    },
  ];

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
          <RouteDetailPanel>
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
              <>
                <DetailHeader>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                    <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
                      <Typography variant="h6">{routeDetail.name}</Typography>
                      <StatusChip
                        variant="pending"
                        size="small"
                        label={STATUS_LABEL[routeDetail.status] ?? routeDetail.status}
                      />
                    </Stack>
                    <MapPlaceholder style={{ width: 120, height: 72 }} />
                  </Stack>
                  <Typography variant="subtitle1" color="text.secondary" mt={0.5}>
                    {routeDetail.location}
                  </Typography>
                  <Stack direction="row" alignItems="center" flexWrap="wrap" gap={2} mt={1.5}>
                    <Stack direction="row" alignItems="center" gap={0.5}>
                      <Package size={16} color={colors.text.secondary} />
                      <Typography variant="body2">{routeDetail.articleCount} artículos</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap={0.5}>
                      <MapPin size={16} color={colors.text.secondary} />
                      <Typography variant="body2">{routeDetail.pointCount} puntos</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap={0.5}>
                      <User size={16} color={colors.text.secondary} />
                      <Typography variant="body2">{routeDetail.driverName}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap={0.5}>
                      <Car size={16} color={colors.text.secondary} />
                      <Typography variant="body2">{routeDetail.vehicleInfo}</Typography>
                    </Stack>
                  </Stack>
                </DetailHeader>

                <Stack direction="row" alignItems="flex-end" sx={{ borderBottom: `1px solid ${colors.border}`, px: 2 }}>
                  <Tabs
                    tabs={TABS}
                    value={activeTab}
                    onChange={setActiveTab}
                    rightContent={
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Plus size={16} />}
                        onClick={() => { }}
                      >
                        Agregar
                      </Button>
                    }
                  />
                </Stack>

                <TabContent>
                  {activeTab === TAB_ARTICLES && (
                    <DataTable<RouteArticle>
                      columns={articlesColumns}
                      rows={routeDetail.articles}
                      rowKey="id"
                      emptyMessage="No hay artículos en esta ruta."
                    />
                  )}

                  {activeTab === TAB_ROUTE && (
                    <MapPlaceholderLarge />
                  )}

                  {activeTab === TAB_CARTA_PORTE && (
                    <FileUpload
                      value={cartaPorteFiles}
                      onChange={setCartaPorteFiles}
                      placeholder="Cargar carta porte"
                      accept={["image/*", "application/pdf"]}
                    />
                  )}

                  {activeTab === TAB_DRIVER && (
                    <Stack spacing={2}>
                      <DriverSection>
                        <Typography variant="subtitle2" gutterBottom>
                          Chofer
                        </Typography>
                        {routeDetail.driver ? (
                          <PersonRow>
                            <Stack direction="row" alignItems="center" gap={1}>
                              <User size={18} color={colors.text.secondary} />
                              <Typography variant="body2">{routeDetail.driver.name}</Typography>
                            </Stack>
                            <IconButton size="small" onClick={() => { }} aria-label="Remove driver">
                              <Typography sx={{ fontSize: 18 }}>−</Typography>
                            </IconButton>
                          </PersonRow>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Sin asignar
                          </Typography>
                        )}
                      </DriverSection>
                      <DriverSection>
                        <Typography variant="subtitle2" gutterBottom>
                          Ayudantes
                        </Typography>
                        {routeDetail.assistants.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            Sin ayudantes
                          </Typography>
                        ) : (
                          routeDetail.assistants.map((a) => (
                            <PersonRow key={a.id}>
                              <Stack direction="row" alignItems="center" gap={1}>
                                <User size={18} color={colors.text.secondary} />
                                <Typography variant="body2">{a.name}</Typography>
                              </Stack>
                              <IconButton size="small" onClick={() => { }} aria-label="Remove">
                                <Typography sx={{ fontSize: 18 }}>−</Typography>
                              </IconButton>
                            </PersonRow>
                          ))
                        )}
                      </DriverSection>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Plus size={16} />}
                        onClick={() => { }}
                      >
                        Agregar otro
                      </Button>
                    </Stack>
                  )}
                </TabContent>
              </>
            ) : (
              <Stack flex={1} alignItems="center" justifyContent="center" p={4}>
                <Typography variant="body2" color="text.secondary">
                  No se encontró la ruta
                </Typography>
              </Stack>
            )}
          </RouteDetailPanel>
        </Stack>
      </Stack>
    </MainLayout>
  );
}
