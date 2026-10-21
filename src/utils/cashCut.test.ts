/**
 * Final-cut shortage: numeric coercion and currency format.
 * Run: npx --yes tsx src/utils/cashCut.test.ts
 */
import assert from "node:assert/strict";
import { buildCashCutSummary, formatCashAmount, toAmount } from "./cashCut";

assert.equal(toAmount(null), 0);
assert.equal(toAmount(undefined), 0);
assert.equal(toAmount(""), 0);
assert.equal(toAmount("12.50"), 12.5);
assert.equal(toAmount("nope"), 0);

const balanced = buildCashCutSummary({
  initialFund: "1500.00",
  currentCash: "1600.00",
  movements: [
    { movement_type: "SALE", payment_form: "CASH", amount: "200.00" },
    { movement_type: "PAYMENT", payment_form: "CREDIT_CARD", amount: null },
    { movement_type: "PAYMENT", payment_form: "CASH_DEPOSIT", amount: "" },
    { movement_type: "WITHDRAWAL", payment_form: "CASH", amount: "100.00" },
  ],
});

assert.equal(balanced.cash, 200);
assert.equal(balanced.creditCard, 0);
assert.equal(balanced.cashDeposits, 0);
assert.equal(balanced.withdrawalAmount, 100);
assert.equal(balanced.shortage, 0);
assert.equal(Number.isFinite(balanced.shortage), true);
assert.equal(formatCashAmount(balanced.shortage), "$0.00");

const missingAmount = buildCashCutSummary({
  initialFund: 100,
  currentCash: 100,
  movements: [{ movement_type: "SALE", payment_form: "CASH" }],
});

assert.equal(missingAmount.cash, 0);
assert.equal(missingAmount.shortage, 0);
assert.equal(formatCashAmount(missingAmount.shortage), "$0.00");

const short = buildCashCutSummary({
  initialFund: 1000,
  currentCash: 900,
  movements: [
    { movement_type: "SALE", payment_form: "CASH", amount: 50 },
    { movement_type: "PAYMENT", payment_form: "CREDIT_CARD", amount: "25.50" },
    { movement_type: "PARTIAL_CUT", payment_form: "CASH", amount: undefined },
  ],
});

assert.equal(short.cash, 50);
assert.equal(short.creditCard, 25.5);
assert.equal(short.totalIncome, 75.5);
assert.equal(short.shortage, 150);
assert.equal(formatCashAmount(short.shortage), "$150.00");

const surplus = buildCashCutSummary({
  initialFund: 100,
  currentCash: 150,
  movements: [],
});

assert.equal(surplus.shortage, -50);
assert.equal(formatCashAmount(surplus.shortage), "-$50.00");

console.log("cashCut.test.ts: ok");
