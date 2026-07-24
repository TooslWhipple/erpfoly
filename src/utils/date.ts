import type { Dayjs } from "dayjs";
import dayjs from "@/lib/dayjs";

export type DateInput = string | number | Date | Dayjs | null | undefined | unknown;

const DEFAULT_FALLBACK = "—";

/**
 * Presets de formato (tokens dayjs con locale `es-mx` en `@/lib/dayjs`).
 * Al autocompletar verás la descripción de cada opción.
 */
export type DateFormatPreset =
  /** Fecha y hora legible (24h). Ej.: `8 de abril de 2026 14:30` */
  | "localized"
  /** Igual que `localized` con am/pm. Ej.: `8 de abril de 2026 2:30 pm` */
  | "localized12h"
  /** Con día de la semana (24h). Ej.: `miércoles, 8 de abril de 2026 14:30` */
  | "localizedWithWeekday"
  /** Igual con am/pm. Ej.: `miércoles, 8 de abril de 2026 2:30 pm` */
  | "localizedWithWeekday12h"
  /** Solo fecha numérica. Ej.: `08/04/2026` */
  | "dateNumeric"
  /** Solo fecha extendida. Ej.: `8 de abril de 2026` */
  | "dateLong"
  /** Día y mes con hora 12h. Ej.: `2 de junio 12:35 pm` */
  | "dateMonthTime12h"
  /** Solo hora 24h. Ej.: `14:30` */
  | "time"
  /** Solo hora 12h con am/pm. Ej.: `2:30 pm` */
  | "time12h"
  /** Fecha + hora numéricas (24h). Ej.: `08/04/2026 14:30` */
  | "datetimeNumeric"
  /** Fecha numérica + hora 12h. Ej.: `08/04/2026 2:30 pm` */
  | "datetimeNumeric12h"
  /** Fecha + hora compactas (24h). Ej.: `8 abr 2026, 14:30` */
  | "datetimeShort"
  /** Compacto con am/pm. Ej.: `8 abr 2026, 2:30 pm` */
  | "datetimeShort12h"
  /** Fecha numérica compacta + hora 12h. Ej.: `05/06/26 12:35pm` */
  | "listCompactDateTime12h"
  /** Fecha ISO. Ej.: `2026-04-08` */
  | "isoDate"
  /** Fecha y hora ISO (24h). Ej.: `2026-04-08 14:30:00` */
  | "isoDatetime"
  /** ISO con hora 12h y am/pm. Ej.: `2026-04-08 2:30:00 pm` */
  | "isoDatetime12h";

/** Mapa preset → patrón dayjs (mantener alineado con {@link DateFormatPreset}). */
export const dateFormatPresets: Record<DateFormatPreset, string> = {
  localized: "LLL",
  localized12h: "D [de] MMMM [de] YYYY h:mm a",
  localizedWithWeekday: "LLLL",
  localizedWithWeekday12h: "dddd, D [de] MMMM [de] YYYY h:mm a",
  dateNumeric: "L",
  dateLong: "LL",
  dateMonthTime12h: "D [de] MMMM h:mm a",
  time: "LT",
  time12h: "h:mm a",
  datetimeNumeric: "L LT",
  datetimeNumeric12h: "L h:mm a",
  datetimeShort: "D MMM YYYY, H:mm",
  datetimeShort12h: "D MMM YYYY, h:mm a",
  listCompactDateTime12h: "DD/MM/YY h:mma",
  isoDate: "YYYY-MM-DD",
  isoDatetime: "YYYY-MM-DD HH:mm:ss",
  isoDatetime12h: "YYYY-MM-DD h:mm:ss a",
};

/**
 * Preset con documentación en IDE, o patrón dayjs libre (cualquier string).
 * `string & {}` evita que `string` absorba los literales y así conservas autocompletado de presets.
 */
export type DateFormatArg = DateFormatPreset | (string & {});

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toDayjs(value: DateInput): Dayjs | null {
  if (value == null || value === "") {
    return null;
  }
  if (dayjs.isDayjs(value)) {
    return value.isValid() ? value : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (DATE_ONLY_PATTERN.test(trimmed)) {
      const dateOnly = dayjs(trimmed, "YYYY-MM-DD", true);
      return dateOnly.isValid() ? dateOnly : null;
    }
  }
  if (value instanceof Date || typeof value === "number" || typeof value === "string") {
    const d = dayjs(value as string | number | Date);
    return d.isValid() ? d : null;
  }
  return null;
}

