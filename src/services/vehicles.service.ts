import { del, get, patch, post } from "@/lib/axios";
import type { ApiResult, PaginatedRowsResponse } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";

export const VEHICLE_TYPES = ["VAN", "TRUCK", "PICKUP", "MOTORCYCLE", "OTHER"] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const VEHICLE_STATUSES = ["ACTIVE", "INACTIVE", "MAINTENANCE"] as const;
export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
    VAN: "Van",
    TRUCK: "Camión",
    PICKUP: "Pickup",
    MOTORCYCLE: "Motocicleta",
    OTHER: "Otro",
};

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
    ACTIVE: "Activo",
    INACTIVE: "Inactivo",
    MAINTENANCE: "Mantenimiento",
};

export interface Vehicle {
    id: number;
    plate: string;
    brand: string;
    model: string;
    year: number;
    type: VehicleType;
    color: string | null;
    vin: string | null;
    status: VehicleStatus;
    vehicleConfigKey: string | null;
    vehicleConfigDescription: string | null;
    grossVehicleWeight: number | null;
    sctPermitTypeKey: string | null;
    sctPermitTypeDescription: string | null;
    sctPermitNumber: string | null;
    civilLiabilityInsurer: string | null;
    civilLiabilityPolicy: string | null;
}

export interface GetVehiclesParams {
    page: number;
    limit: number;
    search?: string;
    status?: VehicleStatus;
    type?: VehicleType;
}

export type GetVehiclesResponse = PaginatedRowsResponse<Vehicle>;

export interface CreateVehiclePayload {
    plate: string;
    brand: string;
    model: string;
    year: number;
    type?: VehicleType;
    color?: string;
    vin?: string;
    status?: VehicleStatus;
    vehicleConfigKey: string;
    grossVehicleWeight: number;
    sctPermitTypeKey: string;
    sctPermitNumber: string;
    civilLiabilityInsurer: string;
    civilLiabilityPolicy: string;
}

export type UpdateVehiclePayload = Partial<CreateVehiclePayload>;

const BASE = "/vehicles";

export async function getVehicles(
    params: GetVehiclesParams,
): Promise<ApiResult<GetVehiclesResponse>> {
    return get<GetVehiclesResponse>(buildListUrl(BASE, params));
}

export async function getVehicleById(id: number): Promise<ApiResult<Vehicle>> {
    return get<Vehicle>(`${BASE}/${id}`);
}

export async function createVehicle(
    payload: CreateVehiclePayload,
): Promise<ApiResult<Vehicle>> {
    return post<Vehicle>(BASE, payload);
}

export async function updateVehicle(
    id: number,
    payload: UpdateVehiclePayload,
): Promise<ApiResult<Vehicle>> {
    return patch<Vehicle>(`${BASE}/${id}`, payload);
}

export async function deleteVehicle(id: number): Promise<ApiResult<unknown>> {
    return del(`${BASE}/${id}`);
}
