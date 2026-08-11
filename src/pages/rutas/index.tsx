import { Divider, Skeleton, Stack, Typography } from "@mui/material";

import { useRutasPage } from "@/hooks/rutas/useRutasPage";
import {
  RutasPageLayout,
  RouteDetailPanel,
  RoundedSkeleton,
} from "@/styles/rutas.styles";
import {
  RoutesSidebar,
  RouteDetailHeader,
  RouteDetailBody,
  RoutePageModals,
} from "./components";

export default function RutaPage() {
  const r = useRutasPage();

  return (
    <>
      <RutasPageLayout
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        divider={<Divider orientation="vertical" flexItem />}
      >
        <RoutesSidebar
          selectedDate={r.selectedDate}
          routes={r.routes}
          routesLoading={r.routesLoading}
          resolvedRouteId={r.resolvedRouteId}
          onPrevDay={r.handlePrevDay}
          onNextDay={r.handleNextDay}
          onToday={r.handleToday}
          onNewRoute={() => r.setNewRouteModalOpen(true)}
          onSelectRoute={r.handleSelectRoute}
        />

        <RouteDetailPanel>
          {r.routesLoading ? (
            <Stack flex={1} p={3} spacing={2}>
              <Skeleton variant="text" width="60%" height={32} />
              <RoundedSkeleton variant="rectangular" height={280} />
            </Stack>
          ) : r.routes.length === 0 ? (
            <Stack
              flex={1}
              alignItems="center"
              justifyContent="center"
              p={4}
            >
              <Typography variant="body2" color="text.secondary">
                No hay rutas para esta fecha
              </Typography>
            </Stack>
          ) : r.resolvedRouteId == null ? (
            <Stack
              flex={1}
              alignItems="center"
              justifyContent="center"
              p={4}
            >
              <Typography variant="body2" color="text.secondary">
                Selecciona una ruta
              </Typography>
            </Stack>
          ) : r.detailLoading && !r.routeDetail ? (
            <Stack flex={1} p={3} spacing={2}>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="40%" />
              <RoundedSkeleton variant="rectangular" height={48} />
            </Stack>
          ) : r.detailError ? (
            <Typography variant="body2" color="error">
              No se pudo cargar el detalle de la ruta.
            </Typography>
          ) : r.routeDetail ? (
            <Stack spacing={2}>
              <RouteDetailHeader routeDetail={r.routeDetail} />
              <RouteDetailBody
                routeDetail={r.routeDetail}
                resolvedRouteId={r.resolvedRouteId}
                activeTab={r.activeTab}
                onTabChange={r.setActiveTab}
                canEditArticles={r.canEditArticles}
                canUpdateRoute={r.canUpdateRoute}
                cartaPanelKey={r.cartaPanelKey}
                pendingCartaLocalFile={r.pendingCartaLocalFile}
                savingCarta={r.uploadCartaMutation.isPending}
                loadingDriver={
                  r.assignDriverMutation.isPending ||
                  r.removeDriverMutation.isPending
                }
                loadingAssistant={
                  r.addAssistantMutation.isPending ||
                  r.removeAssistantMutation.isPending
                }
                onSaveCartaPorte={() => void r.handleSaveCartaPorte()}
                onAddOrders={() => r.setAddOrdersModalOpen(true)}
                onPendingLocalFile={r.setPendingCartaLocalFile}
                onRemoveServerDocument={r.handleRemoveCartaServerDocument}
                onRequestRemoveOrder={r.handleRequestRemoveRouteOrder}
                onRequestRemoveItem={r.handleRequestRemoveRouteItem}
                onAddDriver={() => r.setAddDriverModalOpen(true)}
                onAddAssistant={() => r.setAddAssistantModalOpen(true)}
                onRemoveDriver={r.handleRequestRemoveDriver}
                onRemoveAssistant={r.handleRequestRemoveAssistant}
              />
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No se encontró la ruta
            </Typography>
          )}
        </RouteDetailPanel>
      </RutasPageLayout>

      <RoutePageModals
        resolvedRouteId={r.resolvedRouteId}
        routeType={r.routeDetail?.routeType}
        newRouteModalOpen={r.newRouteModalOpen}
        onCloseNewRoute={() => r.setNewRouteModalOpen(false)}
        onConfirmNewRoute={async (values) => {
          await r.createRouteMutation.mutateAsync(values);
        }}
        creatingRoute={r.createRouteMutation.isPending}
        addOrdersModalOpen={r.addOrdersModalOpen}
        onCloseAddOrders={() => r.setAddOrdersModalOpen(false)}
        onConfirmAddOrders={r.handleConfirmAddOrders}
        fetchAvailableOrders={r.fetchOrdersForModal}
        addDriverModalOpen={r.addDriverModalOpen}
        onCloseAddDriver={() => r.setAddDriverModalOpen(false)}
        onConfirmAssignDriver={r.handleConfirmAssignDriver}
        fetchAvailableDrivers={r.fetchDriversForModal}
        addAssistantModalOpen={r.addAssistantModalOpen}
        onCloseAddAssistant={() => r.setAddAssistantModalOpen(false)}
        onConfirmAddAssistant={r.handleConfirmAddAssistant}
        fetchAvailableAssistants={r.fetchAssistantsForModal}
        pendingRemoval={r.pendingRemoval}
        onCloseRemoval={() => r.setPendingRemoval(null)}
        onConfirmRemoval={() => void r.handleConfirmRemove()}
        removalLoading={
          r.removeAssistantMutation.isPending ||
          r.removeDriverMutation.isPending ||
          r.removeRoutePointMutation.isPending ||
          r.removeRoutePointItemMutation.isPending
        }
      />
    </>
  );
}
