import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { TransferAction } from "../types/transfers.types";
import {
  getIncidentButtons,
  getTimelineActionLabel,
  getTransferQuantityFeedback,
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
  it("una propuesta muestra autorizar cuando el backend lo permite", () => {
    const buttons = getTransferButtons(detail("draft", ["authorize", "cancel"]), manager);
    assert.equal(buttons.authorize, true);
    assert.equal(buttons.schedule, false);
    assert.equal(buttons.cancel, true);
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

describe("getTransferQuantityFeedback", () => {
  const cap = (remaining: number | null, minStock = 0, stock = 0, inTransit = 0) => ({
    remaining,
    minStock,
    stock,
    inTransit,
  });
  it("sin límite no marca error", () => {
    assert.equal(getTransferQuantityFeedback(9999, cap(null)), null);
  });
  it("igual al límite pasa", () => {
    assert.equal(getTransferQuantityFeedback(5, cap(5)), null);
  });
  it("sobre el límite da error con el texto exacto", () => {
    assert.deepEqual(getTransferQuantityFeedback(6, cap(5), "FOLY ALTAMIRA"), {
      level: "error",
      message: "Excede el máximo permitido. Capacidad restante en FOLY ALTAMIRA: 5 unidades",
    });
  });
  it("restante 0 bloquea cualquier cantidad", () => {
    assert.equal(getTransferQuantityFeedback(1, cap(0))?.level, "error");
    assert.match(getTransferQuantityFeedback(1, cap(0))?.message ?? "", /: 0 unidades$/);
  });
  it("avisa cuando queda bajo el mínimo", () => {
    assert.equal(getTransferQuantityFeedback(1, cap(5, 4, 1, 1))?.level, "warning");
    assert.equal(getTransferQuantityFeedback(2, cap(5, 4, 1, 1)), null);
  });
  it("sin aviso cuando el mínimo es 0", () => {
    assert.equal(getTransferQuantityFeedback(1, cap(null, 0, 0, 0)), null);
  });
});
