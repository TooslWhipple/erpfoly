/**
 * Lógica pura de la entrega en mostrador. La habilitación de "Confirmar" se
 * deriva de estas funciones; no hay máquina de estados.
 * Sin imports `@/` en ejecución para poder correrse con `node --test`.
 */
import type {
  ActiveHandoverAuthorization,
  BlockReason,
  ConfirmHandoverRequest,
  HandoverInputMethod,
  HandoverLine,
  HandoverSaleDetail,
} from "@/types/saleHandover.types";

/** Cantidad capturada por renglón (`saleItemId`). Solo guarda cantidades > 0. */
export type CapturedLines = Readonly<
  Record<number, { quantity: number; inputMethod: HandoverInputMethod }>
>;

export type ApplyCodeResult =
  | { status: "applied"; captured: CapturedLines; saleItemId: number }
  | { status: "unknown_code"; captured: CapturedLines }
  | {
      status: "limit_reached";
      captured: CapturedLines;
      saleItemId: number;
      ready: number;
    };

export const RECEIVER_NAME_MIN_LENGTH = 2;
export const RECEIVER_NAME_MAX_LENGTH = 128;

const SALE_QR_PREFIX = "foly:sale:";

function normalizeCode(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Suma una unidad al renglón cuyo código coincide con el leído. Nunca excede
 * lo `ready` del renglón. No muta `captured`.
 */
export function applyCode(
  lines: readonly HandoverLine[],
  captured: CapturedLines,
  rawCode: string,
  inputMethod: HandoverInputMethod,
): ApplyCodeResult {
  const code = normalizeCode(rawCode);
  const line = code
    ? lines.find((candidate) => normalizeCode(candidate.code) === code)
    : undefined;
  if (!line) return { status: "unknown_code", captured };

  const current = captured[line.saleItemId]?.quantity ?? 0;
  if (current >= line.ready) {
    return {
      status: "limit_reached",
      captured,
      saleItemId: line.saleItemId,
      ready: line.ready,
    };
  }

  return {
    status: "applied",
    saleItemId: line.saleItemId,
    captured: {
      ...captured,
      [line.saleItemId]: {
        quantity: current + 1,
        inputMethod: current === 0 ? inputMethod : captured[line.saleItemId].inputMethod,
      },
    },
  };
}

/** Autorización vigente de la venta para un propósito (rehidratación al recargar). */
export function activeAuthorizationFor(
  detail: HandoverSaleDetail,
  purpose: ActiveHandoverAuthorization["purpose"],
): ActiveHandoverAuthorization | null {
  return (
    detail.activeAuthorizations.find((item) => item.purpose === purpose) ?? null
  );
}

export type ConfirmInput = {
  detail: HandoverSaleDetail;
  captured: CapturedLines;
  receiverName: string;
  signatureFileId: number | null;
  identityAuthorizationId: string | null;
  expiredHoldAuthorizationId: string | null;
};

function capturedUnits(detail: HandoverSaleDetail, captured: CapturedLines): number {
  return detail.lines.reduce(
    (total, line) => total + Math.min(captured[line.saleItemId]?.quantity ?? 0, line.ready),
    0,
  );
}

function hasValidQuantities(
  detail: HandoverSaleDetail,
  captured: CapturedLines,
): boolean {
  const known = new Map(detail.lines.map((line) => [line.saleItemId, line]));
  return Object.entries(captured).every(([id, entry]) => {
    const line = known.get(Number(id));
    return (
      line !== undefined &&
      Number.isInteger(entry.quantity) &&
      entry.quantity >= 0 &&
      entry.quantity <= line.ready
    );
  });
}

export function isReceiverNameValid(name: string): boolean {
  const length = name.trim().length;
  return length >= RECEIVER_NAME_MIN_LENGTH && length <= RECEIVER_NAME_MAX_LENGTH;
}

/** `true` solo si la entrega puede enviarse al backend. */
export function canConfirm(input: ConfirmInput): boolean {
  const { detail } = input;
  if (detail.blockReason !== null) return false;
  if (!hasValidQuantities(detail, input.captured)) return false;
  if (capturedUnits(detail, input.captured) < 1) return false;
  if (!isReceiverNameValid(input.receiverName)) return false;
  if (input.signatureFileId === null) return false;
  if (detail.requiresIdentityAuthorization && !input.identityAuthorizationId) {
    return false;
  }
  if (detail.requiresExpiredHoldAuthorization && !input.expiredHoldAuthorizationId) {
    return false;
  }
  return true;
}

/**
 * Arma el cuerpo de `POST /sale-handovers`. Devuelve `null` si `canConfirm`
 * es falso. Solo incluye las autorizaciones que el detalle exige.
 */
export function buildConfirmRequest(
  input: ConfirmInput & {
    branchId: number;
    idempotencyKey: string;
    ineFrontFileId?: number | null;
    ineBackFileId?: number | null;
  },
): ConfirmHandoverRequest | null {
  if (!canConfirm(input) || input.signatureFileId === null) return null;
  const { detail } = input;

  const lines = detail.lines
    .map((line) => ({ line, entry: input.captured[line.saleItemId] }))
    .filter(({ entry }) => entry !== undefined && entry.quantity > 0)
    .map(({ line, entry }) => ({
      saleItemId: line.saleItemId,
      quantity: entry.quantity,
      inputMethod: entry.inputMethod,
    }));

  return {
    saleId: detail.saleId,
    branchId: input.branchId,
    idempotencyKey: input.idempotencyKey,
    receiverName: input.receiverName.trim(),
    ...(detail.requiresIdentityAuthorization && input.identityAuthorizationId
      ? { identityAuthorizationId: input.identityAuthorizationId }
      : {}),
    ...(detail.requiresExpiredHoldAuthorization && input.expiredHoldAuthorizationId
      ? { expiredHoldAuthorizationId: input.expiredHoldAuthorizationId }
      : {}),
    signatureFileId: input.signatureFileId,
    ...(input.ineFrontFileId ? { ineFrontFileId: input.ineFrontFileId } : {}),
    ...(input.ineBackFileId ? { ineBackFileId: input.ineBackFileId } : {}),
    lines,
  };
}

const BLOCK_REASON_LABELS: Record<BlockReason, string> = {
  NOT_PAID: "La venta aún no está pagada.",
  LAYAWAY_NOT_SETTLED: "El apartado aún no está liquidado.",
  CANCELLED: "La venta está cancelada.",
  NOT_BRANCH_PICKUP: "La venta no es para recoger en sucursal.",
  OTHER_BRANCH: "La venta se entrega en otra sucursal.",
  NOTHING_READY: "Todavía no hay artículos listos para entregar.",
  NOTHING_PENDING: "La venta no tiene artículos pendientes de entregar.",
  HOLD_AUDIT_REVIEW: "El resguardo está en revisión de auditoría.",
};

export function blockReasonLabel(reason: BlockReason): string {
  return BLOCK_REASON_LABELS[reason];
}

/** Extrae el `saleId` de un QR de ticket de venta (`foly:sale:<id>`), o `null`. */
export function parseSaleQr(raw: string): number | null {
  const value = raw.trim();
  if (!value.toLowerCase().startsWith(SALE_QR_PREFIX)) return null;
  const idPart = value.slice(SALE_QR_PREFIX.length);
  if (!/^[1-9]\d*$/.test(idPart)) return null;
  const saleId = Number(idPart);
  return Number.isSafeInteger(saleId) ? saleId : null;
}
