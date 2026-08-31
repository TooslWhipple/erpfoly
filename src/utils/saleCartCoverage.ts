type QtySource = {
  quantity: number;
  available: number;
  pendingOrdered?: number;
  sourceType?: string;
};

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

// ponytail: fails if the backorder chip / sellable cap regress
if (typeof process !== "undefined" && process.env.NODE_ENV === "test") {
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
}
