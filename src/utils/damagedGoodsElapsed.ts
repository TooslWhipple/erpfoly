type ElapsedParts = {
  days: number;
  hours: number;
  minutes: number;
  underOneMinute: boolean;
};

function toDate(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getElapsedParts(from: string | Date, now: Date = new Date()): ElapsedParts | null {
  const start = toDate(from);
  if (!start) {
    return null;
  }

  const ms = Math.max(0, now.getTime() - start.getTime());
  if (ms < 60_000) {
    return { days: 0, hours: 0, minutes: 0, underOneMinute: true };
  }

  let totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  totalSec %= 86400;
  const hours = Math.floor(totalSec / 3600);
  totalSec %= 3600;
  const minutes = Math.floor(totalSec / 60);

  return { days, hours, minutes, underOneMinute: false };
}

/** Compact elapsed label for table cells (e.g. "78d 22h", "22h", "26m", "<1m"). */
export function formatElapsedCompact(
  from: string | Date,
  now: Date = new Date(),
): string {
  const parts = getElapsedParts(from, now);
  if (!parts) {
    return "—";
  }
  if (parts.underOneMinute) {
    return "<1m";
  }

  if (parts.days > 0) {
    return parts.hours > 0 ? `${parts.days}d ${parts.hours}h` : `${parts.days}d`;
  }
  if (parts.hours > 0) {
    return `${parts.hours}h`;
  }
  return `${parts.minutes}m`;
}

/** Full Spanish elapsed label for tooltips (matches backend formatElapsedEs). */
export function formatElapsedDetailEs(
  from: string | Date,
  now: Date = new Date(),
): string {
  const parts = getElapsedParts(from, now);
  if (!parts) {
    return "—";
  }
  if (parts.underOneMinute) {
    return "menos de un minuto";
  }

  const labels: string[] = [];
  if (parts.days > 0) {
    labels.push(`${parts.days} día${parts.days !== 1 ? "s" : ""}`);
  }
  if (parts.hours > 0) {
    labels.push(`${parts.hours} hora${parts.hours !== 1 ? "s" : ""}`);
  }
  if (parts.minutes > 0 || labels.length === 0) {
    labels.push(`${parts.minutes} minuto${parts.minutes !== 1 ? "s" : ""}`);
  }
  return labels.join(", ");
}
