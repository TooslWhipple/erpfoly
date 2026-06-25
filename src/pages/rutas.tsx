import { useCallback, useMemo, useState } from "react";
import {
  Stack,
  Typography,
  IconButton,
  Skeleton,
  Divider,
  Button,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Box,
  Route,
  Truck,
  PlusCircle,
  Save
} from "lucide-react";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  MainLayout,
  StatusChip,
  TabFilters,
  AddOrdersToRouteModal,
  AddDriverToRouteModal,
  AddAssistantToRouteModal,
  ConfirmModal,
} from "@/components";
import type { TabItem } from "@/components/Tabs";
import type { UploadedFileItem } from "@/components/FileUpload";
import {
  RouteCard,
  MapPlaceholder,
  DetailHeader,
  RouteMiniMapThumb,
  DetailMiniMap,
} from "@/styles/rutas.styles";
import { ArticlesTab, RouteTab, CartaPorteTab, DriverTab } from "@/components/RouteTabs";
import type { RouteSummary } from "@/types/rutas.types";
import { theme } from "@/styles/theme";
import { usePermissions } from "@/hooks/usePermissions";
import {
  ROUTE_ARTICLES_UPDATE,
  ROUTES_UPDATE,
} from "@/lib/permissions";

import {
  addAssistantToRoute,
  addOrdersToRoute,
  assignDriverToRoute,
  deleteCartaPorteDocument,
  fetchAvailableAssistants,
  fetchAvailableDrivers,
  fetchAvailableOrders,
  fetchRouteDetail,
  fetchRoutesForDate,
  removeAssistantFromRoute,
  removeDriverFromRoute,
  updateRouteVehicleInfo,
  uploadCartaPorte,
} from "@/services/rutas.service";
import type { RouteDetailApi } from "@/types/rutas-api.types";
import {
  mapRouteDetailApiToView,
  mapRouteListRowToSummary,
  type RouteDetailView,
} from "@/utils/rutas-api.mapper";
import { getApiErrorMessage, unwrapOrThrow } from "@/lib/axios";
import { useSnackbarStore } from "@/store/useSnackbarStore";

interface RouteCartaUploadSectionProps {
  serverFiles: UploadedFileItem[];
  onPendingLocalFile: (file: File | undefined) => void;
  onRemoveServerDocument: (documentId: number) => void;
}

function RouteCartaUploadSection({
  serverFiles,
  onPendingLocalFile,
  onRemoveServerDocument,
}: RouteCartaUploadSectionProps) {
  const [addon, setAddon] = useState<UploadedFileItem[]>([]);
  const merged = useMemo(
    () => [...serverFiles, ...addon],
    [serverFiles, addon],
  );

  const handleChange = useCallback(
    (files: UploadedFileItem[]) => {
      const serverIds = new Set(serverFiles.map((f) => f.id));

      const hasNewLocalReplace =
        files.some((f) => f.file) &&
        serverFiles.length > 0 &&
        files.length > 0 &&
        !files.some((f) => serverIds.has(f.id));

      if (hasNewLocalReplace) {
        const locals = files.filter((f) => f.file);
        setAddon(locals);
        onPendingLocalFile(locals.find((f) => f.file)?.file);
        return;
      }

      const removedServers = serverFiles.filter(
        (sf) => !files.some((f) => f.id === sf.id),
      );
      for (const sf of removedServers) {
        const docId = Number(sf.id);
        if (Number.isFinite(docId)) {
          onRemoveServerDocument(docId);
        }
      }

      const nextAddon = files.filter((f) => !serverIds.has(f.id));
      setAddon(nextAddon);
      onPendingLocalFile(nextAddon.find((f) => f.file)?.file);
    },
    [serverFiles, onPendingLocalFile, onRemoveServerDocument],
  );

  return <CartaPorteTab value={merged} onChange={handleChange} />;
}

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

type PendingRemoval =
  | { kind: "driver"; name: string }
  | { kind: "assistant"; id: number; name: string }
  | null;


