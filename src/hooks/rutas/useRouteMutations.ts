import type { Dispatch, SetStateAction } from "react";
import { useMutation, type QueryClient } from "@tanstack/react-query";

import type { NewRouteFormValues } from "@/components";
import { getApiErrorMessage, unwrapOrThrow } from "@/lib/axios";
import {
  addAssistantToRoute,
  addOrdersToRoute,
  assignDriverToRoute,
  assignVehicleToRoute,
  createRoute,
  deleteCartaPorteDocument,
  removeAssistantFromRoute,
  removeDriverFromRoute,
  removeRoutePoint,
  removeRoutePointItem,
  uploadCartaPorte,
} from "@/services/rutas.service";
import type { RouteDetailApi } from "@/types/rutas-api.types";
import type { AddRoutePointPayload } from "@/types/rutas.types";
import { getDefaultTabForRouteType } from "@/pages/rutas/components/constants";

interface UseRouteMutationsParams {
  queryClient: QueryClient;
  routeDateStr: string;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  setSelectedRouteId: (id: number) => void;
  setActiveTab: (tab: string) => void;
  setNewRouteModalOpen: (open: boolean) => void;
  setPendingCartaLocalFile: (file: File | undefined) => void;
  setCartaPanelKey: Dispatch<SetStateAction<number>>;
}

