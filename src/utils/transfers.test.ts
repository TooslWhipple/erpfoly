import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { TransferAction } from "../types/transfers.types";
import {
  getIncidentButtons,
  getTimelineActionLabel,
  getTransferButtons,
  isStaleTransferErrorCode,
  requiresAccountingAccount,
} from "./transfers";

const manager = { canUpdate: true, canRegisterDamage: false };
const reader = { canUpdate: false, canRegisterDamage: false };

function detail(
  status: string,
  allowed: TransferAction[],
  sale: { id: number; folio: string } | null = null,
) {
  return { status, allowed_actions: allowed, sale };
}

describe("getTransferButtons", () => {
  it("muestra solo lo que dice allowed_actions", () => {
    const buttons = getTransferButtons(detail("scheduled", ["ship", "cancel"]), manager);
    assert.equal(buttons.ship, true);
    assert.equal(buttons.cancel, true);
    assert.equal(buttons.receive, false);
    assert.equal(buttons.print, false);
  });
  it("sin traspasos.update no hay ninguna acción", () => {
    const buttons = getTransferButtons(detail("shipped", ["receive", "report_incident"]), reader);
    assert.equal(buttons.receive, false);
    assert.equal(buttons.reportIncident, false);
    assert.equal(buttons.print, true);
  });
  it("ligado sin cancelar: oculta el botón y marca la nota", () => {
    const buttons = getTransferButtons(
      detail("pending", ["schedule"], { id: 9, folio: "V-9" }),
      manager,
    );
    assert.equal(buttons.cancel, false);
    assert.equal(buttons.linkedCancelNote, true);
  });
  it("un normal en pending no lleva la nota", () => {
    assert.equal(getTransferButtons(detail("pending", ["cancel"]), manager).linkedCancelNote, false);
  });
});

describe("getIncidentButtons", () => {
  const originSide = { side: { origin: true, destination: false } };
  const destinationSide = { side: { origin: false, destination: true } };
  const damageViewer = { canUpdate: true, canRegisterDamage: true };
  it("muestra solo lo que dice allowed_actions de la incidencia", () => {
    const buttons = getIncidentButtons(
      { status: "OPEN", allowed_actions: ["correct_shipment", "escalate"] },
      originSide,
      manager,
    );
    assert.equal(buttons.correct, true);
    assert.equal(buttons.escalate, true);
    assert.equal(buttons.withdraw, false);
  });
  it("el destino la retira y, con permiso, registra el daño", () => {
    const buttons = getIncidentButtons(
      { status: "OPEN", allowed_actions: ["withdraw"] },
      destinationSide,
      damageViewer,
    );
    assert.equal(buttons.withdraw, true);
    assert.equal(buttons.registerDamage, true);
    assert.equal(buttons.correct, false);
  });
  it("sin acciones del servidor no hay botones de acción", () => {
    const buttons = getIncidentButtons(
      { status: "IN_REVIEW", allowed_actions: [] },
      originSide,
      manager,
    );
    assert.equal(buttons.correct, false);
    assert.equal(buttons.escalate, false);
    assert.equal(buttons.withdraw, false);
  });
  it("una retirada no registra daño", () => {
    const buttons = getIncidentButtons(
      { status: "CANCELLED", allowed_actions: [] },
      destinationSide,
      damageViewer,
    );
    assert.equal(buttons.registerDamage, false);
  });
});

describe("errores y línea de tiempo", () => {
  it("reconoce los 409 que obligan a refrescar", () => {
    assert.equal(isStaleTransferErrorCode("TRANSFER_STATE_CHANGED"), true);
    assert.equal(isStaleTransferErrorCode("INCIDENT_STATE_CHANGED"), true);
    assert.equal(isStaleTransferErrorCode("INVALID_TRANSFER_TRANSITION"), true);
    assert.equal(isStaleTransferErrorCode("LINKED_TRANSFER"), false);
    assert.equal(isStaleTransferErrorCode(undefined), false);
  });
  it("etiqueta las acciones de AuditLog con o sin prefijo", () => {
    assert.equal(getTimelineActionLabel("transfer.shipped"), "Enviado");
    assert.equal(getTimelineActionLabel("incident_opened"), "Diferencia reportada");
    assert.equal(getTimelineActionLabel("transfer.otra"), "otra");
  });
});

describe("requiresAccountingAccount", () => {
  it("solo la pérdida en tránsito exige cuenta contable", () => {
    assert.equal(requiresAccountingAccount("LOSS_IN_TRANSIT"), true);
    assert.equal(requiresAccountingAccount("FOUND_AT_DESTINATION"), false);
  });
});
