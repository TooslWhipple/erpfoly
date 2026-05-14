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

export interface RouteArticleApi {
  id: string;
  invoice_number: string;
  status: string;
  article_name: string;
  zone: string;
  address: string;
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
  status: string;
  location: string;
  article_count: number;
  point_count: number;
  driver_name: string;
  vehicle_info: string;
  articles: RouteArticleApi[];
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
