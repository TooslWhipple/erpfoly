import type {
  EditSupplierPaymentPayload,
  ExecuteSupplierPaymentPayload,
  RegisterSupplierPaymentPayload,
  ScheduleSupplierPaymentPayload,
  SupplierPaymentRow,
} from "@/types/supplierDashboard.types";
import { del, get, getApiErrorMessage, patch, post, unwrapOrThrow } from "@/lib/axios";

export type SupplierPaymentsResult =
  | { data: SupplierPaymentRow[]; error: null }
  | { data: null; error: { message: string } };

export type SupplierPaymentResult =
  | { data: SupplierPaymentRow; error: null }
  | { data: null; error: { message: string } };

export type SupplierPaymentActionResult =
  | { data: true; error: null }
  | { data: null; error: { message: string } };

export async function fetchSupplierPayments(
  supplierId: number
): Promise<SupplierPaymentsResult> {
  try {
    const response = unwrapOrThrow(await get(`/suppliers/${supplierId}/dashboard/payments`));
    return { data: response as SupplierPaymentRow[], error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: getApiErrorMessage(err) || "Error al obtener los pagos." },
    };
  }
}

export async function scheduleSupplierPayment(
  supplierId: number,
  payload: ScheduleSupplierPaymentPayload
): Promise<SupplierPaymentResult> {
  try {
    const response = unwrapOrThrow(
      await post(`/suppliers/${supplierId}/dashboard/payments/schedule`, payload)
    );
    return { data: response as SupplierPaymentRow, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: getApiErrorMessage(err) || "Error al programar el pago." },
    };
  }
}

export async function registerSupplierPayment(
  supplierId: number,
  payload: RegisterSupplierPaymentPayload
): Promise<SupplierPaymentResult> {
  try {
    const response = unwrapOrThrow(
      await post(`/suppliers/${supplierId}/dashboard/payments/register`, payload)
    );
    return { data: response as SupplierPaymentRow, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: getApiErrorMessage(err) || "Error al registrar el pago." },
    };
  }
}

export async function executeSupplierPayment(
  supplierId: number,
  paymentId: number,
  payload: ExecuteSupplierPaymentPayload = {}
): Promise<SupplierPaymentResult> {
  try {
    const response = unwrapOrThrow(
      await patch(`/suppliers/${supplierId}/dashboard/payments/${paymentId}/execute`, payload)
    );
    return { data: response as SupplierPaymentRow, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: getApiErrorMessage(err) || "Error al ejecutar el pago." },
    };
  }
}

export async function editSupplierPayment(
  supplierId: number,
  paymentId: number,
  payload: EditSupplierPaymentPayload
): Promise<SupplierPaymentResult> {
  try {
    const response = unwrapOrThrow(
      await patch(`/suppliers/${supplierId}/dashboard/payments/${paymentId}`, payload)
    );
    return { data: response as SupplierPaymentRow, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: getApiErrorMessage(err) || "Error al editar el pago." },
    };
  }
}

export async function cancelSupplierPayment(
  supplierId: number,
  paymentId: number
): Promise<SupplierPaymentActionResult> {
  try {
    unwrapOrThrow(await del(`/suppliers/${supplierId}/dashboard/payments/${paymentId}`));
    return { data: true, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: getApiErrorMessage(err) || "Error al cancelar el pago." },
    };
  }
}

export async function uploadPaymentReceipt(
  supplierId: number,
  paymentId: number,
  file: File
): Promise<SupplierPaymentResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = unwrapOrThrow(
      await post(
        `/suppliers/${supplierId}/dashboard/payments/${paymentId}/receipt`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )
    );
    return { data: response as SupplierPaymentRow, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: getApiErrorMessage(err) || "Error al subir el comprobante." },
    };
  }
}
