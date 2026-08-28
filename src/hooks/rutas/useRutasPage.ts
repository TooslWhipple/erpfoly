import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import dayjs from "@/lib/dayjs";
import { unwrapOrThrow } from "@/lib/axios";
import { usePermissions } from "@/hooks/usePermissions";
import { useRouteMutations } from "@/hooks/rutas/useRouteMutations";
import { ROUTES_UPDATE } from "@/lib/permissions";
import {
  fetchAvailableAssistants,
  fetchAvailableDrivers,
  fetchAvailableOrders,
  fetchRouteDetail,
  fetchRoutesForDate,
} from "@/services/rutas.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import type { AvailableOrdersApi } from "@/types/rutas-api.types";
import type {
  AddRoutePointPayload,
  AvailableOrdersResponse,
  RouteSummary,
} from "@/types/rutas.types";
import { parseDateParam } from "@/utils/query";
import {
  mapRouteDetailApiToView,
  mapRouteListRowToSummary,
  type RouteDetailView,
} from "@/utils/rutas-api.mapper";
import {
  TAB_ARTICLES,
  TAB_ROUTE,
  getDefaultTabForRouteType,
  type PendingRemoval,
} from "@/pages/rutas/components/constants";
import type { RouteType } from "@/types/rutas.types";

const ROUTES_POLL_INTERVAL_MS = 20_000;

