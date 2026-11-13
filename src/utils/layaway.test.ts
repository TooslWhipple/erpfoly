/**
 * Run: npx --yes tsx src/utils/layaway.test.ts
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  LAYAWAY_MIN_DEPOSIT_PERCENT,
  layawayBalance,
  layawayDownPaymentError,
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

test("enganche inválido: menor al mínimo o no numérico", () => {
  assert.equal(
    layawayDownPaymentError(7200, 719.99),
    "El enganche no puede ser menor al 10% ($720.00)",
  );
  assert.equal(
    layawayDownPaymentError(14999, 500),
    "El enganche no puede ser menor al 10% ($1,499.90)",
  );
  assert.notEqual(layawayDownPaymentError(7200, Number.NaN), null);
  assert.notEqual(layawayDownPaymentError(7200, null), null);
});

test("enganche válido: del mínimo al total", () => {
  assert.equal(layawayDownPaymentError(7200, 720.0), null);
  assert.equal(layawayDownPaymentError(7200, 7200.0), null);
});

test("el enganche usa el porcentaje que manda el servidor", () => {
  assert.equal(layawayMinimumDeposit(1000, 20), 200);
  assert.equal(
    layawayDownPaymentError(1000, 199.99, 20),
    "El enganche no puede ser menor al 20% ($200.00)",
  );
  assert.equal(layawayDownPaymentError(1000, 250, 20), null);
});

test("enganche inválido: mayor al total", () => {
  assert.equal(
    layawayDownPaymentError(7200, 7200.01),
    "El enganche no puede ser mayor al total de la venta",
  );
});
