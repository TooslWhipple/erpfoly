import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DISCONTINUED_CHIP_LABEL,
  saleLifecycleChipLabel,
} from "./product-end-of-life";

describe("saleLifecycleChipLabel", () => {
  it("un artículo descontinuado lleva el chip de liquidación", () => {
    assert.equal(
      saleLifecycleChipLabel({ isDiscontinued: true }),
      DISCONTINUED_CHIP_LABEL,
    );
  });

  it("un artículo reactivado ya no muestra liquidación (FOLY-274)", () => {
    assert.equal(saleLifecycleChipLabel({ isDiscontinued: false }), null);
    assert.equal(saleLifecycleChipLabel({}), null);
  });
});
