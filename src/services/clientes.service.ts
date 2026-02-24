import { get, type ApiResult } from "@/lib/axios";
import type { GetClientesResponse } from "@/types/clientes.types";

const BASE = "/clientes";

export async function getClientes(): Promise<ApiResult<GetClientesResponse>> {
  return get<GetClientesResponse>(BASE);
}
