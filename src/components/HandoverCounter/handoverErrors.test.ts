import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { changeDeliveryBranchErrorMessage } from "./handoverErrors";

describe("changeDeliveryBranchErrorMessage", () => {
  it("explica el rechazo del supervisor", () => {
    assert.match(
      changeDeliveryBranchErrorMessage({ message: "x", errorCode: "SUPERVISOR_REJECTED" }),
      /sucursal que vendió/,
    );
  });
  it("incluye el motivo del bloqueo", () => {
    assert.match(
      changeDeliveryBranchErrorMessage({
        message: "x",
        errorCode: "HANDOVER_BLOCKED",
        data: { blockReason: "HOLD_AUDIT_REVIEW" },
      }),
      /auditoría/,
    );
  });
  it("cae a un mensaje genérico con motivo desconocido", () => {
    assert.match(
      changeDeliveryBranchErrorMessage({
        message: "x",
        errorCode: "HANDOVER_BLOCKED",
        data: { blockReason: "OTRO" },
      }),
      /No se puede cambiar/,
    );
  });
  it("mapea SAME_BRANCH e INVALID_BRANCH", () => {
    assert.match(changeDeliveryBranchErrorMessage({ message: "x", errorCode: "SAME_BRANCH" }), /ya se entrega/);
    assert.match(changeDeliveryBranchErrorMessage({ message: "x", errorCode: "INVALID_BRANCH" }), /no es válida/);
  });
  it("delega el resto al mensaje general", () => {
    assert.equal(
      changeDeliveryBranchErrorMessage({ message: "x", errorCode: "SALE_NOT_FOUND" }),
      "No se encontró la venta.",
    );
  });
});
