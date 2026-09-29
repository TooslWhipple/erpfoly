/**
 * Saved-quote snapshot for the special-discount request.
 * Run: npx --yes tsx src/utils/saleCartCoverage.test.ts
 */
import assert from "node:assert/strict";
import { quoteCartMatchesSaved } from "./saleCartCoverage";

const saved = [
  { id: 10, quantity: 2 },
  { id: 11, quantity: 1 },
];

assert.equal(
  quoteCartMatchesSaved(
    [
      { saleItemId: 10, quantity: 2 },
      { saleItemId: 11, quantity: 1 },
    ],
    saved,
  ),
  true,
);

assert.equal(
  quoteCartMatchesSaved(
    [
      { saleItemId: 10, quantity: 3 },
      { saleItemId: 11, quantity: 1 },
    ],
    saved,
  ),
  false,
);

assert.equal(
  quoteCartMatchesSaved(
    [
      { saleItemId: 10, quantity: 2 },
      { quantity: 1 },
    ],
    saved,
  ),
  false,
);

assert.equal(
  quoteCartMatchesSaved([{ saleItemId: 10, quantity: 2 }], saved),
  false,
);

console.log("saleCartCoverage.test.ts: ok");
