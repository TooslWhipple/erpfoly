export const SALE_STOCK_CHANGED = "SALE_STOCK_CHANGED";

export type SaleStockChangedLine = {
  saleItemId: number;
  productId: number;
  branchId: number;
  sourceField: "existence" | "ordered";
  requested: number;
  covered: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object";
}

const DEFAULT_MESSAGE =
  "La existencia cambió mientras se armaba la venta. Revisa la cobertura antes de registrar.";

export class SaleStockChangedError extends Error {
  lines: SaleStockChangedLine[];

  constructor(message: string, lines: SaleStockChangedLine[]) {
    super(message);
    this.name = "SaleStockChangedError";
    this.lines = lines;
  }
}

/** Reads the 409 body of register/checkout/layaway (`errorCode` + `data.lines`). */
export function throwIfSaleStockChanged(body: unknown): void {
  if (!isRecord(body) || body.errorCode !== SALE_STOCK_CHANGED) return;
  const data = isRecord(body.data) ? body.data : null;
  const lines = Array.isArray(data?.lines)
    ? (data.lines as SaleStockChangedLine[])
    : [];
  const message =
    typeof body.message === "string" && body.message.trim()
      ? body.message
      : DEFAULT_MESSAGE;
  throw new SaleStockChangedError(message, lines);
}
