import { AlertCircle, Check, Pause, Truck, X, type LucideIcon } from "lucide-react";

import type { StatusChipVariant } from "@/components/StatusChip";
import type { TabItem } from "@/components/Tabs";
import type { RouteStatus, RouteType } from "@/types/rutas.types";

export const TAB_ARTICLES = "articles";
export const TAB_IDA = "ida";
export const TAB_VUELTA = "vuelta";
export const TAB_ROUTE = "route";
export const TAB_CARTA_PORTE = "carta_porte";
export const TAB_DRIVER = "driver";

const SHARED_TABS: TabItem[] = [
  { value: TAB_ROUTE, label: "Ruta" },
  { value: TAB_CARTA_PORTE, label: "Carta porte" },
  { value: TAB_DRIVER, label: "Unidad y Personal" },
];

export const TABS: TabItem[] = [
  { value: TAB_ARTICLES, label: "Artículos" },
  ...SHARED_TABS,
];

export function getTabsForRouteType(routeType?: RouteType): TabItem[] {
  if (routeType === "scheduled") {
    return [
      { value: TAB_IDA, label: "Ida" },
      { value: TAB_VUELTA, label: "Vuelta" },
      ...SHARED_TABS,
    ];
  }
  return TABS;
}

export function getDefaultTabForRouteType(routeType?: RouteType): string {
  return routeType === "scheduled" ? TAB_IDA : TAB_ARTICLES;
}

export const STATUS_LABEL: Record<RouteStatus, string> = {
  scheduled: "Agendada",
  in_progress: "En curso",
  paused: "Pausada",
  completed: "Completada",
  incomplete: "Incompleta",
  cancelled: "Cancelada",
};

export const STATUS_CHIP_CONFIG: Record<
  RouteStatus,
  { variant: StatusChipVariant; Icon: LucideIcon }
> = {
  scheduled: { variant: "pending", Icon: Truck },
  in_progress: { variant: "info", Icon: Truck },
  paused: { variant: "warning", Icon: Pause },
  completed: { variant: "success", Icon: Check },
  incomplete: { variant: "warning", Icon: AlertCircle },
  cancelled: { variant: "error", Icon: X },
};

export function getRouteStatusChipConfig(status?: string | null) {
  if (status && status in STATUS_CHIP_CONFIG) {
    return STATUS_CHIP_CONFIG[status as RouteStatus];
  }
  return STATUS_CHIP_CONFIG.scheduled;
}

export function getRouteStatusLabel(status?: string | null): string {
  if (status && status in STATUS_LABEL) {
    return STATUS_LABEL[status as RouteStatus];
  }
  return status ?? "";
}

export const ROUTE_TYPE_LABEL: Record<string, string> = {
  deliveries: "Entrega",
  scheduled: "Distribución programada",
};

export type PendingRemoval =
  | { kind: "driver"; name: string }
  | { kind: "assistant"; id: number; name: string }
  | {
      kind: "routeOrder";
      pointId: number;
      orderNumber: string;
      itemCount: number;
    }
  | {
      kind: "routeItem";
      pointId: number;
      itemId: number;
      orderNumber: string;
      articleName: string;
    }
  | null;

const RouteConstantsPage = () => null;

export default RouteConstantsPage;
