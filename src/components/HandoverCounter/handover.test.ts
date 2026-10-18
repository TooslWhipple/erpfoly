import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  activeAuthorizationFor,
  applyCode,
  blockReasonLabel,
  buildConfirmRequest,
  canConfirm,
  parseSaleQr,
  type ConfirmInput,
} from "./handover";
import type {
  BlockReason,
  HandoverLine,
  HandoverSaleDetail,
} from "../../types/saleHandover.types";

const lines: HandoverLine[] = [
  { saleItemId: 1, productId: 10, code: "01-ME-371", name: "Mesa", quantity: 3, delivered: 0, released: 0, ready: 2, pendingSupply: 1 },
  { saleItemId: 2, productId: 11, code: "02-SI-100", name: "Silla", quantity: 1, delivered: 0, released: 0, ready: 1, pendingSupply: 0 },
];

function detail(overrides: Partial<HandoverSaleDetail> = {}): HandoverSaleDetail {
  return {
    saleId: 7,
    folio: "A-7",
    branch: { id: 3, name: "Centro" },
    client: { id: 1, name: "Ana", phoneMasked: "******1234" },
    receiver: { type: "HOLDER", thirdPartyName: null, thirdPartyPhoneMasked: null },
    handoverStatus: "PENDING",
    hold: null,
    blockReason: null,
    requiresIdentityAuthorization: false,
    requiresExpiredHoldAuthorization: false,
    activeAuthorizations: [],
    lines,
    ...overrides,
  };
}

function input(overrides: Partial<ConfirmInput> = {}): ConfirmInput {
  return {
    detail: detail(),
    captured: { 1: { quantity: 1, inputMethod: "QR" } },
    receiverName: "Ana Pérez",
    signatureFileId: 55,
    identityAuthorizationId: null,
    expiredHoldAuthorizationId: null,
    ...overrides,
  };
}

describe("applyCode", () => {
  it("suma una unidad al renglón del código, sin importar mayúsculas", () => {
    const result = applyCode(lines, {}, " 01-me-371 ", "BARCODE");
    assert.equal(result.status, "applied");
    assert.deepEqual(result.captured, { 1: { quantity: 1, inputMethod: "BARCODE" } });
  });

  it("conserva el método de captura del primer escaneo", () => {
    const first = applyCode(lines, {}, "01-ME-371", "QR");
    const second = applyCode(lines, first.captured, "01-ME-371", "BARCODE");
    assert.deepEqual(second.captured, { 1: { quantity: 2, inputMethod: "QR" } });
  });

  it("no excede lo listo del renglón", () => {
    const result = applyCode(lines, { 2: { quantity: 1, inputMethod: "QR" } }, "02-SI-100", "QR");
    assert.equal(result.status, "limit_reached");
    assert.deepEqual(result.captured, { 2: { quantity: 1, inputMethod: "QR" } });
  });

  it("ignora códigos que no son de la venta", () => {
    const result = applyCode(lines, {}, "XX-000", "QR");
    assert.equal(result.status, "unknown_code");
  });

  it("no muta el estado de entrada", () => {
    const captured = Object.freeze({});
    assert.doesNotThrow(() => applyCode(lines, captured, "01-ME-371", "QR"));
  });
});

describe("canConfirm", () => {
  it("habilita con cantidad, receptor y firma", () => {
    assert.equal(canConfirm(input()), true);
  });

  it("exige al menos una unidad", () => {
    assert.equal(canConfirm(input({ captured: {} })), false);
  });

  it("rechaza cantidades por encima de lo listo", () => {
    assert.equal(canConfirm(input({ captured: { 1: { quantity: 3, inputMethod: "MANUAL" } } })), false);
  });

  it("exige nombre de 2 a 128 caracteres y firma", () => {
    assert.equal(canConfirm(input({ receiverName: " A " })), false);
    assert.equal(canConfirm(input({ receiverName: "A".repeat(129) })), false);
    assert.equal(canConfirm(input({ signatureFileId: null })), false);
  });

  it("exige autorización de identidad solo si el detalle la pide", () => {
    const needsId = detail({ requiresIdentityAuthorization: true });
    assert.equal(canConfirm(input({ detail: needsId })), false);
    assert.equal(canConfirm(input({ detail: needsId, identityAuthorizationId: "auth-1" })), true);
  });

  it("exige autorización de resguardo vencido solo si el detalle la pide", () => {
    const needsHold = detail({ requiresExpiredHoldAuthorization: true });
    assert.equal(canConfirm(input({ detail: needsHold })), false);
    assert.equal(canConfirm(input({ detail: needsHold, expiredHoldAuthorizationId: "auth-2" })), true);
  });

  it("no habilita una venta bloqueada", () => {
    assert.equal(canConfirm(input({ detail: detail({ blockReason: "NOT_PAID" }) })), false);
  });
});

