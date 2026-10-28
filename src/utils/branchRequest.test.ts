import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getBranchOrderStatusLabel,
  getBranchOrderStatusVariant,
  getTransferListFilters,
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
  it("draft se muestra como Propuesta", () => {
    assert.equal(mapBranchOrderStatus("draft"), "draft");
    assert.equal(getBranchOrderStatusLabel("draft"), "Propuesta");
  });
});

describe("isBranchOrderEditable", () => {
  it("propuesta y solicitado se editan si no están ligados a una venta", () => {
    assert.equal(isBranchOrderEditable("pending", false), true);
    assert.equal(isBranchOrderEditable("draft", false), true);
    assert.equal(isBranchOrderEditable("pending", true), false);
    assert.equal(isBranchOrderEditable("draft", true), false);
    assert.equal(isBranchOrderEditable("scheduled", false), false);
    assert.equal(isBranchOrderEditable("unknown", false), false);
  });
});

describe("getTransferListFilters", () => {
  it("traduce cada opción del select a los filtros de GET /transfers", () => {
    assert.deepEqual(getTransferListFilters("draft"), { status: "draft" });
    assert.deepEqual(getTransferListFilters("pending"), { status: "pending" });
    assert.deepEqual(getTransferListFilters("to_ship"), { pending_action: "ship" });
    assert.deepEqual(getTransferListFilters("to_receive"), { pending_action: "receive" });
    assert.deepEqual(getTransferListFilters("in_course"), { status: "shipped" });
    assert.deepEqual(getTransferListFilters("delivered"), { status: "delivered" });
    assert.deepEqual(getTransferListFilters("incident"), { has_open_incident: true });
    assert.deepEqual(getTransferListFilters("cancelled"), { status: "cancelled" });
  });
  it("Todos no filtra", () => {
    assert.deepEqual(getTransferListFilters("all"), {});
  });
});
