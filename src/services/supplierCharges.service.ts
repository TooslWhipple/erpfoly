import type {
  RegisterSupplierChargePayload,
  SupplierChargeCategoryOption,
  SupplierChargeRow,
} from "@/types/supplierDashboard.types";

export type SupplierChargesResult =
  | { data: SupplierChargeRow[]; error: null }
  | { data: null; error: { message: string } };

export type RegisterSupplierChargeResult =
  | { data: SupplierChargeRow; error: null }
  | { data: null; error: { message: string } };

const MOCK_CATEGORIES: SupplierChargeCategoryOption[] = [
  { id: "advertising", label: "Publicidad" },
  { id: "damaged_goods", label: "Mercancía dañada" },
  { id: "services", label: "Servicios" },
  { id: "logistics", label: "Logística" },
  { id: "other", label: "Otros" },
];

const MOCK_CHARGES_BY_SUPPLIER: Record<number, SupplierChargeRow[]> = {
  1: [
    {
      id: "charge-1",
      description: "Gastos por publicidad de promoción Buen Fin 2026",
      category: "Publicidad",
      chargedInLabel: "Junio 2026",
      amount: 32_500,
      status: "pending",
    },
    {
      id: "charge-2",
      description: "Cobro de mercancía dañada perteneciente a pedido #45821",
      category: "Mercancía dañada",
      chargedInLabel: "Mayo 2026",
      amount: 32_500,
      status: "paid",
    },
    {
      id: "charge-3",
      description: "Ajuste por faltante en recepción de mercancía",
      category: "Logística",
      chargedInLabel: "Mayo 2026",
      amount: 8_750,
      status: "pending",
    },
  ],
};

const chargesStore = new Map<number, SupplierChargeRow[]>();

function getChargesForSupplier(supplierId: number): SupplierChargeRow[] {
  if (!chargesStore.has(supplierId)) {
    chargesStore.set(supplierId, [...(MOCK_CHARGES_BY_SUPPLIER[supplierId] ?? [])]);
  }
  return chargesStore.get(supplierId) ?? [];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function getSupplierChargeCategories(): SupplierChargeCategoryOption[] {
  return MOCK_CATEGORIES;
}

export async function fetchSupplierChargesMock(
  supplierId: number
): Promise<SupplierChargesResult> {
  await delay(400);

  if (!Number.isFinite(supplierId) || supplierId <= 0) {
    return { data: null, error: { message: "Identificador de proveedor no válido." } };
  }

  return { data: getChargesForSupplier(supplierId), error: null };
}

export async function registerSupplierChargeMock(
  payload: RegisterSupplierChargePayload
): Promise<RegisterSupplierChargeResult> {
  await delay(500);

  if (!Number.isFinite(payload.supplierId) || payload.supplierId <= 0) {
    return { data: null, error: { message: "Proveedor no válido." } };
  }

  if (!payload.accountStatementId) {
    return { data: null, error: { message: "Selecciona un estado de cuenta." } };
  }

  if (!payload.categoryId) {
    return { data: null, error: { message: "Selecciona una categoría." } };
  }

  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    return { data: null, error: { message: "El monto debe ser mayor a cero." } };
  }

  const category = MOCK_CATEGORIES.find((item) => item.id === payload.categoryId);

  const newCharge: SupplierChargeRow = {
    id: `charge-${Date.now()}`,
    description: payload.description.trim() || "Cargo registrado",
    category: category?.label ?? "Otros",
    chargedInLabel: payload.chargedInLabel,
    amount: payload.amount,
    status: "pending",
  };

  const current = getChargesForSupplier(payload.supplierId);
  chargesStore.set(payload.supplierId, [newCharge, ...current]);

  return { data: newCharge, error: null };
}
