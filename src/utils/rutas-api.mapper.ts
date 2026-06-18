import type { UploadedFileItem } from "@/components/FileUpload";
import type {
  RouteAssistantCandidateApi,
  RouteDetailApi,
  RouteDriverCandidateApi,
  RouteListRowApi,
} from "@/types/rutas-api.types";
import type {
  RouteArticle,
  RouteAssistantCandidate,
  RouteDetail,
  RouteDriverCandidate,
  RoutePerson,
  RouteStatus,
  RouteSummary,
} from "@/types/rutas.types";

function mapArticleStatus(
  s: string,
): RouteArticle["status"] {
  if (s === "delivered") return "delivered";
  if (s === "cancelled") return "cancelled";
  return "pending";
}

export function mapRouteListRowToSummary(row: RouteListRowApi): RouteSummary {
  return {
    id: row.id,
    name: row.code,
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
  const articles: RouteArticle[] = data.articles.map((a) => ({
    id: a.id,
    invoiceNumber: a.invoice_number,
    status: mapArticleStatus(a.status),
    articleName: a.article_name,
    zone: a.zone,
    address: a.address,
  }));

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
    name: data.code,
    status: data.status as RouteStatus,
    location: data.location,
    articleCount: data.article_count,
    pointCount: data.point_count,
    driverName: data.driver_name,
    vehicleInfo: data.vehicle_info?.trim()
      ? data.vehicle_info
      : "—",
    articles,
    driver,
    assistants,
    miniMapUrl: data.mini_map_url ?? undefined,
    map: data.map,
    cartaPorteRemoteFiles,
  };
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
