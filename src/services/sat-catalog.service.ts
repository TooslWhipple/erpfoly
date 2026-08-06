import { get, type ApiResult } from "@/lib/axios";

const BASE = "/sat-catalogs";

export const SAT_PRODUCT_SERVICE_KEY_SEARCH_DEFAULT_LIMIT = 50;
export const SAT_UNIT_OF_MEASURE_SEARCH_DEFAULT_LIMIT = 50;

export interface SatProductServiceKeyItem {
    key: string;
    description: string;
}

export interface SatUnitOfMeasureItem {
    key: string;
    name: string;
    description: string | null;
    symbol: string | null;
}

export interface SearchSatProductServiceKeysParams {
    q: string;
    limit?: number;
}

export interface SearchSatUnitsOfMeasureParams {
    q: string;
    limit?: number;
}

function normalizeSatSearchResponse<T>(data: unknown): T[] {
    if (Array.isArray(data)) {
        return data as T[];
    }
    if (data != null && typeof data === "object" && "rows" in data && Array.isArray((data as { rows: unknown }).rows)) {
        return (data as { rows: T[] }).rows;
    }
    return [];
}

export async function searchSatProductServiceKeys(
    params: SearchSatProductServiceKeysParams,
): Promise<ApiResult<SatProductServiceKeyItem[]>> {
    const limit = params.limit ?? SAT_PRODUCT_SERVICE_KEY_SEARCH_DEFAULT_LIMIT;
    const result = await get<unknown>(`${BASE}/product-service-keys/search`, {
        params: { q: params.q.trim(), limit },
    });

    if (result.error != null) {
        return { data: null, error: result.error };
    }

    return {
        data: normalizeSatSearchResponse<SatProductServiceKeyItem>(result.data),
        error: null,
    };
}

export async function searchSatUnitsOfMeasure(
    params: SearchSatUnitsOfMeasureParams,
): Promise<ApiResult<SatUnitOfMeasureItem[]>> {
    const limit = params.limit ?? SAT_UNIT_OF_MEASURE_SEARCH_DEFAULT_LIMIT;
    const result = await get<unknown>(`${BASE}/units-of-measure/search`, {
        params: { q: params.q.trim(), limit },
    });

    if (result.error != null) {
        return { data: null, error: result.error };
    }

    return {
        data: normalizeSatSearchResponse<SatUnitOfMeasureItem>(result.data),
        error: null,
    };
}
