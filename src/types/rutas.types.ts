export type RouteStatus =
  | "scheduled"
  | "in_progress"
  | "paused"
  | "completed"
  | "incomplete"
  | "cancelled";
export type RouteType = "deliveries" | "scheduled";

export interface RouteOriginBranch {
  id: number;
  name: string;
  municipality?: string | null;
}

export interface RouteSummary {
  id: number;
  name: string;
  status: RouteStatus;
  routeType?: RouteType;
  location: string;
  originBranch: RouteOriginBranch | null;
  articleCount: number;
  pointCount: number;
  driverName?: string;
}

export type RouteOrderItemStatus = "pending" | "delivered" | "not_delivered";
export type RouteStopType = "delivery" | "recovery";

export interface RouteItemAddedBy {
  type: "system" | "user";
  name: string | null;
}

export interface RouteOrderItem {
  id: string;
  articleName: string;
  status: RouteOrderItemStatus;
  addedBy: RouteItemAddedBy;
}

export interface RouteOrder {
  id: string;
  orderId: number;
  orderNumber: string;
  sequence: number;
  address: string;
  zone: string;
  destinationBranch: string | null;
  destinationBranchId: number | null;
  stopType: RouteStopType;
  items: RouteOrderItem[];
}

export interface RouteScheduledStop {
  id: number;
  branchId: number;
  name: string;
  sequence: number;
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
  destinationBranch: string | null;
}

/** Item eligible to be added to a route (general list, per-item) */
export interface OrderToAdd {
  id: string;
  sourceType: "sale" | "order";
  originId: number;
  itemId: number;
  sku: string;
  orderNumber: string;
  articleName: string;
  zone: string;
  scheduledDate: string;
  destinationBranch: string | null;
}

export interface AvailableOrdersResponse {
  suggested: SuggestedItemToAdd[];
  orders: OrderToAdd[];
  recoveries: OrderToAdd[];
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
  scheduledDate: string | null;
  originBranch: RouteOriginBranch | null;
  scheduledStops: RouteScheduledStop[];
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
