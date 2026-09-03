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

function inventorySourcesKey(
  rows: Array<{ branch_id: number; quantity: number }>,
): string {
  const byBranch = new Map<number, number>();
  for (const row of rows) {
    byBranch.set(
      row.branch_id,
      (byBranch.get(row.branch_id) ?? 0) + row.quantity,
    );
  }
  return [...byBranch.entries()]
    .sort(([a], [b]) => a - b)
    .map(([id, qty]) => `${id}:${qty}`)
    .join("|");
}

export function inventorySourcesMatch(
  a: Array<{ branch_id: number; quantity: number }>,
  b: Array<{ branch_id: number; quantity: number }>,
): boolean {
  return inventorySourcesKey(a) === inventorySourcesKey(b);
}

/** Cart +/- only changes line qty; picked sources must be resized to match. */
export function reallocInventorySources(
  sources: InventorySource[],
  quantity: number,
): InventorySource[] {
  const pickedKeys = new Set(
    sources.filter((source) => source.quantity > 0).map((source) => source.sourceKey),
  );
  if (pickedKeys.size === 0) return sources;

  let remaining = quantity;
  const next = sources.map((source) => {
    if (!pickedKeys.has(source.sourceKey)) return { ...source, quantity: 0 };
    const take = Math.min(sourceSellableMax(source), remaining);
    remaining -= take;
    return { ...source, quantity: take };
  });
  if (remaining <= 0) return next;

  const lastPicked = [...pickedKeys].at(-1);
  return next.map((source) =>
    source.sourceKey === lastPicked
      ? { ...source, quantity: source.quantity + remaining }
      : source,
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

export function pendingSupplyBreakdown(
  quantity: number,
  backorderedQuantity: number,
): { available: number; pending: number } {
  const safeQuantity = Number.isFinite(quantity) ? Math.max(0, Math.trunc(quantity)) : 0;
  const rawPending = Number.isFinite(backorderedQuantity)
    ? Math.trunc(backorderedQuantity)
    : 0;
  const pending = Math.min(safeQuantity, Math.max(0, rawPending));
  return { available: Math.max(0, safeQuantity - pending), pending };
}

export function formatPendingSupplyLabel(
  available: number,
  pending: number,
): string {
  const parts: string[] = [];
  if (available > 0) {
    const availableWord = available === 1 ? "disponible" : "disponibles";
    parts.push(`${available} ${availableWord} para entrega`);
  }
  if (pending > 0) {
    parts.push(`${pending} por surtir`);
  }
  return parts.join(" • ");
}

export function cartPendingSupplyTotal(
  items: Array<{ quantity: number; backorderedQuantity: number }>,
): number {
  return items.reduce(
    (sum, item) =>
      sum + pendingSupplyBreakdown(item.quantity, item.backorderedQuantity).pending,
    0,
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

/** Keep ticket allocation; replace on-hand fields with live product detail. */
export function overlayLiveInventoryOnSources(
  sources: InventorySource[],
  live: InventorySource[] | undefined,
): InventorySource[] {
  if (!live?.length || sources.length === 0) return sources;
  const byBranch = new Map<number, InventorySource>();
  for (const source of live) {
    if (source.branchId != null) byBranch.set(source.branchId, source);
  }
  return sources.map((source) => {
    const match =
      source.branchId != null ? byBranch.get(source.branchId) : undefined;
    if (!match) return source;
    return {
      ...source,
      available: match.available,
      pendingOrdered: match.pendingOrdered,
      inTransit: match.inTransit,
    };
  });
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
  if (
    !inventorySourcesMatch(payload, [{ branch_id: 7, quantity: 2 }]) ||
    inventorySourcesMatch(payload, [{ branch_id: 7, quantity: 1 }])
  ) {
    throw new Error("saleCartCoverage: inventory source equality");
  }
  const grown = reallocInventorySources(
    [
      {
        sourceKey: "branch-7",
        sourceType: "branch",
        branchId: 7,
        label: "Sucursal",
        available: 5,
        quantity: 1,
      },
    ],
    2,
  );
  if (grown[0].quantity !== 2) {
    throw new Error("saleCartCoverage: realloc grows picked source to line qty");
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
  const overlaid = overlayLiveInventoryOnSources(
    [
      {
        sourceKey: "branch-5",
        sourceType: "branch",
        branchId: 5,
        label: "Centro",
        available: 2,
        quantity: 2,
      },
    ],
    [
      {
        sourceKey: "branch-5",
        sourceType: "branch",
        branchId: 5,
        label: "Centro",
        available: 10,
        pendingOrdered: 0,
        inTransit: 1,
        quantity: 0,
      },
    ],
  );
  if (overlaid[0].quantity !== 2 || overlaid[0].available !== 10) {
    throw new Error("saleCartCoverage: overlay keeps allocation, uses live stock");
  }
  const mixed = pendingSupplyBreakdown(3, 2);
  if (
    mixed.available !== 1 ||
    mixed.pending !== 2 ||
    formatPendingSupplyLabel(mixed.available, mixed.pending) !==
      "1 disponible para entrega • 2 por surtir"
  ) {
    throw new Error("saleCartCoverage: mixed pending supply label");
  }
  const allPending = pendingSupplyBreakdown(3, 3);
  if (
    formatPendingSupplyLabel(allPending.available, allPending.pending) !==
    "3 por surtir"
  ) {
    throw new Error("saleCartCoverage: all-pending supply label");
  }
  const pluralAvailable = pendingSupplyBreakdown(3, 1);
  if (
    formatPendingSupplyLabel(
      pluralAvailable.available,
      pluralAvailable.pending,
    ) !== "2 disponibles para entrega • 1 por surtir"
  ) {
    throw new Error("saleCartCoverage: plural available supply label");
  }
  if (pendingSupplyBreakdown(2, -4).pending !== 0) {
    throw new Error("saleCartCoverage: negative pending clamps to 0");
  }
  if (pendingSupplyBreakdown(2, 9).pending !== 2) {
    throw new Error("saleCartCoverage: pending cannot exceed quantity");
  }
  if (
    cartPendingSupplyTotal([
      { quantity: 3, backorderedQuantity: 2 },
      { quantity: 1, backorderedQuantity: 0 },
      { quantity: 4, backorderedQuantity: 4 },
    ]) !== 6
  ) {
    throw new Error("saleCartCoverage: cart pending total");
  }
}
