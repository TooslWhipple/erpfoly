export type ProgressChartPoint = {
  day: number;
  cumulative: number | null;
  goal: number;
};

/**
 * Chart points from the real running total per day of the month. A `null`
 * day (still to come) stays `null` so the area stops at today.
 */
export function progressDataFromDailySeries(
  series: Array<number | null>,
  goal: number,
): ProgressChartPoint[] {
  return series.map((cumulative, index) => ({
    day: index + 1,
    cumulative,
    goal,
  }));
}

/**
 * Synthetic cumulative curve (0 → thisMonth over 16 points) for screens whose
 * endpoint does not send the daily series yet (branch sales tab). It is not
 * real daily data: prefer `progressDataFromDailySeries`.
 */
export function buildProgressData(
  thisMonth: number,
  goal: number,
): ProgressChartPoint[] {
  const points = 15;
  const data: ProgressChartPoint[] = [];
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const cumulative = Math.round(thisMonth * (1 - Math.pow(1 - t, 1.2)));
    data.push({ day: i + 1, cumulative, goal });
  }
  return data;
}
