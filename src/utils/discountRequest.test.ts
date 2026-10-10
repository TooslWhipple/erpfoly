/**
 * Quantity keystrokes must not snap to the line maximum.
 * Run: npx --yes tsx src/utils/discountRequest.test.ts
 */
import assert from "node:assert/strict";
import {
  discountRequestPiecesReady,
  groupDiscountPiecesBySku,
  parseDiscountQuantityInput,
  syncDiscountPieceSlots,
} from "./discountRequest";

assert.equal(parseDiscountQuantityInput("2", 3), 2);
assert.equal(parseDiscountQuantityInput("3", 3), 3);
assert.equal(parseDiscountQuantityInput("", 3), null);
assert.equal(parseDiscountQuantityInput("12", 3), undefined);
assert.equal(parseDiscountQuantityInput("0", 3), undefined);
assert.equal(parseDiscountQuantityInput("4", 3), undefined);

const slots = syncDiscountPieceSlots(["dañado"], 2, () => "");
assert.deepEqual(slots, ["dañado", ""]);
assert.equal(
  syncDiscountPieceSlots(["a", "b", "c"], 2, () => "").length,
  2,
);

const groups = groupDiscountPiecesBySku([
  { sku: "COL-1", name: "Colchón", unit: 1 },
  { sku: "COL-1", name: "Colchón", unit: 2 },
  { sku: "PAN-1", name: "Pantalla", unit: 1 },
]);
assert.equal(groups.length, 2);
assert.equal(groups[0].pieces.length, 2);
assert.equal(groups[1].pieces.length, 1);
assert.equal(
  discountRequestPiecesReady([{ reason: "LAST_UNIT" }, { reason: "" }]),
  false,
);
assert.equal(
  discountRequestPiecesReady([
    { reason: "LAST_UNIT" },
    { reason: "DAMAGED_ITEM" },
  ]),
  true,
);

console.log("discountRequest.test.ts: ok");
