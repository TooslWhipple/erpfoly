import type {
  RegisterDamagedGoodsExitPayload,
  SupplierDamagedGoodsRow,
} from "@/types/supplierDashboard.types";
import { get, post, unwrapOrThrow } from "@/lib/axios";

export type SupplierDamagedGoodsResult =
  | { data: SupplierDamagedGoodsRow[]; error: null }
  | { data: null; error: { message: string } };

export type RegisterDamagedGoodsExitResult =
  | { data: { updatedIds: number[] }; error: null }
  | { data: null; error: { message: string } };

export async function fetchSupplierDamagedGoods(
  supplierId: number
): Promise<SupplierDamagedGoodsResult> {
  try {
    const response = await unwrapOrThrow(get(`/suppliers/${supplierId}/dashboard/damaged-goods`));
    return { data: response as SupplierDamagedGoodsRow[], error: null };
  } catch (err: any) {
    return {
      data: null,
      error: {
        message: err?.message ?? "Error al obtener la mercancía dañada.",
      },
    };
  }
}

export async function registerDamagedGoodsExit(
  payload: RegisterDamagedGoodsExitPayload
): Promise<RegisterDamagedGoodsExitResult> {
  try {
    const response = await unwrapOrThrow(
      post(`/suppliers/${payload.supplierId}/dashboard/damaged-goods/exit`, {
        damagedGoodsIds: payload.damagedGoodsIds,
        accountStatementId: payload.accountStatementId,
        description: payload.description,
        amount: payload.amount,
        includesVat: payload.includesVat,
      })
    );
    return { data: response as { updatedIds: number[] }, error: null };
  } catch (err: any) {
    return {
      data: null,
      error: {
        message: err?.message ?? "Error al registrar la salida de mercancía dañada.",
      },
    };
  }
}
