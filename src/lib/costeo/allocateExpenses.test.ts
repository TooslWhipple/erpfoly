/**
 * Lightweight assertions for local Costeos preview.
 * Run: npx --yes tsx src/lib/costeo/allocateExpenses.test.ts
 */
import assert from "node:assert/strict";
import {
  allocateArticlesForDisplay,
  allocateExpensesToItems,
  mxnToUsd,
} from "./allocateExpenses";

const articles = [
  {
    id: 1,
    name: "A",
    sku: "A",
    orderNumber: "1",
    netCost: 100,
    netAmount: 200,
    unitCost: 100,
    totalCost: 200,
    quantity: 2,
    received: 2,
    costUsd: 100,
    amountUsd: 200,
    costMxn: 100,
    amountMxn: 200,
    expensesUsd: 0,
    expensesMxn: 0,
    finalUnitCost: 100,
  },
  {
    id: 2,
    name: "B",
    sku: "B",
    orderNumber: "1",
    netCost: 50,
    netAmount: 100,
    unitCost: 50,
    totalCost: 100,
    quantity: 2,
    received: 2,
    costUsd: 50,
    amountUsd: 100,
    costMxn: 50,
    amountMxn: 100,
    expensesUsd: 0,
    expensesMxn: 0,
    finalUnitCost: 50,
  },
];

const expenses = [
  {
    id: 1,
    name: "Flete",
    currency: "MXN" as const,
    exchangeRate: 1,
    amount: 90,
    subtotal: 90,
    vat: 14.4,
    total: 104.4,
    includedInInvoice: false,
  },
];

{
  assert.equal(mxnToUsd(1800, 18), 100);
  assert.equal(mxnToUsd(1800, 0), 0);
}

{
  const result = allocateExpensesToItems({
    items: articles.map((a) => ({
      id: a.id,
      unitCost: a.unitCost,
      totalCost: a.totalCost,
      quantity: a.quantity,
    })),
    totalExpensesMxn: 90,
    affectArticlePrices: false,
  });
  assert.equal(result[0].expensesMxn, 0);
  assert.equal(result[1].expensesMxn, 0);
}

{
  const result = allocateArticlesForDisplay(articles, expenses, true, 18);
  assert.equal(result[0].expensesMxn, 60);
  assert.equal(result[0].expensesUsd, 3.33);
  assert.equal(result[1].expensesMxn, 30);
  assert.equal(result[1].expensesUsd, 1.67);
  assert.equal(result[0].finalUnitCost, 130);
  assert.equal(result[0].costUsd, 5.56);
  assert.equal(result[0].amountUsd, 11.11);
  assert.equal(result[1].costUsd, 2.78);
  assert.equal(result[1].amountUsd, 5.56);
}

{
  const result = allocateArticlesForDisplay(articles, expenses, false, 18);
  assert.equal(result[0].expensesMxn, 0);
  assert.equal(result[0].expensesUsd, 0);
  assert.equal(result[0].costUsd, 5.56);
  assert.equal(result[0].amountUsd, 11.11);
}

console.log("allocateExpenses.test.ts: all assertions passed");
