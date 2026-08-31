const INVENTORY_REF_TYPE_LABELS: Record<string, string> = {
  sale: "Venta",
  layaway: "Apartado",
  costeo: "Costeo",
  order_delivery: "Entrega de pedido",
  order_transfer: "Traspaso entre sucursales",
  order_purchase: "Pedido de compra",
  merchandise_reception: "Recepción de mercancía",
  damaged_product: "Producto dañado",
  manual_adjustment: "Ajuste manual",
};

const TECHNICAL_NOTES_RE =
  /^\[refType\s*=\s*([^\s\]]+)\s+refId\s*=\s*(\d+)\](?:\s+(.*))?$/;
const TECHNICAL_NOTES_RELAXED_RE =
  /\[refType\s*=\s*([^\s\]]+)\s+refId\s*=\s*(\d+)\](?:\s+(.*))?/;

type ParsedTechnicalNotes = {
  refType: string;
  refId: number;
  userNotes?: string;
};

function looksLikeTechnicalNotes(notes: string): boolean {
  return TECHNICAL_NOTES_RELAXED_RE.test(notes.trim());
}

function parseTechnicalNotes(notes: string): ParsedTechnicalNotes | null {
  const trimmed = notes.trim();
  const match =
    trimmed.match(TECHNICAL_NOTES_RE) ?? trimmed.match(TECHNICAL_NOTES_RELAXED_RE);
  if (!match) {
    return null;
  }

  return {
    refType: match[1],
    refId: Number(match[2]),
    userNotes: match[3]?.trim() || undefined,
  };
}

function buildRefContext(parsed: ParsedTechnicalNotes): string {
  const label = INVENTORY_REF_TYPE_LABELS[parsed.refType] ?? parsed.refType;
  return ` — ${label} #${parsed.refId}`;
}

/**
 * Formats raw inventory activity descriptions that still contain technical
 * `[refType=... refId=...]` notes. Already-formatted descriptions pass through.
 */
export function formatInventoryActivityDescription(description: string): string {
  const trimmed = description?.trim();
  if (!trimmed || !looksLikeTechnicalNotes(trimmed)) {
    return description;
  }

  const parsed = parseTechnicalNotes(trimmed);
  if (!parsed) {
    return description;
  }

  const refPart = buildRefContext(parsed);
  const userNotes = parsed.userNotes ? ` — ${parsed.userNotes}` : "";
  return `Movimiento de inventario${refPart}${userNotes}`;
}
