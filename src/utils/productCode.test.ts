/**
 * Scanned product-code normalization.
 * Run: npx --yes tsx src/utils/productCode.test.ts
 */
import assert from "node:assert/strict";
import { normalizeScannedProductCode } from "./productCode";

assert.equal(normalizeScannedProductCode("  01-ME-371  "), "01-ME-371");
assert.equal(normalizeScannedProductCode("7501234567890"), "7501234567890");
assert.equal(
  normalizeScannedProductCode("https://foly.example/products/01-ME-371"),
  "01-ME-371",
);
assert.equal(
  normalizeScannedProductCode("https://foly.example/products/01-ME-371?ref=label"),
  "01-ME-371",
);
assert.equal(
  normalizeScannedProductCode("https://foly.example/abc%2Fdef"),
  "abc/def",
);
assert.equal(normalizeScannedProductCode("https://foly.example/"), "https://foly.example/");
assert.equal(normalizeScannedProductCode("   "), "");
assert.equal(normalizeScannedProductCode("ftp://host/sku"), "ftp://host/sku");

console.log("productCode.test.ts: ok");
