import {
  AddAssistantToRouteModal,
  AddDriverToRouteModal,
  AddOrdersToRouteModal,
  ConfirmModal,
  NewRouteModal,
} from "@/components";
import type { NewRouteFormValues } from "@/components";
import { getBranchesCatalog } from "@/services/branches.service";
import type {
  RouteAssistantCandidateApi,
  RouteDriverCandidateApi,
} from "@/types/rutas-api.types";
import type {
  AddRoutePointPayload,
  AvailableOrdersResponse,
  RouteType,
} from "@/types/rutas.types";
import type { PendingRemoval } from "./constants";

interface RoutePageModalsProps {
  resolvedRouteId: number | null;
  routeType: RouteType | undefined;
  newRouteModalOpen: boolean;
  onCloseNewRoute: () => void;
  onConfirmNewRoute: (values: NewRouteFormValues) => Promise<void>;
  creatingRoute: boolean;
  addOrdersModalOpen: boolean;
  onCloseAddOrders: () => void;
  onConfirmAddOrders: (payload: {
    points: AddRoutePointPayload[];
  }) => Promise<void>;
  addOrdersBranchId?: number | null;
  fetchAvailableOrders: (
    routeId: number,
    search?: string,
    branchId?: number,
  ) => Promise<AvailableOrdersResponse>;
  addDriverModalOpen: boolean;
  onCloseAddDriver: () => void;
  onConfirmAssignDriver: (userId: number) => Promise<void>;
  fetchAvailableDrivers: (
    routeId: number,
  ) => Promise<RouteDriverCandidateApi[]>;
  addAssistantModalOpen: boolean;
  onCloseAddAssistant: () => void;
  onConfirmAddAssistant: (userId: number) => Promise<void>;
  fetchAvailableAssistants: (
    routeId: number,
  ) => Promise<RouteAssistantCandidateApi[]>;
  pendingRemoval: PendingRemoval;
  onCloseRemoval: () => void;
  onConfirmRemoval: () => void;
  removalLoading: boolean;
}

export function RoutePageModals({
  resolvedRouteId,
  routeType,
  newRouteModalOpen,
  onCloseNewRoute,
  onConfirmNewRoute,
  creatingRoute,
  addOrdersModalOpen,
  onCloseAddOrders,
  onConfirmAddOrders,
  addOrdersBranchId = null,
  fetchAvailableOrders,
  addDriverModalOpen,
  onCloseAddDriver,
  onConfirmAssignDriver,
  fetchAvailableDrivers,
  addAssistantModalOpen,
  onCloseAddAssistant,
  onConfirmAddAssistant,
  fetchAvailableAssistants,
  pendingRemoval,
  onCloseRemoval,
  onConfirmRemoval,
  removalLoading,
}: RoutePageModalsProps) {
  return (
    <>
      <NewRouteModal
        open={newRouteModalOpen}
        onClose={onCloseNewRoute}
        onConfirm={onConfirmNewRoute}
        loading={creatingRoute}
        fetchBranches={getBranchesCatalog}
      />

      {resolvedRouteId != null && (
        <>
          <AddOrdersToRouteModal
            open={addOrdersModalOpen}
            onClose={onCloseAddOrders}
            routeId={resolvedRouteId}
            routeType={routeType ?? "deliveries"}
            branchId={addOrdersBranchId}
            fetchAvailableOrders={fetchAvailableOrders}
            onConfirm={onConfirmAddOrders}
          />

          <AddDriverToRouteModal
            open={addDriverModalOpen}
            onClose={onCloseAddDriver}
            routeId={resolvedRouteId}
            fetchAvailableDrivers={fetchAvailableDrivers}
            onConfirm={onConfirmAssignDriver}
          />

          <AddAssistantToRouteModal
            open={addAssistantModalOpen}
            onClose={onCloseAddAssistant}
            routeId={resolvedRouteId}
            fetchAvailableAssistants={fetchAvailableAssistants}
            onConfirm={onConfirmAddAssistant}
          />
        </>
      )}

      <ConfirmModal
        open={pendingRemoval != null}
        onClose={onCloseRemoval}
        onConfirm={onConfirmRemoval}
        title={
          pendingRemoval?.kind === "routeOrder"
            ? "Remover pedido"
            : pendingRemoval?.kind === "routeItem"
              ? "Remover artículo"
              : pendingRemoval?.kind === "driver"
                ? "Quitar chofer"
                : "Quitar ayudante"
        }
        description={
          pendingRemoval?.kind === "routeOrder" ? (
            <>
              Se removerán los {pendingRemoval.itemCount}{" "}
              {pendingRemoval.itemCount === 1 ? "artículo" : "artículos"} del
              pedido <strong>{pendingRemoval.orderNumber}</strong> de esta
              ruta. Esta acción no se puede deshacer.
            </>
          ) : pendingRemoval?.kind === "routeItem" ? (
            <>
              Se removerá el artículo{" "}
              <strong>{pendingRemoval.articleName}</strong> del pedido{" "}
              <strong>{pendingRemoval.orderNumber}</strong> de esta ruta. Esta
              acción no se puede deshacer.
            </>
          ) : undefined
        }
        itemName={
          pendingRemoval?.kind === "driver" ||
          pendingRemoval?.kind === "assistant"
            ? pendingRemoval.name
            : undefined
        }
        confirmLabel={
          pendingRemoval?.kind === "routeOrder" ||
          pendingRemoval?.kind === "routeItem"
            ? "Remover"
            : "Quitar"
        }
        loading={removalLoading}
      />
    </>
  );
}

const RoutePageModalsPage = () => null;

export default RoutePageModalsPage;
