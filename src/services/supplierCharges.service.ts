import type {
  RegisterSupplierChargePayload,
  SupplierChargeCategoryOption,
  SupplierChargeRow,
} from "@/types/supplierDashboard.types";
import { get, post, unwrapOrThrow } from "@/lib/axios";

export type SupplierChargesResult =
  | { data: SupplierChargeRow[]; error: null }
  | { data: null; error: { message: string } };

export type RegisterSupplierChargeResult =
  | { data: SupplierChargeRow; error: null }
  | { data: null; error: { message: string } };

export const SUPPLIER_CHARGE_CATEGORIES: SupplierChargeCategoryOption[] = [
  { id: "advertising", label: "Publicidad" },
  { id: "damaged_goods", label: "Mercancía dañada" },
  { id: "services", label: "Servicios" },
  { id: "logistics", label: "Logística" },
  { id: "other", label: "Otros" },
];

export function getSupplierChargeCategories(): SupplierChargeCategoryOption[] {
  return SUPPLIER_CHARGE_CATEGORIES;
}

export async function fetchSupplierCharges(
  supplierId: number
): Promise<SupplierChargesResult> {
  try {
    const response = await unwrapOrThrow(get(`/suppliers/${supplierId}/dashboard/charges`));
    return { data: response as SupplierChargeRow[], error: null };
  } catch (err: any) {
    return {
      data: null,
      error: {
        message: err?.message ?? "Error al obtener los cargos.",
      },
    };
  }
}

export async function registerSupplierCharge(
  payload: RegisterSupplierChargePayload
): Promise<RegisterSupplierChargeResult> {
  try {
    const response = await unwrapOrThrow(
      post(`/suppliers/${payload.supplierId}/dashboard/charges`, {
        accountStatementId: payload.accountStatementId,
        categoryId: payload.categoryId,
        description: payload.description,
        amount: payload.amount,
        includesVat: payload.includesVat,
      })
    );
    return { data: response as SupplierChargeRow, error: null };
  } catch (err: any) {
    return {
      data: null,
      error: {
        message: err?.message ?? "Error al registrar el cargo.",
      },
    };
  }
}
