export type PricedCartLine = {
  originalPrice: number;
  discountAmount: number;
  quantity: number;
};

/** Line discount is already the full-line amount (list * qty * rate), never per-unit. */
export function lineTotal(item: PricedCartLine): number {
  const net = item.originalPrice * item.quantity - item.discountAmount;
  return net < 0 ? 0 : net;
}

export function cartListSubtotal(items: PricedCartLine[]): number {
  return items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
}

export function cartLineDiscounts(items: PricedCartLine[]): number {
  return items.reduce((sum, item) => sum + item.discountAmount, 0);
}

export function merchandiseTotal(
  items: PricedCartLine[],
  specialDiscountAmount = 0,
): number {
  const net = items.reduce((sum, item) => sum + lineTotal(item), 0);
  return Math.max(0, net - specialDiscountAmount);
}

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export type SpecialDiscountSelection = {
  saleItemId: number;
  quantity: number;
  allocatedAmount: number | null;
};

/** Per-line special discount. Empty map means a legacy whole-cart discount. */
export function approvedSpecialDiscount(input: {
  lines: Array<PricedCartLine & { saleItemId?: number }>;
  approvedDiscountPct: number | null;
  approvedDiscountAmount: number | null;
  items?: SpecialDiscountSelection[] | null;
}): { total: number; bySaleItemId: Record<number, number> } {
  const selections = input.items ?? [];
  if (selections.length === 0) {
    const net = input.lines.reduce((sum, line) => sum + lineTotal(line), 0);
    const total =
      input.approvedDiscountAmount ??
      roundCents(net * ((input.approvedDiscountPct ?? 0) / 100));
    return { total: roundCents(Math.max(0, total)), bySaleItemId: {} };
  }

  const bySaleItemId: Record<number, number> = {};
  for (const selection of selections) {
    const line = input.lines.find((row) => row.saleItemId === selection.saleItemId);
    if (!line || line.quantity <= 0) continue;
    const portion = lineTotal(line) * (selection.quantity / line.quantity);
    const amount =
      input.approvedDiscountAmount != null
        ? (selection.allocatedAmount ?? 0)
        : portion * ((input.approvedDiscountPct ?? 0) / 100);
    bySaleItemId[selection.saleItemId] = roundCents(Math.max(0, amount));
  }
  const total = roundCents(
    Object.values(bySaleItemId).reduce((sum, amount) => sum + amount, 0),
  );
  return { total, bySaleItemId };
}

export type PreviewPricedLine = {
  productId: number;
  originalPrice: number;
  discountAmount: number;
  totalAmount: number;
};

export function patchCartLinePrices<
  T extends PricedCartLine & { productId: number; unitPrice: number },
>(cart: T[], lines: PreviewPricedLine[]): T[] {
  const byProduct = new Map(lines.map((line) => [line.productId, line]));
  return cart.map((item) => {
    const priced = byProduct.get(item.productId);
    if (!priced) return item;
    return {
      ...item,
      originalPrice: priced.originalPrice,
      discountAmount: priced.discountAmount,
      unitPrice:
        item.quantity > 0
          ? priced.totalAmount / item.quantity
          : priced.originalPrice,
    };
  });
}
