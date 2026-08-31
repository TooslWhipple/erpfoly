/**
 * Inventory activity description fallback formatter.
 * Run: npx --yes tsx src/utils/inventory-activity-description.test.ts
 */
import assert from "node:assert/strict";
import { formatInventoryActivityDescription } from "./inventory-activity-description";

assert.equal(
  formatInventoryActivityDescription("[refType=sale refId=43]"),
  "Movimiento de inventario — Venta #43",
);

assert.equal(
  formatInventoryActivityDescription(
    "[refType=sale refId=43] Cancelación parcial",
  ),
  "Movimiento de inventario — Venta #43 — Cancelación parcial",
);

assert.equal(
  formatInventoryActivityDescription(
    "Movimiento de inventario (venta): -2 unidades (10 → 8) — Venta (folio V-043)",
  ),
  "Movimiento de inventario (venta): -2 unidades (10 → 8) — Venta (folio V-043)",
);

assert.equal(
  formatInventoryActivityDescription("Conteo físico trimestral"),
  "Conteo físico trimestral",
);

console.log("inventory-activity-description.test.ts: ok");
