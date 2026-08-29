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
