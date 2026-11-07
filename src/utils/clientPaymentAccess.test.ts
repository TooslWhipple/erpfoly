import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getClientPaymentAccessDenial } from "./clientPaymentAccess";

const credit = [{ outstanding_balance: 500 }];
const layaway = [{ totalDue: 7000 }];

describe("getClientPaymentAccessDenial", () => {
  it("niega a un cliente de contado sin apartados", () => {
    assert.equal(
      getClientPaymentAccessDenial({
        creditApplicationId: null,
        status: "active",
        activeCredits: [],
        openLayaways: [],
      }),
      "cash-client",
    );
  });

  it("deja pasar a un cliente de contado con apartado abierto", () => {
    assert.equal(
      getClientPaymentAccessDenial({
        creditApplicationId: null,
        status: "active",
        activeCredits: [],
        openLayaways: layaway,
      }),
      null,
    );
  });

  it("deja pasar a un cliente de crédito sin saldo si tiene apartado", () => {
    assert.equal(
      getClientPaymentAccessDenial({
        creditApplicationId: 10,
        status: "active",
        activeCredits: [{ outstanding_balance: 0 }],
        openLayaways: layaway,
      }),
      null,
    );
  });

  it("sin apartados conserva el comportamiento de crédito", () => {
    assert.equal(
      getClientPaymentAccessDenial({
        creditApplicationId: 10,
        status: "active",
        activeCredits: credit,
      }),
      null,
    );
    assert.equal(
      getClientPaymentAccessDenial({
        creditApplicationId: 10,
        status: "active",
        activeCredits: [{ outstanding_balance: 0 }],
      }),
      "no-payable-credit",
    );
  });

  it("un cliente inactivo se niega aunque tenga apartado", () => {
    assert.equal(
      getClientPaymentAccessDenial({
        creditApplicationId: null,
        status: "inactive",
        activeCredits: [],
        openLayaways: layaway,
      }),
      "inactive",
    );
  });
});
