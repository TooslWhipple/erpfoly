export type ZoneStatus = "ACTIVE" | "INACTIVE";

export interface ZoneListItem {
  id: number;
  name: string;
  status: ZoneStatus;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface ZoneCatalogItem {
  id: number;
  name: string;
}

export interface GetZonesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ZoneStatus;
}

export interface CreateZonePayload {
  name: string;
}

export interface UpdateZonePayload {
  name?: string;
  status?: ZoneStatus;
}
