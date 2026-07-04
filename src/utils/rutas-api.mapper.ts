import type { UploadedFileItem } from "@/components/FileUpload";
import type {
  RouteAssistantCandidateApi,
  RouteDetailApi,
  RouteDriverCandidateApi,
  RouteListRowApi,
  RouteOrderApi,
  RouteOrderItemApi,
} from "@/types/rutas-api.types";
import type {
  RouteAssistantCandidate,
  RouteDetail,
  RouteDriverCandidate,
  RouteOrder,
  RouteOrderItem,
  RouteOrderItemStatus,
  RoutePerson,
  RouteStatus,
  RouteStopType,
  RouteSummary,
} from "@/types/rutas.types";

function mapOrderItemStatus(status: string): RouteOrderItemStatus {
  if (status === "delivered") return "delivered";
  if (status === "not_delivered") return "not_delivered";
  return "pending";
}

function mapStopType(stopType: string): RouteStopType {
  return stopType === "recovery" ? "recovery" : "delivery";
}

function mapOrderItem(item: RouteOrderItemApi): RouteOrderItem {
  return {
    id: item.id,
    articleName: item.article_name,
    status: mapOrderItemStatus(item.status),
  };
}

function mapOrder(order: RouteOrderApi): RouteOrder {
  return {
    id: order.id,
    orderId: order.order_id,
    orderNumber: order.order_number,
    sequence: order.sequence,
    address: order.address,
    zone: order.zone,
    stopType: mapStopType(order.stop_type),
    items: order.items.map(mapOrderItem),
  };
}

export function mapRouteListRowToSummary(row: RouteListRowApi): RouteSummary {
  return {
    id: row.id,
    name: formatRouteName(row.id, row.code),
    status: row.status as RouteStatus,
    location: row.location,
    articleCount: row.article_count,
    pointCount: row.point_count,
    miniMapUrl: row.mini_map_url ?? undefined,
    driverName: row.driver_name,
  };
}

export interface RouteDetailView extends RouteDetail {
  miniMapUrl?: string;
  map?: RouteDetailApi["map"];
  cartaPorteRemoteFiles: UploadedFileItem[];
}

export function mapRouteDetailApiToView(data: RouteDetailApi): RouteDetailView {
  const orders: RouteOrder[] = data.orders.map(mapOrder);

  const driver: RoutePerson | null = data.driver
    ? {
        id: data.driver.id,
        name: data.driver.name,
        role: "driver",
      }
    : null;

  const assistants: RoutePerson[] = data.assistants.map((a) => ({
    id: a.id,
    name: a.name,
    role: "assistant",
  }));

  const cartaPorteRemoteFiles: UploadedFileItem[] = data.carta_porte_files.map(
    (f) => ({
      id: f.id,
      name: f.name,
      url: f.url,
      uploadedAt: f.uploaded_at,
    }),
  );

  return {
    id: data.id,
    name: formatRouteName(data.id, data.code),
    routeType: data.route_type,
    status: data.status as RouteStatus,
    location: data.location,
    articleCount: data.article_count,
    pointCount: data.point_count,
    driverName: data.driver_name,
    vehicleInfo: data.vehicle_info?.trim()
      ? data.vehicle_info
      : "—",
    orders,
    driver,
    assistants,
    miniMapUrl: data.mini_map_url ?? undefined,
    map: data.map,
    cartaPorteRemoteFiles,
  };
}

function formatRouteName(id: number, code?: string | null): string {
  if (code && code.trim().length > 0) return code;
  return String(id);
}

export function mapDriverCandidateToView(
  row: RouteDriverCandidateApi,
): RouteDriverCandidate {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    licenseNumber: row.license_number,
    phone: row.phone,
    status: row.status,
  };
}

export function mapAssistantCandidateToView(
  row: RouteAssistantCandidateApi,
): RouteAssistantCandidate {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    username: row.username,
    cellphone: row.cellphone,
  };
}
