/** Synthetic cumulative progress for the month (0 → thisMonth over ~15 points). */
export function buildProgressData(
  thisMonth: number,
  goal: number
): Array<{ day: number; cumulative: number; goal: number }> {
  const points = 15;
  const data: Array<{ day: number; cumulative: number; goal: number }> = [];
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const cumulative = Math.round(thisMonth * (1 - Math.pow(1 - t, 1.2)));
    data.push({ day: i + 1, cumulative, goal });
  }
  return data;
}
