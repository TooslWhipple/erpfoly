import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canExtendHold,
  canReleaseHold,
  formatHoldAmount,
  formatHoldDate,
  holdHistoryActionLabel,
} from "./holds";

describe("canExtendHold", () => {
  it("el gerente solo prorroga vencidos", () => {
    assert.equal(canExtendHold("EXPIRED", "GERENTE", true), true);
    assert.equal(canExtendHold("AUDIT_REVIEW", "GERENTE", true), false);
    assert.equal(canExtendHold("ACTIVE", "GERENTE", true), false);
  });
  it("auditor y admin prorrogan vencidos y auditoría", () => {
    assert.equal(canExtendHold("AUDIT_REVIEW", "AUDITOR", true), true);
    assert.equal(canExtendHold("AUDIT_REVIEW", "ADMINISTRADOR", true), true);
  });
  it("sin permiso de edición nunca", () => {
    assert.equal(canExtendHold("EXPIRED", "AUXILIAR_BODEGA", false), false);
  });
});

describe("canReleaseHold", () => {
  it("el gerente nunca regulariza", () => {
    assert.equal(canReleaseHold("EXPIRED", "GERENTE", true), false);
  });
  it("auditor y admin regularizan vencido y auditoría", () => {
    assert.equal(canReleaseHold("EXPIRED", "AUDITOR", true), true);
    assert.equal(canReleaseHold("AUDIT_REVIEW", "ADMINISTRADOR", true), true);
    assert.equal(canReleaseHold("ACTIVE", "AUDITOR", true), false);
  });
});

describe("presentación", () => {
  it("etiqueta acciones conocidas y deja las desconocidas", () => {
    assert.equal(holdHistoryActionLabel("sale_pickup_hold.extended"), "Resguardo prorrogado");
    assert.equal(holdHistoryActionLabel("otra"), "otra");
  });
  it("formatea montos decimales", () => {
    assert.match(formatHoldAmount("1234.5"), /1,234\.50/);
    assert.equal(formatHoldAmount("n/a"), "n/a");
  });
});

describe("formatHoldDate", () => {
  it("usa la zona de México, no UTC", () => {
    // 03:00 UTC del día 11 sigue siendo el día 10 en México (UTC-6).
    assert.equal(formatHoldDate("2026-07-11T03:00:00.000Z"), "10 jul 2026");
  });

  it("devuelve guion si no hay fecha válida", () => {
    assert.equal(formatHoldDate(null), "—");
    assert.equal(formatHoldDate("no-es-fecha"), "—");
  });
});
