import assert from "node:assert/strict";
import test from "node:test";
import { creditMinimumDownPayment } from "./number";

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
