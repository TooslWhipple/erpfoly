import type { TabItem } from "@/components/Tabs";

export const TAB_ARTICLES = "articles";
export const TAB_ROUTE = "route";
export const TAB_CARTA_PORTE = "carta_porte";
export const TAB_DRIVER = "driver";

export const TABS: TabItem[] = [
  { value: TAB_ARTICLES, label: "Artículos" },
  { value: TAB_ROUTE, label: "Ruta" },
  { value: TAB_CARTA_PORTE, label: "Carta porte" },
  { value: TAB_DRIVER, label: "Chofer y ayudantes" },
];

export const STATUS_LABEL: Record<string, string> = {
  scheduled: "Agendada",
  in_progress: "En curso",
  completed: "Completada",
  cancelled: "Cancelada",
};

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
