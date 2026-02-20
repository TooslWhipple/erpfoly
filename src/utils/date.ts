const DAY_NAMES_ES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const SHORT_MONTHS_ES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

/**
 * Formats an ISO date string for display: "Lunes 19 de Feb. 12:30 pm".
 * Returns "—" for invalid or empty input.
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (dateStr == null || dateStr === "") return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "—";

  const dayName = DAY_NAMES_ES[date.getDay()];
  const day = date.getDate().toString().padStart(2, "0");
  const month = SHORT_MONTHS_ES[date.getMonth()];
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  const hour12 = hours % 12 || 12;

  return `${dayName} ${day} de ${month}. ${hour12}:${minutes} ${ampm}`;
}

/**
 * Short format: "19 Feb, 2025 12:30 pm". For invalid/empty returns the original string or "—".
 */
export function formatDateTimeShort(
  isoString: string | null | undefined,
  fallback = "—",
): string {
  if (isoString == null || isoString === "") return fallback;
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return fallback;

  const day = d.getDate();
  const month = SHORT_MONTHS_ES[d.getMonth()];
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  const h = hours % 12 || 12;
  const min = minutes < 10 ? `0${minutes}` : minutes;
  return `${day} ${month}, ${year} ${h}:${min} ${ampm}`;
}
