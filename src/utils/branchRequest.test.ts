import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getBranchOrderStatusLabel,
  getBranchOrderStatusVariant,
  getTransferTabFilters,
  isBranchOrderEditable,
  isLegacyBranchOrderStatus,
  mapBranchOrderStatus,
} from "./branchRequest";

describe("mapBranchOrderStatus", () => {
  it("conserva los estados conocidos, incluido shipped", () => {
    assert.equal(mapBranchOrderStatus("shipped"), "shipped");
    assert.equal(mapBranchOrderStatus("delivered"), "delivered");
    assert.equal(mapBranchOrderStatus("in_progress"), "in_progress");
  });
  it("un estado desconocido no cae en pending", () => {
    assert.equal(mapBranchOrderStatus("algo_nuevo"), "unknown");
    assert.equal(mapBranchOrderStatus(""), "unknown");
  });
});

describe("getBranchOrderStatusLabel", () => {
  it("shipped se muestra como En curso, nunca En tránsito", () => {
    assert.equal(getBranchOrderStatusLabel("shipped"), "En curso");
  });
  it("los estados de legado se muestran como Legado: parcial", () => {
    assert.equal(getBranchOrderStatusLabel("partially_delivered"), "Legado: parcial");
    assert.equal(getBranchOrderStatusLabel("in_progress"), "Legado: parcial");
    assert.equal(isLegacyBranchOrderStatus("in_progress"), true);
    assert.equal(isLegacyBranchOrderStatus("shipped"), false);
  });
  it("el desconocido tiene etiqueta y variante propias", () => {
    assert.equal(getBranchOrderStatusLabel("unknown"), "Desconocido");
    assert.equal(getBranchOrderStatusVariant("unknown"), "default");
  });
});

describe("isBranchOrderEditable", () => {
  it("solo lo pendiente y no ligado a una venta", () => {
    assert.equal(isBranchOrderEditable("pending", false), true);
    assert.equal(isBranchOrderEditable("pending", true), false);
    assert.equal(isBranchOrderEditable("scheduled", false), false);
    assert.equal(isBranchOrderEditable("unknown", false), false);
  });
});

describe("getTransferTabFilters", () => {
  it("traduce cada pestaña a los filtros de GET /transfers", () => {
    assert.deepEqual(getTransferTabFilters("to_ship"), { pending_action: "ship" });
    assert.deepEqual(getTransferTabFilters("to_receive"), { pending_action: "receive" });
    assert.deepEqual(getTransferTabFilters("in_course"), { status: "shipped" });
    assert.deepEqual(getTransferTabFilters("delivered"), { status: "delivered" });
    assert.deepEqual(getTransferTabFilters("incident"), { has_open_incident: true });
    assert.deepEqual(getTransferTabFilters("cancelled"), { status: "cancelled" });
  });
  it("Todos no filtra", () => {
    assert.deepEqual(getTransferTabFilters("all"), {});
  });
});
