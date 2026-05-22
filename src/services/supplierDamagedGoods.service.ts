import type {
  RegisterDamagedGoodsExitPayload,
  SupplierDamagedGoodsRow,
} from "@/types/supplierDashboard.types";
import { registerSupplierChargeMock } from "@/services/supplierCharges.service";

export type SupplierDamagedGoodsResult =
  | { data: SupplierDamagedGoodsRow[]; error: null }
  | { data: null; error: { message: string } };

export type RegisterDamagedGoodsExitResult =
  | { data: { updatedIds: string[] }; error: null }
  | { data: null; error: { message: string } };

const MOCK_DAMAGED_GOODS_BY_SUPPLIER: Record<number, SupplierDamagedGoodsRow[]> = {
  1: [
    {
      id: "dmg-1",
      sku: "000001",
      warehouse: "Matriz",
      entryDate: "12/Feb/2026",
      articleName: "Lavadora Mabe 25kg LMG9025N5MNBABO Blanca",
      damageDescription: "Defecto de fábrica en panel frontal",
      status: "scheduled",
      elapsedLabel: "3 mes",
      urgency: "high",
    },
    {
      id: "dmg-2",
      sku: "000002",
      warehouse: "Matriz",
      entryDate: "18/Feb/2026",
      articleName: "Secadora Mabe 20kg SMG26N5MNBABO Blanca",
      damageDescription: "Rayón en tambor durante traslado",
      status: "pending",
      elapsedLabel: "2 mes",
      urgency: "high",
    },
    {
      id: "dmg-3",
      sku: "000003",
      warehouse: "Matriz",
      entryDate: "05/Mar/2026",
      articleName: "Lavadora Mabe 15kg LMG7515N5MNBABO Blanca",
      damageDescription: "Falla en motor de lavado",
      status: "pending",
      elapsedLabel: "1 mes",
      urgency: "medium",
    },
    {
      id: "dmg-4",
      sku: "000004",
      warehouse: "Matriz",
      entryDate: "20/Mar/2026",
      articleName: "Secadora Mabe 20kg SMG26N5MNBABO Blanca",
      damageDescription: "Control digital sin respuesta",
      status: "scheduled",
      elapsedLabel: "3 sem",
      urgency: "low",
    },
  ],
};

const damagedGoodsStore = new Map<number, SupplierDamagedGoodsRow[]>();

function getDamagedGoodsForSupplier(supplierId: number): SupplierDamagedGoodsRow[] {
  if (!damagedGoodsStore.has(supplierId)) {
    damagedGoodsStore.set(supplierId, [...(MOCK_DAMAGED_GOODS_BY_SUPPLIER[supplierId] ?? [])]);
  }
  return damagedGoodsStore.get(supplierId) ?? [];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function fetchSupplierDamagedGoodsMock(
  supplierId: number
): Promise<SupplierDamagedGoodsResult> {
  await delay(400);

  if (!Number.isFinite(supplierId) || supplierId <= 0) {
    return { data: null, error: { message: "Identificador de proveedor no válido." } };
  }

  return { data: getDamagedGoodsForSupplier(supplierId), error: null };
}

export async function registerDamagedGoodsExitMock(
  payload: RegisterDamagedGoodsExitPayload
): Promise<RegisterDamagedGoodsExitResult> {
  await delay(500);

  if (!payload.damagedGoodsIds.length) {
    return { data: null, error: { message: "Selecciona al menos un artículo." } };
  }

  const chargeResult = await registerSupplierChargeMock({
    supplierId: payload.supplierId,
    accountStatementId: payload.accountStatementId,
    chargedInLabel: payload.chargedInLabel,
    categoryId: "damaged_goods",
    description: payload.description,
    amount: payload.amount,
    includesVat: payload.includesVat,
  });

  if (chargeResult.error) {
    return { data: null, error: chargeResult.error };
  }

  const current = getDamagedGoodsForSupplier(payload.supplierId);
  const updatedIds = payload.damagedGoodsIds;
  const nextRows = current.map((row) =>
    updatedIds.includes(row.id) ? { ...row, status: "scheduled" as const } : row
  );
  damagedGoodsStore.set(payload.supplierId, nextRows);

  return { data: { updatedIds }, error: null };
}