function formatDateLabel(date: Date): string {
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`;
}

export default function RutaPage() {
  const { hasPermission } = usePermissions();
  const canUpdateRouteArticles = hasPermission(ROUTE_ARTICLES_UPDATE);
  const canManageRoute = hasPermission(ROUTES_UPDATE);

  const queryClient = useQueryClient();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const routeDateStr = useMemo(
    () => dayjs(selectedDate).format("YYYY-MM-DD"),
    [selectedDate],
  );

  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(TAB_ARTICLES);
  const [addOrdersModalOpen, setAddOrdersModalOpen] = useState(false);
  const [addDriverModalOpen, setAddDriverModalOpen] = useState(false);
  const [addAssistantModalOpen, setAddAssistantModalOpen] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval>(null);
  const [pendingCartaLocalFile, setPendingCartaLocalFile] = useState<File | undefined>(undefined);
  const [cartaPanelKey, setCartaPanelKey] = useState(0);

  const routesQuery = useQuery({
    queryKey: ["routes", routeDateStr],
    queryFn: async () => {
      const res = await fetchRoutesForDate({
        routeDate: routeDateStr,
        page: 1,
        limit: 50,
      });
      return unwrapOrThrow(res);
    },
  });

  const routes: RouteSummary[] = useMemo(() => {
    const rows = routesQuery.data?.rows ?? [];
    return rows.map(mapRouteListRowToSummary);
  }, [routesQuery.data?.rows]);

  const resolvedRouteId = useMemo(() => {
    if (!routes.length) return null;
    if (
      selectedRouteId != null &&
      routes.some((r) => r.id === selectedRouteId)
    ) {
      return selectedRouteId;
    }
    return routes[0].id;
  }, [routes, selectedRouteId]);

  const detailQuery = useQuery({
    queryKey: ["route-detail", resolvedRouteId],
    queryFn: async () => {
      const res = await fetchRouteDetail(resolvedRouteId!);
      return unwrapOrThrow(res);
    },
    enabled: resolvedRouteId != null,
  });

  const routeDetail: RouteDetailView | null = useMemo(() => {
    const raw = detailQuery.data;
    if (!raw) return null;
    return mapRouteDetailApiToView(raw);
  }, [detailQuery.data]);

  const addOrdersMutation = useMutation({
    mutationFn: async ({
      routeId,
      orderIds,
    }: {
      routeId: number;
      orderIds: number[];
    }) => {
      const res = await addOrdersToRoute(routeId, orderIds);
      return unwrapOrThrow(res);
    },
    onSuccess: (data, vars) => {
      queryClient.setQueryData<RouteDetailApi>(
        ["route-detail", vars.routeId],
        data,
      );
      queryClient.invalidateQueries({ queryKey: ["routes", routeDateStr] });
      showSuccess("Pedidos agregados a la ruta.");
    },
    onError: (err) => {
      const detail = getApiErrorMessage(err);
      showError(
        detail
          ? `No se pudieron agregar los pedidos: ${detail}`
          : "No se pudieron agregar los pedidos.",
      );
    },
  });

  const uploadCartaMutation = useMutation({
    mutationFn: async ({
      routeId,
      file,
    }: {
      routeId: number;
      file: File;
    }) => {
      const res = await uploadCartaPorte(routeId, file);
      return unwrapOrThrow(res);
    },
    onSuccess: (data, vars) => {
      queryClient.setQueryData<RouteDetailApi>(
        ["route-detail", vars.routeId],
        data,
      );
      queryClient.invalidateQueries({ queryKey: ["routes", routeDateStr] });
      setPendingCartaLocalFile(undefined);
      setCartaPanelKey((k) => k + 1);
      showSuccess("Carta porte guardada.");
    },
    onError: (err) => {
      const detail = getApiErrorMessage(err);
      showError(
        detail
          ? `No se pudo guardar la carta porte: ${detail}`
          : "No se pudo guardar la carta porte.",
      );
    },
  });

  const deleteCartaMutation = useMutation({
    mutationFn: async ({
      routeId,
      documentId,
    }: {
      routeId: number;
      documentId: number;
    }) => {
      const res = await deleteCartaPorteDocument(routeId, documentId);
      return unwrapOrThrow(res);
    },
    onMutate: async ({ routeId, documentId }) => {
      await queryClient.cancelQueries({
        queryKey: ["route-detail", routeId],
      });
      const previous = queryClient.getQueryData<RouteDetailApi>([
        "route-detail",
        routeId,
      ]);
      if (previous) {
        queryClient.setQueryData<RouteDetailApi>(["route-detail", routeId], {
          ...previous,
          carta_porte_files: previous.carta_porte_files.filter(
            (f) => String(f.id) !== String(documentId),
          ),
        });
      }
      return { previous };
    },
    onError: (err, vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(
          ["route-detail", vars.routeId],
          ctx.previous,
        );
      }
      const detail = getApiErrorMessage(err);
      showError(
        detail
          ? `No se pudo eliminar la carta porte: ${detail}`
          : "No se pudo eliminar la carta porte.",
      );
    },
    onSuccess: (data, vars) => {
      queryClient.setQueryData<RouteDetailApi>(
        ["route-detail", vars.routeId],
        data,
      );
      queryClient.invalidateQueries({ queryKey: ["routes", routeDateStr] });
      showSuccess("Carta porte eliminada.");
    },
  });

  const assignDriverMutation = useMutation({
    mutationFn: async ({
      routeId,
      userId,
    }: {
      routeId: number;
      userId: number;
    }) => {
      const res = await assignDriverToRoute(routeId, userId);
      return unwrapOrThrow(res);
    },
    onSuccess: (data, vars) => {
      queryClient.setQueryData<RouteDetailApi>(
        ["route-detail", vars.routeId],
        data,
      );
      queryClient.invalidateQueries({ queryKey: ["routes", routeDateStr] });
      showSuccess("Chofer asignado correctamente.");
    },
  });

  const removeDriverMutation = useMutation({
    mutationFn: async ({ routeId }: { routeId: number }) => {
      const res = await removeDriverFromRoute(routeId);
      return unwrapOrThrow(res);
    },
    onSuccess: (data, vars) => {
      queryClient.setQueryData<RouteDetailApi>(
        ["route-detail", vars.routeId],
        data,
      );
      queryClient.invalidateQueries({ queryKey: ["routes", routeDateStr] });
      showSuccess("Chofer eliminado correctamente.");
    },
  });

  const addAssistantMutation = useMutation({
    mutationFn: async ({
      routeId,
      userId,
    }: {
      routeId: number;
      userId: number;
    }) => {
      const res = await addAssistantToRoute(routeId, userId);
      return unwrapOrThrow(res);
    },
    onSuccess: (data, vars) => {
      queryClient.setQueryData<RouteDetailApi>(
        ["route-detail", vars.routeId],
        data,
      );
      queryClient.invalidateQueries({ queryKey: ["routes", routeDateStr] });
      showSuccess("Ayudante agregado correctamente.");
    },
  });

  const removeAssistantMutation = useMutation({
    mutationFn: async ({
      routeId,
      userId,
    }: {
      routeId: number;
      userId: number;
    }) => {
      const res = await removeAssistantFromRoute(routeId, userId);
      return unwrapOrThrow(res);
    },
    onSuccess: (data, vars) => {
      queryClient.setQueryData<RouteDetailApi>(
        ["route-detail", vars.routeId],
        data,
      );
      queryClient.invalidateQueries({ queryKey: ["routes", routeDateStr] });
      showSuccess("Ayudante eliminado correctamente.");
    },
  });

  const fetchOrdersForModal = useCallback(async (routeId: number) => {
    const res = await fetchAvailableOrders(routeId);
    const data = unwrapOrThrow(res);
    return data.rows.map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      address: row.address,
      zone: row.zone,
      articleCount: row.article_count,
    }));
  }, []);

  const fetchDriversForModal = useCallback(async (routeId: number) => {
    const res = await fetchAvailableDrivers(routeId, {
      page: 1,
      limit: 100,
    });
    return unwrapOrThrow(res).rows;
  }, []);

  const fetchAssistantsForModal = useCallback(async (routeId: number) => {
    const res = await fetchAvailableAssistants(routeId, {
      page: 1,
      limit: 100,
    });
    return unwrapOrThrow(res).rows;
  }, []);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
    if (activeTab === TAB_ROUTE) {
      setActiveTab(TAB_ARTICLES);
    }
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
    if (activeTab === TAB_ROUTE) {
      setActiveTab(TAB_ARTICLES);
    }
  };

  const handleToday = () => {
    setSelectedDate(new Date());
    if (activeTab === TAB_ROUTE) {
      setActiveTab(TAB_ARTICLES);
    }
  };

  const handleConfirmAddOrders = async (orderIds: string[]) => {
    if (!resolvedRouteId || orderIds.length === 0) return;
    const parsedOrderIds = orderIds
      .map((id) => Number.parseInt(id, 10))
      .filter((n) => Number.isFinite(n));
    await addOrdersMutation.mutateAsync({
      routeId: resolvedRouteId,
      orderIds: parsedOrderIds,
    });
  };

  const handleConfirmAssignDriver = async (userId: number) => {
    if (!resolvedRouteId) return;
    await assignDriverMutation.mutateAsync({
      routeId: resolvedRouteId,
      userId,
    });
  };

  const handleConfirmAddAssistant = async (userId: number) => {
    if (!resolvedRouteId) return;
    await addAssistantMutation.mutateAsync({
      routeId: resolvedRouteId,
      userId,
    });
  };

  const handleSaveCartaPorte = async () => {
    if (!resolvedRouteId || !pendingCartaLocalFile) return;
    await uploadCartaMutation.mutateAsync({
      routeId: resolvedRouteId,
      file: pendingCartaLocalFile,
    });
  };

  const handleRemoveCartaServerDocument = useCallback(
    (documentId: number) => {
      if (resolvedRouteId == null) return;
      deleteCartaMutation.mutate({
        routeId: resolvedRouteId,
        documentId,
      });
    },
    [resolvedRouteId, deleteCartaMutation],
  );

  const handleRequestRemoveAssistant = (assistantId: string) => {
    const assistant = routeDetail?.assistants.find(
      (a) => a.id === assistantId,
    );
    setPendingRemoval({
      kind: "assistant",
      id: Number(assistantId),
      name: assistant?.name ?? "",
    });
  };

  const handleConfirmRemove = async () => {
    if (!pendingRemoval || !resolvedRouteId) return;
    if (pendingRemoval.kind === "assistant") {
      await removeAssistantMutation.mutateAsync({
        routeId: resolvedRouteId,
        userId: pendingRemoval.id,
      });
    } else if (pendingRemoval.kind === "driver") {
      await removeDriverMutation.mutateAsync({ routeId: resolvedRouteId });
    }
    setPendingRemoval(null);
  };

  const routesLoading = routesQuery.isLoading;
  const detailLoading = detailQuery.isFetching;

  const renderTabActionButton = () => {
    if (activeTab === TAB_DRIVER) {
      return null;
    }
    if (activeTab === TAB_CARTA_PORTE) {
      return (
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Save size={16} />}
          onClick={() => void handleSaveCartaPorte()}
          disabled={
            !pendingCartaLocalFile ||
            uploadCartaMutation.isPending ||
            resolvedRouteId == null
          }
        >
          Guardar
        </Button>
      );
    }
    return (
      <Button
        variant="option"
        color="primary"
        startIcon={<PlusCircle size={16} />}
        onClick={() => setAddOrdersModalOpen(true)}
      >
        Agregar
      </Button>
    );
  };

  return (
    <MainLayout>
      <Stack direction={{ xs: "column", md: "row" }} height="100%" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
        <Stack spacing={1} flex="0 1 272px">
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="nowrap" minWidth="260px">
            <IconButton size="small" onClick={handlePrevDay}>
              <ChevronLeft size={20} />
            </IconButton>
            <IconButton size="small" onClick={handleNextDay}>
              <ChevronRight size={20} />
            </IconButton>
            <Typography variant="body1" fontWeight={500} style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{formatDateLabel(selectedDate)}</Typography>
            <Button
              size="small"
              variant="text"
              onClick={handleToday}>Hoy</Button>
          </Stack>
          {
            routesLoading ?
              [1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={100}
                  sx={{ borderRadius: 1 }}
                />
              ))
              :
              routes.map((route) => (
                <RouteCard
                  key={route.id}
                  selected={resolvedRouteId === route.id}
                  onClick={() => {
                    setSelectedRouteId(route.id);
                    setActiveTab(TAB_ARTICLES);
                  }}>
                  {
                    (route.miniMapUrl) ?
                      <RouteMiniMapThumb src={route.miniMapUrl} alt="" loading="lazy" decoding="async" />
                      :
                      <MapPlaceholder />
                  }
                  <Stack flex={1} spacing={0.5} alignItems="flex-start">
                    <Typography variant="subtitle2" color="primary.main" fontWeight={700}>{route.name}</Typography>
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
          {
            (routesLoading) ?
              <Stack flex={1} p={3} spacing={2}>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 1 }} />
              </Stack>
              : (routes.length === 0) ?
                <Stack flex={1} alignItems="center" justifyContent="center" p={4}>
                  <Typography variant="body2" color="text.secondary">No hay rutas para esta fecha</Typography>
                </Stack>
                : (resolvedRouteId == null) ?
                  <Stack flex={1} alignItems="center" justifyContent="center" p={4}>
                    <Typography variant="body2" color="text.secondary">Selecciona una ruta</Typography>
                  </Stack>
                  : (detailLoading && !routeDetail) ?
                    <Stack flex={1} p={3} spacing={2}>
                      <Skeleton variant="text" width="60%" height={32} />
                      <Skeleton variant="text" width="40%" />
                      <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
                    </Stack>
                    : detailQuery.isError
                      ? <Typography variant="body2" color="error">No se pudo cargar el detalle de la ruta.</Typography>
                      : (routeDetail) ?
                        <Stack spacing={2}>
                          <DetailHeader>
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              justifyContent="space-between"
                              alignItems={{ xs: "flex-start", sm: "flex-start" }}
                              gap={2}
                            >
                              <Stack spacing={1} flex={1} minWidth={0}>
                                <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                                  <Typography variant="h6" color="primary.main">{routeDetail.name}</Typography>
                                  <StatusChip
                                    variant="pending"
                                    size="small"
                                    label={STATUS_LABEL[routeDetail.status] ?? routeDetail.status}
                                  />
                                </Stack>

                                <Typography variant="h5">{routeDetail.location}</Typography>

                                <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                                  <Stack direction="row" alignItems="center" gap={0.5}>
                                    <Box size={16} color={theme.palette.text.secondary} />
                                    <Typography variant="body2">{routeDetail.articleCount} artículos</Typography>
                                  </Stack>
                                  <Stack direction="row" alignItems="center" gap={0.5}>
                                    <Route size={16} color={theme.palette.text.secondary} />
                                    <Typography variant="body2">{routeDetail.pointCount} puntos</Typography>
                                  </Stack>
                                </Stack>

                                <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                                  <Stack direction="row" alignItems="center" gap={0.5}>
                                    <User size={16} color={theme.palette.text.secondary} />
                                    <Typography variant="body2">{routeDetail.driverName}</Typography>
                                  </Stack>
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    gap={0.5}
                                    flexWrap="wrap"
                                  >
                                    <Truck size={16} color={theme.palette.text.secondary} />
                                  </Stack>
                                </Stack>
                              </Stack>

                              {
                                routeDetail.miniMapUrl &&
                                <DetailMiniMap
                                  src={routeDetail.miniMapUrl}
                                  alt=""
                                  loading="lazy"
                                  decoding="async"
                                />
                              }
                            </Stack>
                          </DetailHeader>

                          <Stack
                            spacing={2}
                            direction={{ xs: "column", md: "row" }}
                            justifyContent="space-between"
                            alignItems="center">

                            <TabFilters
                              tabs={TABS}
                              activeTab={activeTab}
                              onTabChange={setActiveTab}
                            />

                            {
                              canUpdateRouteArticles &&
                              <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<PlusCircle size={16} />}
                                onClick={() => setAddOrdersModalOpen(true)}>
                                Agregar
                              </Button>
                            }
                            {
                              renderTabActionButton()
                            }
                          </Stack>

                          {
                            activeTab === TAB_ARTICLES && <ArticlesTab orders={routeDetail.orders} />
                          }

                          {
                            activeTab === TAB_ROUTE && <RouteTab map={routeDetail.map ?? null} />
                          }

                          {
                            activeTab === TAB_CARTA_PORTE && (
                              <RouteCartaUploadSection
                                key={`${resolvedRouteId}-${cartaPanelKey}`}
                                serverFiles={routeDetail.cartaPorteRemoteFiles}
                                onPendingLocalFile={setPendingCartaLocalFile}
                                onRemoveServerDocument={handleRemoveCartaServerDocument}
                              />
                            )
                          }

                          {
                            activeTab === TAB_DRIVER &&
                            <DriverTab
                              routeDetail={routeDetail}
                              canManage={canManageRoute}
                              loadingDriver={
                                assignDriverMutation.isPending ||
                                removeDriverMutation.isPending
                              }
                              loadingAssistant={
                                addAssistantMutation.isPending ||
                                removeAssistantMutation.isPending
                              }
                              onAddDriver={() => setAddDriverModalOpen(true)}
                              onAddAssistant={() => setAddAssistantModalOpen(true)}
                              onRemoveDriver={() =>
                                setPendingRemoval({
                                  kind: "driver",
                                  name: routeDetail.driver?.name ?? "",
                                })
                              }
                              onRemoveAssistant={handleRequestRemoveAssistant}
                            />
                          }

                          {
                            resolvedRouteId &&
                            <AddOrdersToRouteModal
                              open={addOrdersModalOpen}
                              onClose={() => setAddOrdersModalOpen(false)}
                              routeId={resolvedRouteId}
                              fetchAvailableOrders={fetchOrdersForModal}
                              onConfirm={handleConfirmAddOrders}
                            />
                          }

                          {
                            resolvedRouteId &&
                            <AddDriverToRouteModal
                              open={addDriverModalOpen}
                              onClose={() => setAddDriverModalOpen(false)}
                              routeId={resolvedRouteId}
                              fetchAvailableDrivers={fetchDriversForModal}
                              onConfirm={handleConfirmAssignDriver}
                            />
                          }

                          {
                            resolvedRouteId &&
                            <AddAssistantToRouteModal
                              open={addAssistantModalOpen}
                              onClose={() => setAddAssistantModalOpen(false)}
                              routeId={resolvedRouteId}
                              fetchAvailableAssistants={fetchAssistantsForModal}
                              onConfirm={handleConfirmAddAssistant}
                            />
                          }

                          <ConfirmModal
                            open={pendingRemoval != null}
                            onClose={() => setPendingRemoval(null)}
                            onConfirm={() => void handleConfirmRemove()}
                            title={
                              pendingRemoval?.kind === "driver"
                                ? "Quitar chofer"
                                : "Quitar ayudante"
                            }
                            itemName={pendingRemoval?.name}
                            confirmLabel="Quitar"
                            loading={
                              removeAssistantMutation.isPending ||
                              removeDriverMutation.isPending
                            }
                          />
                        </Stack>
                        :
                        <Typography variant="body2" color="text.secondary">No se encontró la ruta</Typography>
          }
        </Stack>
      </Stack>
    </MainLayout>
  );
}
