/**
 * Run: npx --yes tsx src/utils/layaway.test.ts
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  LAYAWAY_MIN_DEPOSIT_PERCENT,
  layawayBalance,
  layawayMinimumDeposit,
} from "./layaway";

const cases: Array<[number, number, number]> = [
  [7200, 720.0, 6480.0],
  [12599, 1259.9, 11339.1],
  [6999, 699.9, 6299.1],
  [10.04, 1.01, 9.03],
  [0, 0, 0],
];

test("el porcentaje mínimo es 10", () => {
  assert.equal(LAYAWAY_MIN_DEPOSIT_PERCENT, 10);
});

for (const [total, deposit, balance] of cases) {
  test(`enganche y saldo para ${total}`, () => {
    assert.equal(layawayMinimumDeposit(total), deposit);
    assert.equal(layawayBalance(total), balance);
  });
}
