import type { InventorySource } from "@/types/ventas.types";

type QtySource = {
  quantity: number;
  available: number;
  pendingOrdered?: number;
  sourceType?: string;
  branchId?: number;
};

export function toInventorySourcesPayload(
  sources: InventorySource[],
): Array<{ branch_id: number; quantity: number }> {
  return sources.flatMap((source) =>
    source.quantity > 0 && source.branchId != null
      ? [{ branch_id: source.branchId, quantity: source.quantity }]
      : [],
  );
}

export function sourceSellableMax(src: {
  available: number;
  pendingOrdered?: number;
  sourceType?: string;
}): number {
  return (
    src.available +
    (src.sourceType === "warehouse" ? (src.pendingOrdered ?? 0) : 0)
  );
}

export function backorderedFromSources(
  sources: QtySource[],
  quantity: number,
): number {
  const picked = sources.filter((src) => src.quantity > 0);
  const fromSources = picked.reduce(
    (sum, src) => sum + Math.max(0, src.quantity - src.available),
    0,
  );
  const sourceQty = picked.reduce((sum, src) => sum + src.quantity, 0);
  const extra = Math.max(0, quantity - sourceQty);
  const unusedExistence = picked.reduce(
    (sum, src) => sum + Math.max(0, src.available - src.quantity),
    0,
  );
  return fromSources + Math.max(0, extra - unusedExistence);
}

export function sellableMaxFromPickedSources(sources: QtySource[]): number {
  return sources
    .filter((src) => src.quantity > 0)
    .reduce((sum, src) => sum + sourceSellableMax(src), 0);
}

/** Existencia + por surtir (bodega) en sucursal de venta y bodega. */
export function sellableCeilingForHydratedLine(
  sources: QtySource[],
  currentBranchId: number,
): number {
  return sources
    .filter(
      (src) =>
        src.sourceType === "warehouse" || src.branchId === currentBranchId,
    )
    .reduce((sum, src) => sum + sourceSellableMax(src), 0);
}

/** No baja una línea ya aceptada (backorder); sí impide subir más que el techo. */
export function hydratedLineQtyMax(
  currentQty: number,
  sellableCeiling: number,
): number {
  return Math.max(currentQty, sellableCeiling);
}

// ponytail: fails if the backorder chip / sellable cap regress
if (typeof process !== "undefined" && process.env.NODE_ENV === "test") {
  const payload = toInventorySourcesPayload([
    {
      sourceKey: "branch-7",
      sourceType: "branch",
      branchId: 7,
      label: "Sucursal",
      available: 2,
      quantity: 2,
    },
  ]);
  if (payload.length !== 1 || payload[0].branch_id !== 7) {
    throw new Error("saleCartCoverage: serializes selected inventory source");
  }
  const warehouse = {
    quantity: 4,
    available: 2,
    pendingOrdered: 3,
    sourceType: "warehouse",
  };
  const branch = {
    quantity: 3,
    available: 5,
    sourceType: "branch",
  };
  if (sourceSellableMax(warehouse) !== 5) {
    throw new Error("saleCartCoverage: warehouse max");
  }
  if (backorderedFromSources([warehouse], 4) !== 2) {
    throw new Error("saleCartCoverage: warehouse backorder");
  }
  if (backorderedFromSources([branch, warehouse], 7) !== 2) {
    throw new Error("saleCartCoverage: mixed backorder");
  }
  if (sellableMaxFromPickedSources([branch, warehouse]) !== 10) {
    throw new Error("saleCartCoverage: mixed cap");
  }
  if (backorderedFromSources([branch], 4) !== 0) {
    throw new Error("saleCartCoverage: extra fills unused existence");
  }
  const otherBranch = {
    quantity: 0,
    available: 99,
    sourceType: "branch",
    branchId: 99,
  };
  const currentBranch = {
    quantity: 0,
    available: 4,
    sourceType: "branch",
    branchId: 2,
  };
  const warehouseIdle = {
    quantity: 0,
    available: 1,
    pendingOrdered: 2,
    sourceType: "warehouse",
  };
  if (
    sellableCeilingForHydratedLine(
      [currentBranch, warehouseIdle, otherBranch],
      2,
    ) !== 7
  ) {
    throw new Error("saleCartCoverage: hydrated ceiling ignores other branches");
  }
  if (hydratedLineQtyMax(3, 10) !== 10) {
    throw new Error("saleCartCoverage: hydrated max uses ceiling");
  }
  if (hydratedLineQtyMax(8, 5) !== 8) {
    throw new Error("saleCartCoverage: hydrated max keeps backorder qty");
  }
}