export function useRouteMutations({
  queryClient,
  routeDateStr,
  showSuccess,
  showError,
  setSelectedRouteId,
  setActiveTab,
  setNewRouteModalOpen,
  setPendingCartaLocalFile,
  setCartaPanelKey,
}: UseRouteMutationsParams) {
  const createRouteMutation = useMutation({
    mutationFn: async (payload: NewRouteFormValues) => {
      const res = await createRoute(payload);
      return unwrapOrThrow(res);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["routes", routeDateStr] });
      queryClient.setQueryData<RouteDetailApi>(["route-detail", data.id], data);
      setSelectedRouteId(data.id);
      setActiveTab(getDefaultTabForRouteType(data.route_type));
      showSuccess("Ruta creada correctamente.");
      setNewRouteModalOpen(false);
    },
    onError: (err) => {
      const detail = getApiErrorMessage(err);
      showError(
        detail
          ? `No se pudo crear la ruta: ${detail}`
          : "No se pudo crear la ruta.",
      );
    },
  });

  const addOrdersMutation = useMutation({
    mutationFn: async ({
      routeId,
      points,
    }: {
      routeId: number;
      points: AddRoutePointPayload[];
    }) => {
      const res = await addOrdersToRoute(routeId, points);
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
      setPendingCartaLocalFile(undefined);
      setCartaPanelKey((k) => k + 1);
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
    onError: (err) => {
      const detail = getApiErrorMessage(err);
      showError(
        detail
          ? `No se pudo asignar el chofer: ${detail}`
          : "No se pudo asignar el chofer.",
      );
    },
  });

  const assignVehicleMutation = useMutation({
    mutationFn: async ({
      routeId,
      vehicleId,
    }: {
      routeId: number;
      vehicleId: number | null;
    }) => {
      const res = await assignVehicleToRoute(routeId, vehicleId);
      return unwrapOrThrow(res);
    },
    onSuccess: (data, vars) => {
      queryClient.setQueryData<RouteDetailApi>(
        ["route-detail", vars.routeId],
        data,
      );
      queryClient.invalidateQueries({ queryKey: ["routes", routeDateStr] });
      showSuccess(
        vars.vehicleId == null
          ? "Vehículo desasignado correctamente."
          : "Vehículo asignado correctamente.",
      );
    },
    onError: (err) => {
      const detail = getApiErrorMessage(err);
      showError(
        detail
          ? `No se pudo actualizar el vehículo: ${detail}`
          : "No se pudo actualizar el vehículo.",
      );
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
    onError: (err) => {
      const detail = getApiErrorMessage(err);
      showError(
        detail
          ? `No se pudo eliminar el chofer: ${detail}`
          : "No se pudo eliminar el chofer.",
      );
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
    onError: (err) => {
      const detail = getApiErrorMessage(err);
      showError(
        detail
          ? `No se pudo agregar el ayudante: ${detail}`
          : "No se pudo agregar el ayudante.",
      );
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
    onError: (err) => {
      const detail = getApiErrorMessage(err);
      showError(
        detail
          ? `No se pudo eliminar el ayudante: ${detail}`
          : "No se pudo eliminar el ayudante.",
      );
    },
  });

  const removeRoutePointMutation = useMutation({
    mutationFn: async ({
      routeId,
      pointId,
    }: {
      routeId: number;
      pointId: number;
    }) => {
      const res = await removeRoutePoint(routeId, pointId);
      return unwrapOrThrow(res);
    },
    onMutate: async ({ routeId, pointId }) => {
      await queryClient.cancelQueries({ queryKey: ["route-detail", routeId] });
      const previous = queryClient.getQueryData<RouteDetailApi>([
        "route-detail",
        routeId,
      ]);
      if (previous) {
        queryClient.setQueryData<RouteDetailApi>(["route-detail", routeId], {
          ...previous,
          orders: previous.orders.filter(
            (o) => String(o.id) !== String(pointId),
          ),
          article_count: previous.orders
            .filter((o) => String(o.id) !== String(pointId))
            .reduce((sum, o) => sum + o.items.length, 0),
          point_count: Math.max(0, previous.point_count - 1),
        });
      }
      return { previous };
    },
    onError: (err, vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["route-detail", vars.routeId], ctx.previous);
      }
      const detail = getApiErrorMessage(err);
      showError(
        detail
          ? `No se pudo remover el pedido: ${detail}`
          : "No se pudo remover el pedido.",
      );
    },
    onSuccess: (data, vars) => {
      queryClient.setQueryData<RouteDetailApi>(
        ["route-detail", vars.routeId],
        data,
      );
      queryClient.invalidateQueries({ queryKey: ["routes", routeDateStr] });
      showSuccess("Pedido removido de la ruta.");
    },
  });

  const removeRoutePointItemMutation = useMutation({
    mutationFn: async ({
      routeId,
      pointId,
      itemId,
    }: {
      routeId: number;
      pointId: number;
      itemId: number;
    }) => {
      const res = await removeRoutePointItem(routeId, pointId, itemId);
      return unwrapOrThrow(res);
    },
    onMutate: async ({ routeId, pointId, itemId }) => {
      await queryClient.cancelQueries({ queryKey: ["route-detail", routeId] });
      const previous = queryClient.getQueryData<RouteDetailApi>([
        "route-detail",
        routeId,
      ]);
      if (previous) {
        const nextOrders = previous.orders
          .map((o) =>
            String(o.id) === String(pointId)
              ? {
                  ...o,
                  items: o.items.filter(
                    (it) => String(it.id) !== String(itemId),
                  ),
                }
              : o,
          )
          .filter((o) => o.items.length > 0);
        const articleCount = nextOrders.reduce(
          (sum, o) => sum + o.items.length,
          0,
        );
        queryClient.setQueryData<RouteDetailApi>(["route-detail", routeId], {
          ...previous,
          orders: nextOrders,
          article_count: articleCount,
          point_count: nextOrders.length,
        });
      }
      return { previous };
    },
    onError: (err, vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["route-detail", vars.routeId], ctx.previous);
      }
      const detail = getApiErrorMessage(err);
      showError(
        detail
          ? `No se pudo remover el artículo: ${detail}`
          : "No se pudo remover el artículo.",
      );
    },
    onSuccess: (data, vars) => {
      queryClient.setQueryData<RouteDetailApi>(
        ["route-detail", vars.routeId],
        data,
      );
      queryClient.invalidateQueries({ queryKey: ["routes", routeDateStr] });
      showSuccess("Artículo removido de la ruta.");
    },
  });

  return {
    createRouteMutation,
    addOrdersMutation,
    uploadCartaMutation,
    deleteCartaMutation,
    assignDriverMutation,
    assignVehicleMutation,
    removeDriverMutation,
    addAssistantMutation,
    removeAssistantMutation,
    removeRoutePointMutation,
    removeRoutePointItemMutation,
  };
}
