import assert from "node:assert/strict";
import test from "node:test";
import { creditMinimumDownPayment, formatPercent } from "./number";

test("creditMinimumDownPayment redondea hacia arriba en centavos enteros", () => {
  assert.equal(creditMinimumDownPayment(67992), 6799.2);
  assert.equal(creditMinimumDownPayment(12599), 1259.9);
  assert.equal(creditMinimumDownPayment(6999), 699.9);
  assert.equal(creditMinimumDownPayment(10.04), 1.01);
  assert.equal(creditMinimumDownPayment(10), 1);
});

test("creditMinimumDownPayment respeta una tasa distinta", () => {
  assert.equal(creditMinimumDownPayment(1000, 0.25), 250);
  assert.equal(creditMinimumDownPayment(10.01, 0.15), 1.51);
});

test("formatPercent muestra hasta dos decimales sin ceros de más", () => {
  assert.equal(formatPercent(2.35), "2.35%");
  assert.equal(formatPercent(33.3), "33.3%");
  assert.equal(formatPercent(50), "50%");
  assert.equal(formatPercent(0), "0%");
});
