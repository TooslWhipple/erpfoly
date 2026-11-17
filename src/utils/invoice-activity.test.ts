import assert from "node:assert/strict";
import test from "node:test";
import { recoveryTimelineEvents } from "./invoice-activity";

const order = {
  id: "9",
  folio: "OS-9",
  generatedAt: "2026-11-01T12:00:00.000Z",
  recoverySheetId: "12",
  recoverySheetFolio: "HR-12",
  recoverySheetCreatedAt: "2026-11-02T12:00:00.000Z",
  recoverySheetUpdatedAt: "2026-11-03T12:00:00.000Z",
};

test("una hoja pendiente solo anota que se generó", () => {
  const events = recoveryTimelineEvents({
    ...order,
    recoverySheetStatus: "pendiente",
  });
  assert.deepEqual(
    events.map((event) => event.title),
    ["Hoja de recuperación generada"],
  );
});

test("recuperada agrega el recibo con su fecha", () => {
  const events = recoveryTimelineEvents({
    ...order,
    cancellationRequestedAt: "2026-11-02T15:00:00.000Z",
    recoverySheetStatus: "recuperada",
    recoverySheetReceivedAt: "2026-11-04T12:00:00.000Z",
    recoverySettledAt: "2026-11-04T18:00:00.000Z",
    recoveryCreditAmount: 5399,
  });
  assert.equal(events[0].title, "Recuperación solicitada");
  assert.equal(events[0].date, "2026-11-02T15:00:00.000Z");
  assert.equal(events[1].title, "Artículo recuperado");
  assert.equal(events[1].date, "2026-11-04T18:00:00.000Z");
  assert.equal(events[1].amount, 5399);
  assert.match(events[1].description ?? "", /HR-12/);
});

test("cancelada registra que no se recuperó", () => {
  const events = recoveryTimelineEvents({
    ...order,
    recoverySheetStatus: "cancelada",
  });
  assert.equal(events.at(-1)?.title, "Artículo no recuperado");
  assert.equal(events.at(-1)?.date, "2026-11-03T12:00:00.000Z");
});
