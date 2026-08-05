import { get, post, del, unwrapOrThrow, type ApiResult } from "@/lib/axios";
import { buildListUrl } from "@/lib/apiHelpers";
import type { Poliza, FilterPolizasParams } from "@/types/polizas.types";

export async function getPolizas(params?: FilterPolizasParams): Promise<Poliza[]> {
  const url = buildListUrl("/polizas", params ?? {});
  const res: ApiResult<Poliza[]> = await get(url);
  return unwrapOrThrow(res);
}

export async function getPolizaById(id: number): Promise<Poliza> {
  const res: ApiResult<Poliza> = await get(`/polizas/${id}`);
  return unwrapOrThrow(res);
}

export async function enviarPoliza(id: number): Promise<{ estatus: string; error?: string }> {
  const res: ApiResult<{ estatus: string; error?: string }> = await post(`/polizas/${id}/enviar`, {});
  return unwrapOrThrow(res);
}

export async function enviarPolizasActivas(body?: {
  fechaInicio?: string;
  fechaFin?: string;
}): Promise<{ enviadas: number; errores: number }> {
  const res: ApiResult<{ enviadas: number; errores: number }> = await post("/polizas/enviar-activas", body ?? {});
  return unwrapOrThrow(res);
}

export async function deletePoliza(id: number): Promise<void> {
  const res: ApiResult<void> = await del(`/polizas/${id}`);
  return unwrapOrThrow(res);
}
