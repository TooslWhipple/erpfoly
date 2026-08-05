import { api } from "@/lib/axios";
import type {
  PolizaSistema,
  CreatePolizaSistemaDto,
  UpdatePolizaSistemaDto,
} from "@/types/contabilidad.types";

export async function getPolizasSistema(): Promise<PolizaSistema[]> {
  const { data } = await api.get<PolizaSistema[]>("/polizas-sistema");
  return data;
}

export async function getPolizaSistemaById(id: number): Promise<PolizaSistema> {
  const { data } = await api.get<PolizaSistema>(`/polizas-sistema/${id}`);
  return data;
}

export async function createPolizaSistema(dto: CreatePolizaSistemaDto): Promise<PolizaSistema> {
  const { data } = await api.post<PolizaSistema>("/polizas-sistema", dto);
  return data;
}

export async function updatePolizaSistema(id: number, dto: UpdatePolizaSistemaDto): Promise<PolizaSistema> {
  const { data } = await api.put<PolizaSistema>(`/polizas-sistema/${id}`, dto);
  return data;
}

export async function deletePolizaSistema(id: number): Promise<void> {
  await api.delete(`/polizas-sistema/${id}`);
}
