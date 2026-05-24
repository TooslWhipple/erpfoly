import type { SupplierPaymentRow } from "@/types/supplierDashboard.types";
import { get, unwrapOrThrow } from "@/lib/axios";

export type SupplierPaymentsResult =
  | { data: SupplierPaymentRow[]; error: null }
  | { data: null; error: { message: string } };

export async function fetchSupplierPayments(
  supplierId: number
): Promise<SupplierPaymentsResult> {
  try {
    const response = await unwrapOrThrow(get(`/suppliers/${supplierId}/dashboard/payments`));
    return { data: response as SupplierPaymentRow[], error: null };
  } catch (err: any) {
    return {
      data: null,
      error: {
        message: err?.message ?? "Error al obtener los pagos.",
      },
    };
  }
}
