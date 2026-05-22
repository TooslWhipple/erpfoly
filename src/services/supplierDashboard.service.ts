import type { SupplierDashboard } from "@/types/supplierDashboard.types";

export type SupplierDashboardResult =
  | { data: SupplierDashboard; error: null }
  | { data: null; error: { message: string } };

const MOCK_SUPPLIER_NAMES: Record<number, string> = {
  1: "Mabe S.A de C.V.",
  2: "Samsung Electronics México",
  3: "LG Electronics México",
};

function resolveSupplierName(id: number): string {
  return MOCK_SUPPLIER_NAMES[id] ?? `Proveedor #${id}`;
}

function buildDashboard(id: number): SupplierDashboard {
  const supplierName = resolveSupplierName(id);

  return {
    supplierId: id,
    supplierName,
    summary: {
      pendingPayments: 870_369.42,
      supplierCharges: 25_980.0,
      totalToPay: 844_389.42,
    },
    accountStatements: [
      {
        id: "stmt-1",
        periodLabel: "Mayo 2026",
        amount: 394_440.44,
        payments: 100_000.0,
        balance: 294_440.0,
        status: "pending",
      },
      {
        id: "stmt-2",
        periodLabel: "Abril 2026",
        amount: 40_930.0,
        payments: 20_000.0,
        balance: 20_930.0,
        status: "overdue",
      },
      {
        id: "stmt-3",
        periodLabel: "Marzo 2026",
        amount: 40_930.0,
        payments: 20_000.0,
        balance: 20_930.0,
        status: "paid",
      },
    ],
    upcomingDeliveries: [
      {
        id: "upcoming-1",
        dateLabel: "05 de Mayo",
        itemCount: 25,
        items: [
          {
            id: "item-1",
            productName: "Secadora Mabe 20kg SMG26N5MNBABO Blanca",
            quantity: 15,
          },
          {
            id: "item-2",
            productName: "Lavadora Mabe 25kg LMG9025N5MNBABO Blanca",
            quantity: 10,
          },
        ],
      },
    ],
    recentDeliveries: [
      {
        id: "recent-1",
        dateLabel: "22 de Abril",
        itemCount: 40,
        items: [
          {
            id: "item-3",
            productName: "Secadora Mabe 20kg SMG26N5MNBABO Blanca",
            quantity: 8,
          },
          {
            id: "item-4",
            productName: "Lavadora Mabe 25kg LMG9025N5MNBABO Blanca",
            quantity: 12,
          },
          {
            id: "item-5",
            productName: "Lavadora Mabe 15kg LMG7515N5MNBABO Blanca",
            quantity: 20,
          },
        ],
      },
      {
        id: "recent-2",
        dateLabel: "02 de Abril",
        itemCount: 9,
        items: [
          {
            id: "item-6",
            productName: "Secadora Mabe 20kg SMG26N5MNBABO Blanca",
            quantity: 9,
          },
        ],
      },
    ],
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function fetchSupplierDashboardMock(
  id: number
): Promise<SupplierDashboardResult> {
  await delay(450);

  if (!Number.isFinite(id) || id <= 0) {
    return { data: null, error: { message: "Identificador de proveedor no válido." } };
  }

  if (id === 404) {
    return { data: null, error: { message: "Proveedor no encontrado." } };
  }

  return { data: buildDashboard(id), error: null };
}
