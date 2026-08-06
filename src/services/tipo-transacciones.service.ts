import { api } from "@/lib/axios";
import type {
  TipoTransaccion,
  CreateTipoTransaccionDto,
  UpdateTipoTransaccionDto,
  TipoCuenta,
  AccountingAccountItem,
} from "@/types/contabilidad.types";

export async function getTipoTransacciones(): Promise<TipoTransaccion[]> {
  const { data } = await api.get<TipoTransaccion[]>("/tipo-transacciones");
  return data;
}

export async function getTipoTransaccionById(id: number): Promise<TipoTransaccion> {
  const { data } = await api.get<TipoTransaccion>(`/tipo-transacciones/${id}`);
  return data;
}

export async function createTipoTransaccion(dto: CreateTipoTransaccionDto): Promise<TipoTransaccion> {
  const { data } = await api.post<TipoTransaccion>("/tipo-transacciones", dto);
  return data;
}

export async function updateTipoTransaccion(id: number, dto: UpdateTipoTransaccionDto): Promise<TipoTransaccion> {
  const { data } = await api.put<TipoTransaccion>(`/tipo-transacciones/${id}`, dto);
  return data;
}

export async function deleteTipoTransaccion(id: number): Promise<void> {
  await api.delete(`/tipo-transacciones/${id}`);
}

export async function getTiposCuenta(): Promise<TipoCuenta[]> {
  try {
    const response = await api.get<any>("/tipos-cuenta");
    const rawData = response.data;
    const items = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : []);
    return items.length > 0
      ? items
      : [
          { id: 1, clave: "PERSONALIZADA", descripcion: "Personalizada" },
          { id: 2, clave: "CUENTA_DEUDOR", descripcion: "Cuenta Deudor" },
          { id: 3, clave: "CUENTA_GASTO", descripcion: "Cuenta Gasto" },
          { id: 4, clave: "CUENTA_PROVEEDOR", descripcion: "Cuenta Proveedor" },
          { id: 5, clave: "CUENTA_DEPARTAMENTO_INVENTARIO", descripcion: "Cuenta Departamento Inventario" },
          { id: 6, clave: "CUENTA_DEPARTAMENTO_RESULTADOS", descripcion: "Cuenta Departamento Resultados" },
        ];
  } catch {
    return [
      { id: 1, clave: "PERSONALIZADA", descripcion: "Personalizada" },
      { id: 2, clave: "CUENTA_DEUDOR", descripcion: "Cuenta Deudor" },
      { id: 3, clave: "CUENTA_GASTO", descripcion: "Cuenta Gasto" },
      { id: 4, clave: "CUENTA_PROVEEDOR", descripcion: "Cuenta Proveedor" },
      { id: 5, clave: "CUENTA_DEPARTAMENTO_INVENTARIO", descripcion: "Cuenta Departamento Inventario" },
      { id: 6, clave: "CUENTA_DEPARTAMENTO_RESULTADOS", descripcion: "Cuenta Departamento Resultados" },
    ];
  }
}

export async function searchAccountingAccounts(params?: { q?: string; limit?: number }): Promise<{ data: AccountingAccountItem[] }> {
  try {
    const response = await api.get<any>("/accounting-accounts/search", { params });
    const rawData = response.data;
    const items = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : []);
    return { data: items };
  } catch {
    return { data: [] };
  }
}
