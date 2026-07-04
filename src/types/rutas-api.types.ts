/** Raw list row from GET /routes */
export interface RouteListRowApi {
  id: number;
  code: string;
  status: string;
  location: string;
  article_count: number;
  point_count: number;
  driver_name: string;
  mini_map_url: string | null;
}

/** Map payload from GET /routes/:id */
export interface RouteMapPayloadApi {
  center: { lat: number; lng: number };
  zoom: number;
  path: { lat: number; lng: number }[];
  stops: { sequence: number; lat: number; lng: number }[];
}

export interface RouteOrderItemApi {
  id: string;
  article_name: string;
  status: string;
}

export interface RouteOrderApi {
  id: string;
  order_id: number;
  order_number: string;
  sequence: number;
  address: string;
  zone: string;
  stop_type: string;
  items: RouteOrderItemApi[];
}

export interface SuggestedItemToAddApi {
  id: string;
  source_type: "sale" | "order";
  origin_id: number;
  item_id: number;
  sku: string;
  order_number: string;
  article_name: string;
  zone: string;
  scheduled_date: string;
}

export interface OrderToAddApi {
  id: string;
  source_type: "sale" | "order";
  origin_id: number;
  order_number: string;
  address: string;
  zone: string;
  article_count: number;
  item_ids: number[];
}

export interface AvailableOrdersApi {
  suggested: SuggestedItemToAddApi[];
  orders: OrderToAddApi[];
  suggested_count: number;
  orders_count: number;
  recoveries_count: number;
}

export interface RoutePersonApi {
  id: string;
  name: string;
  role: string;
}

export interface CartaPorteFileApi {
  id: string;
  name: string;
  url: string;
  uploaded_at: string;
}

/** Raw detail from GET /routes/:id */
export interface RouteDetailApi {
  id: number;
  code: string;
  route_type?: "deliveries" | "scheduled";
  city_id?: number | null;
  destination_zone_id?: number | null;
  status: string;
  location: string;
  article_count: number;
  point_count: number;
  driver_name: string;
  vehicle_info: string;
  orders: RouteOrderApi[];
  driver: RoutePersonApi | null;
  assistants: RoutePersonApi[];
  mini_map_url: string | null;
  map: RouteMapPayloadApi;
  carta_porte_files: CartaPorteFileApi[];
}

export interface PaginatedRowsApi<T> {
  rows: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Candidate driver available to be assigned to a route (GET /routes/:id/available-drivers) */
export interface RouteDriverCandidateApi {
  id: number;
  first_name: string;
  last_name: string;
  license_number: string | null;
  phone: string | null;
  status: string | null;
}

/** Candidate assistant available to be added to a route (GET /routes/:id/available-assistants) */
export interface RouteAssistantCandidateApi {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  cellphone: string;
}
