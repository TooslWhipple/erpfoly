export const ECONOMIC_REVISION_REQUIRED = "ECONOMIC_REVISION_REQUIRED";

export type EconomicRevisionDiff = {
  saleItemId: number;
  productId: number;
  quotedListPrice: number;
  currentListPrice: number;
  quotedPromotionId: number | null;
  currentPromotionId: number | null;
};

export type EconomicRevisionPreview = {
  economicRevision: number;
  shippingAmount: number;
  quotedTotalAmount: number;
  currentTotalAmount: number;
  currentMinimumDownPayment: number;
  changed: boolean;
  diffs: EconomicRevisionDiff[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object";
}

function messageFromRevisionBody(body: unknown): string {
  if (isRecord(body) && typeof body.message === "string" && body.message.trim()) {
    return body.message;
  }
  return "El precio o las promociones cambiaron. Acepta la revisión económica para continuar.";
}

/** Reads the 409 body from the POS API (`errorCode` + `data` preview). */
export function parseEconomicRevisionRequired(
  body: unknown,
): EconomicRevisionPreview | null {
  if (!isRecord(body) || body.errorCode !== ECONOMIC_REVISION_REQUIRED) {
    return null;
  }
  const data = body.data;
  if (!isRecord(data)) return null;
  if (
    typeof data.quotedTotalAmount !== "number" ||
    typeof data.currentTotalAmount !== "number"
  ) {
    return null;
  }
  return {
    economicRevision: Number(data.economicRevision ?? 0),
    shippingAmount: Number(data.shippingAmount ?? 0),
    quotedTotalAmount: data.quotedTotalAmount,
    currentTotalAmount: data.currentTotalAmount,
    currentMinimumDownPayment: Number(data.currentMinimumDownPayment ?? 0),
    changed: Boolean(data.changed),
    diffs: Array.isArray(data.diffs) ? (data.diffs as EconomicRevisionDiff[]) : [],
  };
}

export class EconomicRevisionRequiredError extends Error {
  preview: EconomicRevisionPreview;

  constructor(message: string, preview: EconomicRevisionPreview) {
    super(message);
    this.name = "EconomicRevisionRequiredError";
    this.preview = preview;
  }
}

export function throwIfEconomicRevisionRequired(body: unknown): void {
  const preview = parseEconomicRevisionRequired(body);
  if (!preview) return;
  throw new EconomicRevisionRequiredError(messageFromRevisionBody(body), preview);
}

export function throwIfSaleError(error: { message: string } | null): void {
  if (!error) return;
  throw new Error(error.message);
}

/** Amounts the POS must send after the cashier accepts a catalog/promo revision. */
export function chargeFromAcceptedRevision(
  preview: EconomicRevisionPreview,
  paymentType: "CREDIT" | "CASH" | "LAYAWAY",
): { total: number; tenderDue: number } {
  const total = preview.currentTotalAmount;
  if (paymentType === "CREDIT") {
    return { total, tenderDue: preview.currentMinimumDownPayment };
  }
  return { total, tenderDue: total };
}

export type EconomicRevisionLineSummary = {
  saleItemId: number;
  productId: number;
  priceChanged: boolean;
  promoChanged: boolean;
  quotedListPrice: number;
  currentListPrice: number;
};

const PRICE_EPSILON = 0.009;

/** Skip same-price rows; cashiers only need list or promo changes. */
export function summarizeEconomicRevisionLines(
  diffs: EconomicRevisionDiff[],
): EconomicRevisionLineSummary[] {
  return diffs.flatMap((diff) => {
    const priceChanged =
      Math.abs(diff.quotedListPrice - diff.currentListPrice) > PRICE_EPSILON;
    const promoChanged = diff.quotedPromotionId !== diff.currentPromotionId;
    if (!priceChanged && !promoChanged) return [];
    return [
      {
        saleItemId: diff.saleItemId,
        productId: diff.productId,
        priceChanged,
        promoChanged,
        quotedListPrice: diff.quotedListPrice,
        currentListPrice: diff.currentListPrice,
      },
    ];
  });
}
