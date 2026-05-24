import type { SupplierDashboard } from "@/types/supplierDashboard.types";
import { get, unwrapOrThrow } from "@/lib/axios";

export type SupplierDashboardResult =
  | { data: SupplierDashboard; error: null }
  | { data: null; error: { message: string } };

export async function fetchSupplierDashboard(id: number): Promise<SupplierDashboardResult> {
  try {
    const response = await unwrapOrThrow(await get(`/suppliers/${id}/dashboard`));
    console.log("response: ", response);
    return { data: response as SupplierDashboard, error: null };
  } catch (err: any) {
    const message = err?.apiError?.message ?? err?.message ?? "Error al obtener el dashboard del proveedor.";
    return {
      data: null,
      error: { message },
    };
  }
}
