import type { SupplierPaymentRow } from "@/types/supplierDashboard.types";

export type SupplierPaymentsResult =
  | { data: SupplierPaymentRow[]; error: null }
  | { data: null; error: { message: string } };

const MOCK_PAYMENTS_BY_SUPPLIER: Record<number, SupplierPaymentRow[]> = {
  1: [
    {
      id: "payment-1",
      description: "Recepción de mercancía 543543",
      chargedInLabel: "Junio 2026",
      amount: 352_500,
      status: "pending",
    },
    {
      id: "payment-2",
      description: "Recepción de mercancía 521104",
      chargedInLabel: "Mayo 2026",
      amount: 198_400,
      status: "paid",
    },
    {
      id: "payment-3",
      description: "Recepción de mercancía 498221",
      chargedInLabel: "Mayo 2026",
      amount: 125_750,
      status: "pending",
    },
  ],
};

const paymentsStore = new Map<number, SupplierPaymentRow[]>();

function getPaymentsForSupplier(supplierId: number): SupplierPaymentRow[] {
  if (!paymentsStore.has(supplierId)) {
    paymentsStore.set(supplierId, [...(MOCK_PAYMENTS_BY_SUPPLIER[supplierId] ?? [])]);
  }
  return paymentsStore.get(supplierId) ?? [];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function fetchSupplierPaymentsMock(
  supplierId: number
): Promise<SupplierPaymentsResult> {
  await delay(400);

  if (!Number.isFinite(supplierId) || supplierId <= 0) {
    return { data: null, error: { message: "Identificador de proveedor no válido." } };
  }

  return { data: getPaymentsForSupplier(supplierId), error: null };
}
