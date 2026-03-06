export type RouteStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface RouteSummary {
  id: number;
  name: string;
  status: RouteStatus;
  location: string;
  articleCount: number;
  pointCount: number;
}

export interface RouteArticle {
  id: string;
  invoiceNumber: string;
  status: "pending" | "delivered" | "cancelled";
  articleName: string;
  zone: string;
  address: string;
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