describe("buildConfirmRequest", () => {
  it("devuelve null si no se puede confirmar", () => {
    assert.equal(
      buildConfirmRequest({ ...input({ captured: {} }), branchId: 3, idempotencyKey: "k" }),
      null,
    );
  });

  it("arma el cuerpo mínimo sin campos opcionales", () => {
    const request = buildConfirmRequest({ ...input(), branchId: 3, idempotencyKey: "k-1" });
    assert.deepEqual(request, {
      saleId: 7,
      branchId: 3,
      idempotencyKey: "k-1",
      receiverName: "Ana Pérez",
      signatureFileId: 55,
      lines: [{ saleItemId: 1, quantity: 1, inputMethod: "QR" }],
    });
  });

  it("incluye autorizaciones e INE solo cuando aplican", () => {
    const request = buildConfirmRequest({
      ...input({
        detail: detail({ requiresIdentityAuthorization: true }),
        identityAuthorizationId: "auth-1",
        expiredHoldAuthorizationId: "auth-2",
        captured: {
          1: { quantity: 2, inputMethod: "MANUAL" },
          2: { quantity: 0, inputMethod: "QR" },
        },
      }),
      branchId: 3,
      idempotencyKey: "k-2",
      ineFrontFileId: 8,
      ineBackFileId: 9,
    });
    assert.deepEqual(request, {
      saleId: 7,
      branchId: 3,
      idempotencyKey: "k-2",
      receiverName: "Ana Pérez",
      identityAuthorizationId: "auth-1",
      signatureFileId: 55,
      ineFrontFileId: 8,
      ineBackFileId: 9,
      lines: [{ saleItemId: 1, quantity: 2, inputMethod: "MANUAL" }],
    });
  });
});

describe("blockReasonLabel", () => {
  it("tiene texto para cada motivo de bloqueo", () => {
    const reasons: BlockReason[] = [
      "NOT_PAID", "LAYAWAY_NOT_SETTLED", "CANCELLED", "NOT_BRANCH_PICKUP",
      "OTHER_BRANCH", "NOTHING_READY", "NOTHING_PENDING", "HOLD_AUDIT_REVIEW",
    ];
    for (const reason of reasons) {
      assert.ok(blockReasonLabel(reason).length > 0, reason);
    }
  });
});

describe("parseSaleQr", () => {
  it("lee el id del QR del ticket", () => {
    assert.equal(parseSaleQr("foly:sale:123"), 123);
    assert.equal(parseSaleQr("  FOLY:SALE:9 "), 9);
  });

  it("rechaza lo que no es un QR de venta", () => {
    assert.equal(parseSaleQr("01-ME-371"), null);
    assert.equal(parseSaleQr("foly:sale:"), null);
    assert.equal(parseSaleQr("foly:sale:0"), null);
    assert.equal(parseSaleQr("foly:sale:12abc"), null);
    assert.equal(parseSaleQr("foly:sale:-3"), null);
  });
});

describe("activeAuthorizationFor", () => {
  const supervisorAuth = {
    authorizationId: "a-1",
    purpose: "IDENTITY" as const,
    method: "SUPERVISOR" as const,
    expiresAt: "2099-01-01T00:00:00.000Z",
    supervisor: { name: "Ana Gerente" },
  };

  it("devuelve la autorización vigente del propósito pedido", () => {
    const d = detail({ activeAuthorizations: [supervisorAuth] });
    assert.deepEqual(activeAuthorizationFor(d, "IDENTITY"), supervisorAuth);
  });

  it("devuelve null si no hay una del propósito", () => {
    assert.equal(activeAuthorizationFor(detail(), "IDENTITY"), null);
    const d = detail({ activeAuthorizations: [supervisorAuth] });
    assert.equal(activeAuthorizationFor(d, "EXPIRED_HOLD"), null);
  });
});
