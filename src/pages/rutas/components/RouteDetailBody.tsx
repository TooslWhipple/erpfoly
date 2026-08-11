import { Button, Stack } from "@mui/material";
import { PlusCircle, Save } from "lucide-react";

import { TabFilters } from "@/components";
import { ArticlesTab, DriverTab, RouteTab } from "@/components/RouteTabs";
import type { RouteDetailView } from "@/utils/rutas-api.mapper";
import {
  TAB_ARTICLES,
  TAB_CARTA_PORTE,
  TAB_DRIVER,
  TAB_ROUTE,
  TABS,
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
  onPendingLocalFile,
  onRemoveServerDocument,
  onRequestRemoveOrder,
  onRequestRemoveItem,
  onAddDriver,
  onAddAssistant,
  onRemoveDriver,
  onRemoveAssistant,
}: RouteDetailBodyProps) {
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
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
        {renderTabActionButton()}
      </Stack>

      {activeTab === TAB_ARTICLES && (
        <ArticlesTab
          orders={routeDetail.orders}
          canEdit={canEditArticles}
          onRequestRemoveOrder={onRequestRemoveOrder}
          onRequestRemoveItem={onRequestRemoveItem}
        />
      )}

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
