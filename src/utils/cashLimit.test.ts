/**
 * Cash-limit semantic thresholds.
 * Run: npx --yes tsx src/utils/cashLimit.test.ts
 */
import assert from "node:assert/strict";
import { getCashLimitLevel, getCashLimitProgress } from "./cashLimit";

assert.equal(getCashLimitLevel(0, 20000), "safe");
assert.equal(getCashLimitLevel(15000, 20000), "safe");
assert.equal(getCashLimitLevel(15001, 20000), "warning");
assert.equal(getCashLimitLevel(20000, 20000), "warning");
assert.equal(getCashLimitLevel(20001, 20000), "exceeded");
assert.equal(getCashLimitLevel(5000, 0), "safe");
assert.equal(getCashLimitLevel(5000, -1), "safe");

assert.equal(getCashLimitProgress(10000, 20000), 50);
assert.equal(getCashLimitProgress(20000, 20000), 100);
assert.equal(getCashLimitProgress(25000, 20000), 100);
assert.equal(getCashLimitProgress(1000, 0), 0);

console.log("cashLimit.test.ts: ok");
