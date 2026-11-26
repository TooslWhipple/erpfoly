import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSellerPeriodOptions,
  periodCardLabel,
  splitDailyProgress,
  toPeriodValue,
} from "./sellerPeriods";

const NOW = new Date(2026, 10, 21); // 21 de noviembre de 2026

describe("buildSellerPeriodOptions", () => {
  it("lista del mes actual hacia atrás hasta el alta del vendedor", () => {
    const options = buildSellerPeriodOptions(new Date(2026, 7, 15), NOW);

    assert.deepEqual(
      options.map((o) => o.value),
      ["2026-11", "2026-10", "2026-09", "2026-08"],
    );
    assert.equal(options[0].label, "Mes actual (Noviembre)");
    assert.equal(options[1].label, "Octubre 2026");
  });

  it("cruza de año", () => {
    const options = buildSellerPeriodOptions(new Date(2025, 11, 1), NOW);

    assert.equal(options.at(-1)?.value, "2025-12");
    assert.equal(options.at(-1)?.label, "Diciembre 2025");
    assert.equal(options.length, 12);
  });

  it("sin fecha de alta válida solo ofrece el mes actual", () => {
    assert.deepEqual(
      buildSellerPeriodOptions(null, NOW).map((o) => o.value),
      ["2026-11"],
    );
    assert.deepEqual(
      buildSellerPeriodOptions("no-es-fecha", NOW).map((o) => o.value),
      ["2026-11"],
    );
  });

  it("un alta en el futuro no deja la lista vacía", () => {
    assert.deepEqual(
      buildSellerPeriodOptions(new Date(2027, 0, 1), NOW).map((o) => o.value),
      ["2026-11"],
    );
  });
});

describe("toPeriodValue", () => {
  it("rellena el mes con cero", () => {
    assert.equal(toPeriodValue({ year: 2026, month: 3 }), "2026-03");
  });
});

describe("periodCardLabel", () => {
  it("usa 'Este mes' en el mes actual y el nombre del mes en el histórico", () => {
    assert.equal(
      periodCardLabel({ year: 2026, month: 11, label: "Noviembre", isCurrent: true }),
      "Este mes",
    );
    assert.equal(
      periodCardLabel({ year: 2026, month: 9, label: "Septiembre", isCurrent: false }),
      "Septiembre 2026",
    );
  });
});

describe("splitDailyProgress", () => {
  it("separa una serie por tarjeta y conserva los días por venir en null", () => {
    const series = splitDailyProgress([
      { day: 1, sales: 0, approvedCredits: 0, newCreditsAmount: 0 },
      { day: 2, sales: 4700, approvedCredits: 1, newCreditsAmount: 20000 },
      { day: 3, sales: null, approvedCredits: null, newCreditsAmount: null },
    ]);

    assert.deepEqual(series.sales, [0, 4700, null]);
    assert.deepEqual(series.approvedCredits, [0, 1, null]);
    assert.deepEqual(series.newCreditsAmount, [0, 20000, null]);
  });
});
