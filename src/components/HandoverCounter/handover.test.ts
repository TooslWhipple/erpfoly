import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  activeAuthorizationFor,
  applyCode,
  blockReasonLabel,
  handoverNotice,
  incomingTransferLine,
  buildConfirmRequest,
  canChangeDeliveryBranch,
  canConfirm,
  canProcess,
  pendingUnits,
  formatDeliveredAt,
  identityOtpTimerId,
  receiverStepKey,
  parseSaleQr,
  type ConfirmInput,
} from "./handover";
import type {
  BlockReason,
  HandoverLine,
  HandoverSaleDetail,
  IncomingTransfer,
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
    deliveryBranch: { id: 3, name: "Centro" },
    canEdit: true,
    client: { id: 1, name: "Ana", phoneMasked: "******1234" },
    receiver: { type: "HOLDER", thirdPartyName: null, thirdPartyPhoneMasked: null },
    handoverStatus: "PENDING",
    hold: null,
    blockReason: null,
    incomingTransfers: [],
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
    receiverDirty: false,
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

  it("exige receptor guardado y firma", () => {
    assert.equal(canConfirm(input({ receiverDirty: true })), false);
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

describe("receiverStepKey", () => {
  it("distingue titular, tercero y cambio de tercero", () => {
    const holder = receiverStepKey({ type: "HOLDER", thirdPartyName: null, thirdPartyPhoneMasked: null });
    const a = receiverStepKey({ type: "THIRD_PARTY", thirdPartyName: "María", thirdPartyPhoneMasked: "******5678" });
    const b = receiverStepKey({ type: "THIRD_PARTY", thirdPartyName: "María", thirdPartyPhoneMasked: "******9999" });
    assert.notEqual(holder, a);
    assert.notEqual(a, b);
  });
});

describe("identityOtpTimerId", () => {
  it("es estable por venta", () => {
    assert.equal(identityOtpTimerId(7), "sale-handover:identity-otp:7");
  });
});

describe("formatDeliveredAt", () => {
  it("muestra el instante UTC en hora de Ciudad de México", () => {
    // 03:30 UTC del 5 de noviembre = 21:30 del 4 de noviembre en México.
    const text = formatDeliveredAt("2026-11-05T03:30:00.000Z");
    assert.match(text, /4/);
    assert.match(text, /9:30/);
  });

  it("devuelve guion si no hay fecha válida", () => {
    assert.equal(formatDeliveredAt(null), "—");
    assert.equal(formatDeliveredAt("no-es-fecha"), "—");
  });
});

describe("canProcess", () => {
  it("exige alcance de escritura y permiso", () => {
    assert.equal(canProcess({ canEdit: true }, true), true);
    assert.equal(canProcess({ canEdit: true }, false), false);
    assert.equal(canProcess({ canEdit: false }, true), false);
    assert.equal(canProcess({ canEdit: false }, false), false);
  });
});

describe("cambio de ubicación de entrega", () => {
  const base = { lines };
  it("pendingUnits resta entregadas y regularizadas", () => {
    assert.equal(pendingUnits(base), 4);
    assert.equal(
      pendingUnits({ lines: [{ ...lines[0], delivered: 2, released: 1 }, { ...lines[1], delivered: 1 }] }),
      0,
    );
  });
  it("exige permiso y piezas pendientes, no canEdit", () => {
    assert.equal(canChangeDeliveryBranch(base, true), true);
    assert.equal(canChangeDeliveryBranch(base, false), false);
    assert.equal(
      canChangeDeliveryBranch({ lines: [{ ...lines[1], delivered: 1 }] }, true),
      false,
    );
  });
});

describe("handoverNotice / incomingTransferLine", () => {
  const label = (s: string) => (s === "pending" ? "Solicitado" : s);
  const transfer: IncomingTransfer = {
    orderId: 59,
    folio: "TV-V520261101-2673-3",
    originBranch: { id: 3, name: "FOLY AV. MONTERREY" },
    status: "pending",
  };

  it("pinta origen, folio y estado", () => {
    assert.equal(
      incomingTransferLine(transfer, label),
      "En traspaso desde FOLY AV. MONTERREY · TV-V520261101-2673-3 · Solicitado",
    );
  });

  it("NOTHING_READY con traspasos sustituye el aviso", () => {
    const n = handoverNotice("NOTHING_READY", [transfer], label);
    assert.equal(n.warning, null);
    assert.equal(n.transferLines.length, 1);
  });

  it("NOTHING_READY sin traspasos conserva el aviso", () => {
    const n = handoverNotice("NOTHING_READY", [], label);
    assert.equal(n.warning, blockReasonLabel("NOTHING_READY"));
    assert.deepEqual(n.transferLines, []);
  });

  it("entrega parcial (sin bloqueo) muestra el traspaso como información", () => {
    const n = handoverNotice(null, [transfer, { ...transfer, orderId: 60 }], label);
    assert.equal(n.warning, null);
    assert.equal(n.transferLines.length, 2);
  });

  it("otro bloqueo conserva su aviso y no muestra traspasos", () => {
    const n = handoverNotice("NOT_PAID", [transfer], label);
    assert.equal(n.warning, blockReasonLabel("NOT_PAID"));
    assert.deepEqual(n.transferLines, []);
  });

  it("sin bloqueo ni traspasos no hay nada que mostrar", () => {
    assert.deepEqual(handoverNotice(null, [], label), {
      warning: null,
      transferLines: [],
    });
  });
});
