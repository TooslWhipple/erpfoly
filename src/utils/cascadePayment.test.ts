import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type {
  ClientCreditAccount,
  PendingInstallment,
} from "../types/clientPayment.types";
import {
  calculateAmountForInstallmentCount,
  getTotalCollectableAmount,
} from "./cascadePayment";

function installment(
  overrides: Partial<PendingInstallment> & Pick<PendingInstallment, "id">,
): PendingInstallment {
  return {
    installmentNumber: 1,
    totalInstallments: 3,
    dueDate: "1 de ene",
    dueDateRaw: "2026-01-01",
    overdueAmount: 0,
    totalAmount: 100,
    ...overrides,
  };
}

function account(
  overrides: Partial<ClientCreditAccount> & Pick<ClientCreditAccount, "id">,
): ClientCreditAccount {
  return {
    productName: "Producto",
    purchaseDate: "2026-01-01",
    purchaseDateLabel: "1 de enero, 2026",
    initialCost: 300,
    totalPaid: 0,
    remaining: 100,
    paymentDueDate: "1 de ene",
    highlightPaymentDueDate: true,
    nextPaymentAmount: 100,
    nextPaymentOverdue: 0,
    paidInstallments: 0,
    totalInstallments: 1,
    pendingInstallments: [],
    ...overrides,
  };
}

describe("calculateAmountForInstallmentCount", () => {
  it("suma una sola parcialidad sin mora", () => {
    const accounts = [
      account({
        id: "1",
        remaining: 100,
        pendingInstallments: [installment({ id: "a", totalAmount: 100 })],
      }),
    ];

    assert.equal(calculateAmountForInstallmentCount(accounts, [], 1), 100);
  });

  it("suma varias parcialidades cruzando créditos por fecha de vencimiento", () => {
    const accounts = [
      account({
        id: "newer",
        remaining: 80,
        pendingInstallments: [
          installment({
            id: "late",
            totalAmount: 80,
            dueDateRaw: "2026-03-01",
          }),
        ],
      }),
      account({
        id: "older",
        remaining: 50,
        pendingInstallments: [
          installment({
            id: "early",
            totalAmount: 50,
            dueDateRaw: "2026-01-15",
          }),
        ],
      }),
    ];

    assert.equal(calculateAmountForInstallmentCount(accounts, [], 1), 50);
    assert.equal(calculateAmountForInstallmentCount(accounts, [], 2), 130);
  });

  it("incluye la mora y no la recorta contra el saldo de capital", () => {
    const accounts = [
      account({
        id: "1",
        remaining: 100,
        pendingInstallments: [
          installment({ id: "a", totalAmount: 100, overdueAmount: 5.5 }),
        ],
      }),
    ];

    assert.equal(getTotalCollectableAmount(accounts, []), 105.5);
    assert.equal(calculateAmountForInstallmentCount(accounts, [], 1), 105.5);
  });

  it("acota centavos de más del reparto de parcialidades sin perder la mora", () => {
    const accounts = [
      account({
        id: "1",
        remaining: 100,
        pendingInstallments: [
          installment({
            id: "a",
            totalAmount: 50.02,
            overdueAmount: 1,
            dueDateRaw: "2026-01-01",
          }),
          installment({
            id: "b",
            totalAmount: 50.02,
            overdueAmount: 0,
            dueDateRaw: "2026-02-01",
          }),
        ],
      }),
    ];

    assert.equal(calculateAmountForInstallmentCount(accounts, [], 2), 101);
  });

  it("redondea residuos de punto flotante a centavos", () => {
    const accounts = [
      account({
        id: "1",
        remaining: 1076.45,
        pendingInstallments: [
          installment({ id: "a", totalAmount: 358.815, dueDateRaw: "2026-01-01" }),
          installment({ id: "b", totalAmount: 358.815, dueDateRaw: "2026-02-01" }),
          installment({ id: "c", totalAmount: 358.815, dueDateRaw: "2026-03-01" }),
        ],
      }),
    ];

    assert.equal(calculateAmountForInstallmentCount(accounts, [], 3), 1076.45);
  });
});