export function useRutasPage() {
  const { hasPermission } = usePermissions();
  const canUpdateRoute = hasPermission(ROUTES_UPDATE);

  const router = useRouter();
  const queryClient = useQueryClient();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const setRouteDate = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      const dateStr = dayjs(date).format("YYYY-MM-DD");
      router.replace(
        {
          pathname: "/rutas",
          query: { ...router.query, fecha: dateStr },
        },
        undefined,
        { shallow: true },
      );
    },
    [router],
  );

  useEffect(() => {
    if (!router.isReady) return;

    const fromUrl = parseDateParam(router.query.fecha);

    if (fromUrl) {
      if (!dayjs(fromUrl).isSame(selectedDate, "day")) {
        setSelectedDate(fromUrl);
      }
    } else {
      const todayStr = dayjs().format("YYYY-MM-DD");
      router.replace(
        {
          pathname: "/rutas",
          query: { ...router.query, fecha: todayStr },
        },
        undefined,
        { shallow: true },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.fecha]);

  const routeDateStr = useMemo(
    () => dayjs(selectedDate).format("YYYY-MM-DD"),
    [selectedDate],
  );

  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(TAB_ARTICLES);
  const [addOrdersModalOpen, setAddOrdersModalOpen] = useState(false);
  const [addOrdersBranchId, setAddOrdersBranchId] = useState<number | null>(
    null,
  );
  const [addDriverModalOpen, setAddDriverModalOpen] = useState(false);
  const [addAssistantModalOpen, setAddAssistantModalOpen] = useState(false);
  const [newRouteModalOpen, setNewRouteModalOpen] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval>(null);
  const [pendingCartaLocalFile, setPendingCartaLocalFile] = useState<
    File | undefined
  >(undefined);
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
    refetchInterval: ROUTES_POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
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
    refetchInterval: ROUTES_POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });

  const routeDetail: RouteDetailView | null = useMemo(() => {
    const raw = detailQuery.data;
    if (!raw) return null;
    return mapRouteDetailApiToView(raw);
  }, [detailQuery.data]);

  const mutations = useRouteMutations({
    queryClient,
    routeDateStr,
    showSuccess,
    showError,
    setSelectedRouteId,
    setActiveTab,
    setNewRouteModalOpen,
    setPendingCartaLocalFile,
    setCartaPanelKey,
  });

  const {
    createRouteMutation,
    addOrdersMutation,
    uploadCartaMutation,
    deleteCartaMutation,
    assignDriverMutation,
    removeDriverMutation,
    addAssistantMutation,
    removeAssistantMutation,
    removeRoutePointMutation,
    removeRoutePointItemMutation,
  } = mutations;

  const fetchOrdersForModal = useCallback(
    async (
      routeId: number,
      search?: string,
      branchId?: number,
    ): Promise<AvailableOrdersResponse> => {
      const res = await fetchAvailableOrders(routeId, search, branchId);
      const data = unwrapOrThrow(res) as AvailableOrdersApi;
      const mapRow = (row: AvailableOrdersApi["suggested"][number]) => ({
        id: row.id,
        sourceType: row.source_type,
        originId: row.origin_id,
        itemId: row.item_id,
        sku: row.sku,
        orderNumber: row.order_number,
        articleName: row.article_name,
        zone: row.zone,
        scheduledDate: row.scheduled_date,
        destinationBranch: row.destination_branch,
      });
      return {
        suggested: data.suggested.map(mapRow),
        orders: data.orders.map(mapRow),
        recoveries: (data.recoveries ?? []).map(mapRow),
        suggestedCount: data.suggested_count,
        ordersCount: data.orders_count,
        recoveriesCount: data.recoveries_count,
      };
    },
    [],
  );

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

  const resetRouteTabIfNeeded = useCallback(() => {
    if (activeTab === TAB_ROUTE) {
      setActiveTab(
        getDefaultTabForRouteType(routeDetail?.routeType as RouteType | undefined),
      );
    }
  }, [activeTab, routeDetail?.routeType]);

  useEffect(() => {
    if (!routeDetail?.routeType) return;
    const allowed = new Set(
      routeDetail.routeType === "scheduled"
        ? ["ida", "vuelta", "route", "carta_porte", "driver"]
        : ["articles", "route", "carta_porte", "driver"],
    );
    if (!allowed.has(activeTab)) {
      setActiveTab(getDefaultTabForRouteType(routeDetail.routeType));
    }
  }, [routeDetail?.routeType, activeTab]);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setRouteDate(d);
    resetRouteTabIfNeeded();
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setRouteDate(d);
    resetRouteTabIfNeeded();
  };

  const handleToday = () => {
    setRouteDate(new Date());
    resetRouteTabIfNeeded();
  };

  const handleSelectRoute = (routeId: number) => {
    setSelectedRouteId(routeId);
    const summary = routes.find((r) => r.id === routeId);
    setActiveTab(getDefaultTabForRouteType(summary?.routeType));
  };

  const handleOpenAddOrders = () => {
    setAddOrdersBranchId(null);
    setAddOrdersModalOpen(true);
  };

  const handleOpenAddOrdersForBranch = (branchId: number) => {
    setAddOrdersBranchId(branchId);
    setAddOrdersModalOpen(true);
  };

  const handleCloseAddOrders = () => {
    setAddOrdersModalOpen(false);
    setAddOrdersBranchId(null);
  };

  const handleConfirmAddOrders = async (payload: {
    points: AddRoutePointPayload[];
  }) => {
    if (!resolvedRouteId || payload.points.length === 0) return;
    await addOrdersMutation.mutateAsync({
      routeId: resolvedRouteId,
      points: payload.points,
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
    const assistant = routeDetail?.assistants.find((a) => a.id === assistantId);
    setPendingRemoval({
      kind: "assistant",
      id: Number(assistantId),
      name: assistant?.name ?? "",
    });
  };

  const handleRequestRemoveDriver = () => {
    setPendingRemoval({
      kind: "driver",
      name: routeDetail?.driver?.name ?? "",
    });
  };

  const handleConfirmRemove = async () => {
    if (!pendingRemoval || !resolvedRouteId) return;
    try {
      if (pendingRemoval.kind === "assistant") {
        await removeAssistantMutation.mutateAsync({
          routeId: resolvedRouteId,
          userId: pendingRemoval.id,
        });
      } else if (pendingRemoval.kind === "driver") {
        await removeDriverMutation.mutateAsync({ routeId: resolvedRouteId });
      } else if (pendingRemoval.kind === "routeOrder") {
        await removeRoutePointMutation.mutateAsync({
          routeId: resolvedRouteId,
          pointId: pendingRemoval.pointId,
        });
      } else if (pendingRemoval.kind === "routeItem") {
        await removeRoutePointItemMutation.mutateAsync({
          routeId: resolvedRouteId,
          pointId: pendingRemoval.pointId,
          itemId: pendingRemoval.itemId,
        });
      }
      setPendingRemoval(null);
    } catch {
      // Error already shown by the mutation snackbar
    }
  };

  const handleRequestRemoveRouteOrder = (
    pointId: number,
    orderNumber: string,
    itemCount: number,
  ) => {
    setPendingRemoval({
      kind: "routeOrder",
      pointId,
      orderNumber,
      itemCount,
    });
  };

  const handleRequestRemoveRouteItem = (
    pointId: number,
    itemId: number,
    orderNumber: string,
    articleName: string,
  ) => {
    setPendingRemoval({
      kind: "routeItem",
      pointId,
      itemId,
      orderNumber,
      articleName,
    });
  };

  const canEditArticles =
    canUpdateRoute && routeDetail?.status === "scheduled";

  return {
    selectedDate,
    routes,
    routesLoading: routesQuery.isLoading,
    resolvedRouteId,
    routeDetail,
    detailLoading: detailQuery.isFetching,
    detailError: detailQuery.isError,
    activeTab,
    setActiveTab,
    canUpdateRoute,
    canEditArticles,
    cartaPanelKey,
    pendingCartaLocalFile,
    setPendingCartaLocalFile,
    pendingRemoval,
    setPendingRemoval,
    addOrdersModalOpen,
    setAddOrdersModalOpen,
    addOrdersBranchId,
    handleOpenAddOrders,
    handleOpenAddOrdersForBranch,
    handleCloseAddOrders,
    addDriverModalOpen,
    setAddDriverModalOpen,
    addAssistantModalOpen,
    setAddAssistantModalOpen,
    newRouteModalOpen,
    setNewRouteModalOpen,
    handlePrevDay,
    handleNextDay,
    handleToday,
    handleSelectRoute,
    handleConfirmAddOrders,
    handleConfirmAssignDriver,
    handleConfirmAddAssistant,
    handleSaveCartaPorte,
    handleRemoveCartaServerDocument,
    handleRequestRemoveAssistant,
    handleRequestRemoveDriver,
    handleConfirmRemove,
    handleRequestRemoveRouteOrder,
    handleRequestRemoveRouteItem,
    fetchOrdersForModal,
    fetchDriversForModal,
    fetchAssistantsForModal,
    createRouteMutation,
    uploadCartaMutation,
    assignDriverMutation,
    removeDriverMutation,
    addAssistantMutation,
    removeAssistantMutation,
    removeRoutePointMutation,
    removeRoutePointItemMutation,
  };
}
