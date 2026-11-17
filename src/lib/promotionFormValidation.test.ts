import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  resolvePromotionAdvanceRate,
  validatePromotionAdvancePercentage,
} from "./promotionFormValidation";

describe("validatePromotionAdvancePercentage", () => {
  it("does not require Anticipo for Apartado (Enganche is the source of truth)", () => {
    assert.equal(validatePromotionAdvancePercentage("APARTADO", ""), undefined);
    assert.equal(validatePromotionAdvancePercentage("APARTADO", "0"), undefined);
    assert.equal(validatePromotionAdvancePercentage("CREDITO", ""), undefined);
    assert.equal(validatePromotionAdvancePercentage(undefined, ""), undefined);
  });
});

describe("resolvePromotionAdvanceRate", () => {
  it("always returns 0 so advance_rate is not used for sale promotions", () => {
    assert.equal(resolvePromotionAdvanceRate("APARTADO", "25"), 0);
    assert.equal(resolvePromotionAdvanceRate("APARTADO", ""), 0);
    assert.equal(resolvePromotionAdvanceRate("CREDITO", "10"), 0);
    assert.equal(resolvePromotionAdvanceRate(undefined, "50"), 0);
  });
});
