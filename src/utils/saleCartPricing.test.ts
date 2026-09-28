/**
 * Cart line math: discountAmount is the full line, not per unit.
 * Run: npx --yes tsx src/utils/saleCartPricing.test.ts
 */
import assert from "node:assert/strict";
import {
  cartLineDiscounts,
  cartListSubtotal,
  approvedSpecialDiscount,
  lineTotal,
  merchandiseTotal,
  patchCartLinePrices,
} from "./saleCartPricing";

const line = { originalPrice: 15500, discountAmount: 2325, quantity: 1 };
assert.equal(lineTotal(line), 13175);
assert.equal(cartListSubtotal([line]), 15500);
assert.equal(cartLineDiscounts([line]), 2325);
assert.equal(merchandiseTotal([line]), 13175);

const two = { originalPrice: 1000, discountAmount: 300, quantity: 2 };
assert.equal(lineTotal(two), 1700);
assert.equal(cartLineDiscounts([two]), 300);
assert.equal(merchandiseTotal([two], 100), 1600);

const partial = approvedSpecialDiscount({
  lines: [
    { saleItemId: 1, originalPrice: 500, discountAmount: 0, quantity: 2 },
    { saleItemId: 2, originalPrice: 800, discountAmount: 0, quantity: 1 },
  ],
  approvedDiscountPct: 10,
  approvedDiscountAmount: null,
  items: [{ saleItemId: 1, quantity: 1, allocatedAmount: null }],
});
assert.equal(partial.bySaleItemId[1], 50);
assert.equal(partial.bySaleItemId[2], undefined);
assert.equal(partial.total, 50);

const patched = patchCartLinePrices(
  [
    {
      productId: 1,
      originalPrice: 15500,
      discountAmount: 0,
      quantity: 1,
      unitPrice: 15500,
    },
  ],
  [{ productId: 1, originalPrice: 15500, discountAmount: 2325, totalAmount: 13175 }],
);
assert.equal(patched[0].discountAmount, 2325);
assert.equal(patched[0].unitPrice, 13175);

console.log("saleCartPricing.test.ts: ok");
