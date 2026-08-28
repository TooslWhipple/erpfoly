import { Button, Stack } from "@mui/material";
import { PlusCircle, Save } from "lucide-react";

import { TabFilters } from "@/components";
import {
  ArticlesTab,
  DriverTab,
  IdaTab,
  RouteTab,
  VueltaTab,
} from "@/components/RouteTabs";
import type { RouteDetailView } from "@/utils/rutas-api.mapper";
import {
  TAB_ARTICLES,
  TAB_CARTA_PORTE,
  TAB_DRIVER,
  TAB_IDA,
  TAB_ROUTE,
  TAB_VUELTA,
  getTabsForRouteType,
} from "./constants";
import { RouteCartaUploadSection } from "./RouteCartaUploadSection";

interface RouteDetailBodyProps {
  routeDetail: RouteDetailView;
  resolvedRouteId: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
  canEditArticles: boolean;
  canUpdateRoute: boolean;
  cartaPanelKey: number;
  pendingCartaLocalFile: File | undefined;
  savingCarta: boolean;
  loadingDriver: boolean;
  loadingAssistant: boolean;
  onSaveCartaPorte: () => void;
  onAddOrders: () => void;
  onAddOrdersForBranch: (branchId: number) => void;
  onPendingLocalFile: (file: File | undefined) => void;
  onRemoveServerDocument: (documentId: number) => void;
  onRequestRemoveOrder: (
    pointId: number,
    orderNumber: string,
    itemCount: number,
  ) => void;
  onRequestRemoveItem: (
    pointId: number,
    itemId: number,
    orderNumber: string,
    articleName: string,
  ) => void;
  onAddDriver: () => void;
  onAddAssistant: () => void;
  onRemoveDriver: () => void;
  onRemoveAssistant: (assistantId: string) => void;
}

export function RouteDetailBody({
  routeDetail,
  resolvedRouteId,
  activeTab,
  onTabChange,
  canEditArticles,
  canUpdateRoute,
  cartaPanelKey,
  pendingCartaLocalFile,
  savingCarta,
  loadingDriver,
  loadingAssistant,
  onSaveCartaPorte,
  onAddOrders,
  onAddOrdersForBranch,
  onPendingLocalFile,
  onRemoveServerDocument,
  onRequestRemoveOrder,
  onRequestRemoveItem,
  onAddDriver,
  onAddAssistant,
  onRemoveDriver,
  onRemoveAssistant,
}: RouteDetailBodyProps) {
  const routeType = routeDetail.routeType ?? "deliveries";
  const isScheduled = routeType === "scheduled";
  const tabs = getTabsForRouteType(routeType);

  const municipality =
    routeDetail.originBranch?.municipality?.trim() ||
    routeDetail.location ||
    routeDetail.originBranch?.name ||
    "esta ruta";

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
          onClick={onSaveCartaPorte}
          disabled={!pendingCartaLocalFile || savingCarta}
        >
          Guardar
        </Button>
      );
    }
    if (!isScheduled) {
      if (!canEditArticles) return null;
      return (
        <Button
          variant="option"
          color="primary"
          startIcon={<PlusCircle size={16} />}
          onClick={onAddOrders}
        >
          Agregar
        </Button>
      );
    }
    return null;
  };

  return (
    <>
      <Stack
        spacing={2}
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems="center"
      >
        <TabFilters
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
        {renderTabActionButton()}
      </Stack>

      {activeTab === TAB_ARTICLES && !isScheduled && (
        <ArticlesTab
          orders={routeDetail.orders}
          canEdit={canEditArticles}
          onRequestRemoveOrder={onRequestRemoveOrder}
          onRequestRemoveItem={onRequestRemoveItem}
        />
      )}

      {activeTab === TAB_IDA && isScheduled && (
        <IdaTab
          municipality={municipality}
          scheduledStops={routeDetail.scheduledStops}
          orders={routeDetail.orders}
          canEdit={canEditArticles}
          onAddOrdersForBranch={onAddOrdersForBranch}
          onRequestRemoveItem={onRequestRemoveItem}
        />
      )}

      {activeTab === TAB_VUELTA && isScheduled && <VueltaTab />}

      {activeTab === TAB_ROUTE && (
        <RouteTab map={routeDetail.map ?? null} />
      )}

      {activeTab === TAB_CARTA_PORTE && (
        <RouteCartaUploadSection
          key={`${resolvedRouteId}-${cartaPanelKey}`}
          serverFiles={routeDetail.cartaPorteRemoteFiles}
          onPendingLocalFile={onPendingLocalFile}
          onRemoveServerDocument={onRemoveServerDocument}
        />
      )}

      {activeTab === TAB_DRIVER && (
        <DriverTab
          routeDetail={routeDetail}
          canManage={canUpdateRoute}
          loadingDriver={loadingDriver}
          loadingAssistant={loadingAssistant}
          onAddDriver={onAddDriver}
          onAddAssistant={onAddAssistant}
          onRemoveDriver={onRemoveDriver}
          onRemoveAssistant={onRemoveAssistant}
        />
      )}
    </>
  );
}

const RouteDetailBodyPage = () => null;

export default RouteDetailBodyPage;
