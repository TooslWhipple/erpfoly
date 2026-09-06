/**
 * Run: npx --yes tsx src/utils/economicRevision.test.ts
 */
import assert from "node:assert/strict";
import {
  ECONOMIC_REVISION_REQUIRED,
  chargeFromAcceptedRevision,
  parseEconomicRevisionRequired,
  throwIfEconomicRevisionRequired,
  summarizeEconomicRevisionLines,
  EconomicRevisionRequiredError,
} from "./economicRevision";

assert.equal(parseEconomicRevisionRequired({ message: "x" }), null);
assert.equal(
  parseEconomicRevisionRequired({
    errorCode: ECONOMIC_REVISION_REQUIRED,
    data: { foo: 1 },
  }),
  null,
);

const preview = parseEconomicRevisionRequired({
  errorCode: ECONOMIC_REVISION_REQUIRED,
  message: "El precio o las promociones cambiaron.",
  data: {
    economicRevision: 2,
    shippingAmount: 0,
    quotedTotalAmount: 5855.95,
    currentTotalAmount: 9009.15,
    currentMinimumDownPayment: 900.92,
    changed: true,
    diffs: [
      {
        saleItemId: 1,
        productId: 9,
        quotedListPrice: 10,
        currentListPrice: 12,
        quotedPromotionId: null,
        currentPromotionId: 3,
      },
    ],
  },
});
assert.ok(preview);
assert.equal(preview.quotedTotalAmount, 5855.95);
assert.equal(preview.currentTotalAmount, 9009.15);
assert.equal(preview.currentMinimumDownPayment, 900.92);
assert.equal(preview.diffs.length, 1);

assert.throws(
  () =>
    throwIfEconomicRevisionRequired({
      errorCode: ECONOMIC_REVISION_REQUIRED,
      message: "revisión",
      data: {
        quotedTotalAmount: 5855.95,
        currentTotalAmount: 9009.15,
        currentMinimumDownPayment: 900.92,
      },
    }),
  (err: unknown) =>
    err instanceof EconomicRevisionRequiredError &&
    err.preview.currentMinimumDownPayment === 900.92,
);

const summaryAfterAccept = chargeFromAcceptedRevision(preview, "CREDIT");
assert.equal(summaryAfterAccept.tenderDue, 900.92);
assert.equal(chargeFromAcceptedRevision(preview, "CASH").tenderDue, 9009.15);

const lines = summarizeEconomicRevisionLines(preview.diffs);
assert.equal(lines.length, 1);
assert.equal(lines[0].priceChanged, true);
assert.equal(
  summarizeEconomicRevisionLines([
    {
      saleItemId: 15,
      productId: 4,
      quotedListPrice: 10599,
      currentListPrice: 10599,
      quotedPromotionId: 1,
      currentPromotionId: 1,
    },
  ]).length,
  0,
);
assert.equal(
  summarizeEconomicRevisionLines([
    {
      saleItemId: 15,
      productId: 4,
      quotedListPrice: 10599,
      currentListPrice: 10599,
      quotedPromotionId: 1,
      currentPromotionId: 2,
    },
  ])[0].promoChanged,
  true,
);

console.log("economicRevision.test.ts ok");
