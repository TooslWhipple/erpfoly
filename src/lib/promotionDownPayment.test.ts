import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  promotionPercentageError,
  withSingleDownPayment,
} from "./promotionDownPayment";

describe("promotionPercentageError", () => {
  it("allows 0 and rejects empty or negative", () => {
    assert.equal(promotionPercentageError("0"), undefined);
    assert.equal(promotionPercentageError("1"), undefined);
    assert.equal(promotionPercentageError(""), "El porcentaje es requerido");
    assert.equal(
      promotionPercentageError("-1"),
      "El porcentaje no puede ser menor a 0",
    );
  });
});

describe("withSingleDownPayment", () => {
  it("copies the visible percentage onto every customer level", () => {
    assert.deepEqual(
      withSingleDownPayment([
        { customer_level_id: 1, percentage: 10 },
        { customer_level_id: 2, percentage: 0 },
        { customer_level_id: 3, percentage: 25 },
      ]),
      [
        { customer_level_id: 1, percentage: 10 },
        { customer_level_id: 2, percentage: 10 },
        { customer_level_id: 3, percentage: 10 },
      ],
    );
  });
});