function capitalizeWord(s: string): string {
  if (!s) {
    return s;
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function isPreset(format: string): format is DateFormatPreset {
  return format in dateFormatPresets;
}

function resolvePattern(format: DateFormatArg): string {
  return isPreset(format) ? dateFormatPresets[format] : format;
}

export type FormatDateOptions = {
  /** Valor si la fecha no es válida o viene vacía (por defecto "—"). */
  fallback?: string;
};

/**
 * Formatea una fecha con un **preset** (autocompletado con ejemplo en la descripción) o un **patrón dayjs** personalizado.
 *
 * @param value - ISO, `Date`, timestamp, etc.
 * @param format - Elige un preset (`"localized"`, `"isoDate"`, …) o escribe un patrón dayjs entre comillas.
 *
 * @example Preset
 * ```ts
 * formatDate(createdAt, "localized");
 * ```
 *
 * @example Patrón personalizado (corchetes escapan texto literal en dayjs)
 * ```ts
 * formatDate(createdAt, "dddd DD/MM/YYYY[,] HH:mm");
 * formatDate(createdAt, "dddd DD/MM/YYYY[,] h:mm a"); // 12 h con am/pm
 * ```
 */
export function formatDate(
  value: DateInput,
  format: DateFormatArg,
  options?: FormatDateOptions,
): string {
  const fallback = options?.fallback ?? DEFAULT_FALLBACK;
  const d = toDayjs(value);
  if (!d) {
    return fallback;
  }
  return d.format(resolvePattern(format));
}

/**
 * ISO de solicitud / API: preset `localized`; si no parsea, devuelve el string original.
 */
export function formatRequestedAt(iso: string): string {
  const d = toDayjs(iso);
  return d ? d.format(dateFormatPresets.localized) : iso;
}

/**
 * Formatea un valor de fecha que representa **solo día** (sin hora) recibido del
 * backend como `Date` ISO. La fecha se interpreta en UTC para evitar el
 * desplazamiento de un día en husos horarios negativos (p. ej. México UTC-6).
 *
 * Usar con campos como `route_date`, `scheduled_date`, `order_date`,
 * `delivery_date`, `birthDate`, `expires_at`, etc.
 *
 * @example
 * ```ts
 * // El backend envía "2026-07-06T00:00:00.000Z" (medianoche UTC).
 * formatDateOnly("2026-07-06T00:00:00.000Z", "D [de] MMM");
 * // → "6 de jul" (no "5 de jul") en México
 * ```
 */
export function formatDateOnly(
  value: DateInput,
  format: DateFormatArg,
  options?: FormatDateOptions,
): string {
  const fallback = options?.fallback ?? DEFAULT_FALLBACK;
  if (value == null || value === "") return fallback;
  const d = dayjs.utc(value as string | number | Date);
  if (!d.isValid()) return fallback;
  return d.format(resolvePattern(format));
}

/**
 * Normaliza una fecha de calendario (sin hora) a `YYYY-MM-DD` para inputs.
 * Timestamps ISO del API se leen en UTC para no correr el día en México.
 * Devuelve `""` si el valor es vacío o inválido.
 */
export function toDateOnlyString(value: DateInput): string {
  if (value == null || value === "") return "";
  if (dayjs.isDayjs(value)) {
    return value.isValid() ? value.format("YYYY-MM-DD") : "";
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (DATE_ONLY_PATTERN.test(trimmed)) {
      const dateOnly = dayjs(trimmed, "YYYY-MM-DD", true);
      return dateOnly.isValid() ? trimmed : "";
    }
  }
  const utc = dayjs.utc(value as string | number | Date);
  return utc.isValid() ? utc.format("YYYY-MM-DD") : "";
}

/**
 * "Lunes 19 de feb. 12:30 pm" (compatibilidad con el formato previo de esta utilidad).
 */
export function formatDateTime(dateStr: DateInput): string {
  const d = toDayjs(dateStr);
  if (!d) {
    return DEFAULT_FALLBACK;
  }
  return `${capitalizeWord(d.format("dddd"))} ${d.format("D [de]")} ${capitalizeWord(d.format("MMM"))}. ${d.format("h:mm a")}`;
}

/**
 * "19 Feb, 2025 12:30 pm" (compatibilidad con el formato previo).
 */
export function formatDateTimeShort(
  isoString: DateInput,
  fallback = DEFAULT_FALLBACK,
): string {
  const d = toDayjs(isoString);
  if (!d) {
    return fallback;
  }
  return `${d.format("D")} ${capitalizeWord(d.format("MMM"))}, ${d.format("YYYY h:mm a")}`;
}

/** Compact list format: `05/06/26 12:35pm` */
export function formatListDateTime(dateStr: DateInput): string {
  return formatDate(dateStr, "listCompactDateTime12h");
}
