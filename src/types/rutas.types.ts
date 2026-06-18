export type RouteStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface RouteSummary {
  id: number;
  name: string;
  status: RouteStatus;
  location: string;
  articleCount: number;
  pointCount: number;
  /** Static Google Maps preview URL when configured server-side */
  miniMapUrl?: string;
  driverName?: string;
}

export interface RouteArticle {
  id: string;
  invoiceNumber: string;
  status: "pending" | "delivered" | "cancelled";
  articleName: string;
  zone: string;
  address: string;
}

/** Article from catalog that can be added to a route (SKU, type, name, zone) */
export interface ArticleToAdd {
  id: string;
  sku: string;
  type: "Venta" | "Servicio";
  articleName: string;
  zone: string;
}

export interface RoutePerson {
  id: string;
  name: string;
  role: "driver" | "assistant";
}

export interface RouteDetail extends RouteSummary {
  driverName: string;
  vehicleInfo: string;
  articles: RouteArticle[];
  driver: RoutePerson | null;
  assistants: RoutePerson[];
}

export interface RouteDriverCandidate {
  id: number;
  firstName: string;
  lastName: string;
  licenseNumber: string | null;
  phone: string | null;
  status: string | null;
}

export interface RouteAssistantCandidate {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  cellphone: string;
}
