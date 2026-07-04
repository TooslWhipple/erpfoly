export type RouteStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
export type RouteType = "deliveries" | "scheduled";

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

export type RouteOrderItemStatus = "pending" | "delivered" | "not_delivered";
export type RouteStopType = "delivery" | "recovery";

export interface RouteOrderItem {
  id: string;
  articleName: string;
  status: RouteOrderItemStatus;
}

export interface RouteOrder {
  id: string;
  orderId: number;
  orderNumber: string;
  sequence: number;
  address: string;
  zone: string;
  stopType: RouteStopType;
  items: RouteOrderItem[];
}

export interface SuggestedItemToAdd {
  id: string;
  sourceType: "sale" | "order";
  originId: number;
  itemId: number;
  sku: string;
  orderNumber: string;
  articleName: string;
  zone: string;
  scheduledDate: string;
}

/** Order or sale eligible to be added to a route (general list) */
export interface OrderToAdd {
  id: string;
  sourceType: "sale" | "order";
  originId: number;
  orderNumber: string;
  address: string;
  zone: string;
  articleCount: number;
  itemIds: number[];
}

export interface AvailableOrdersResponse {
  suggested: SuggestedItemToAdd[];
  orders: OrderToAdd[];
  suggestedCount: number;
  ordersCount: number;
  recoveriesCount: number;
}

export interface AddRoutePointPayload {
  origin: "sale" | "order";
  origin_id: number;
  item_ids: number[];
}

export interface RoutePerson {
  id: string;
  name: string;
  role: "driver" | "assistant";
}

export interface RouteDetail extends RouteSummary {
  routeType?: RouteType;
  driverName: string;
  vehicleInfo: string;
  orders: RouteOrder[];
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
