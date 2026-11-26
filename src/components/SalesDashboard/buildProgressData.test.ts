import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { progressDataFromDailySeries } from "./buildProgressData";

describe("progressDataFromDailySeries", () => {
  it("usa un punto por día del mes, no 16 fijos (QA: D1-D16)", () => {
    const series = Array.from({ length: 31 }, (_, i) => (i < 20 ? 0 : 4700));
    const data = progressDataFromDailySeries(series, 1_500_000);

    assert.equal(data.length, 31);
    assert.deepEqual(data[30], { day: 31, cumulative: 4700, goal: 1_500_000 });
  });

  it("deja en null los días por venir para que la gráfica se corte en hoy", () => {
    const data = progressDataFromDailySeries([10, 25, null], 100);

    assert.deepEqual(
      data.map((point) => point.cumulative),
      [10, 25, null],
    );
  });
});
