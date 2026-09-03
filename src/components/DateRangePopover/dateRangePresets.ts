import dayjs, { type Dayjs } from "dayjs";
import type { DateRangeSelectOption } from "./types";

export const PRESET_HOY = "hoy";
export const PRESET_AYER = "ayer";
export const PRESET_SEMANA = "semana";
export const PRESET_MES = "mes";
export const PRESET_PERIODO = "periodo";

export type PresetFechaId =
  | typeof PRESET_HOY
  | typeof PRESET_AYER
  | typeof PRESET_SEMANA
  | typeof PRESET_MES
  | typeof PRESET_PERIODO;

export const OPCIONES_FECHA_PRESET: DateRangeSelectOption[] = [
  { value: PRESET_HOY, label: "Hoy" },
  { value: PRESET_AYER, label: "Ayer" },
  { value: PRESET_SEMANA, label: "Semana actual" },
  { value: PRESET_MES, label: "Mes actual" },
  { value: PRESET_PERIODO, label: "Seleccionar periodo" },
];

function etiquetaPreset(
  id: PresetFechaId,
  options: DateRangeSelectOption[] = OPCIONES_FECHA_PRESET,
): string {
  return options.find((opcion) => opcion.value === id)?.label ?? id;
}

export function labelPeriodoPersonalizado(start: Dayjs, end: Dayjs): string {
  return `${start.format("DD/MM/YYYY")} – ${end.format("DD/MM/YYYY")}`;
}

function todayInZone(timeZone?: string): Dayjs {
  if (!timeZone) return dayjs().startOf("day");
  const ymd = new Date().toLocaleDateString("en-CA", { timeZone });
  return dayjs(ymd).startOf("day");
}

function startOfMonday(day: Dayjs): Dayjs {
  const weekday = day.day();
  const offset = weekday === 0 ? 6 : weekday - 1;
  return day.subtract(offset, "day").startOf("day");
}

export function computePresetRange(
  id: Exclude<PresetFechaId, typeof PRESET_PERIODO>,
  timeZone?: string,
): { startDate: Dayjs; endDate: Dayjs } {
  const hoy = todayInZone(timeZone);

  switch (id) {
    case PRESET_HOY:
      return { startDate: hoy, endDate: hoy };
    case PRESET_AYER: {
      const ayer = hoy.subtract(1, "day");
      return { startDate: ayer, endDate: ayer };
    }
    case PRESET_SEMANA:
      if (timeZone) {
        const start = startOfMonday(hoy);
        return { startDate: start, endDate: start.add(6, "day") };
      }
      return {
        startDate: hoy.startOf("week"),
        endDate: hoy.endOf("week").startOf("day"),
      };
    case PRESET_MES:
      return {
        startDate: hoy.startOf("month"),
        endDate: hoy,
      };
  }
}

function leerDia(valor: unknown): Dayjs | null {
  if (valor == null || valor === "") return null;
  const fecha = dayjs(valor as string | Date);
  return fecha.isValid() ? fecha.startOf("day") : null;
}

export function inferPresetFromDates(
  startValue: unknown,
  endValue: unknown,
  options: DateRangeSelectOption[] = OPCIONES_FECHA_PRESET,
  timeZone?: string,
): DateRangeSelectOption | null {
  const start = leerDia(startValue);
  const end = leerDia(endValue);
  if (!start || !end) return null;

  const allowed = new Set(options.map((opcion) => opcion.value));
  const fijos: Exclude<PresetFechaId, typeof PRESET_PERIODO>[] = [
    PRESET_HOY,
    PRESET_AYER,
    PRESET_SEMANA,
    PRESET_MES,
  ];

  for (const id of fijos) {
    if (!allowed.has(id)) continue;
    const rango = computePresetRange(id, timeZone);
    if (start.isSame(rango.startDate, "day") && end.isSame(rango.endDate, "day")) {
      return { value: id, label: etiquetaPreset(id, options) };
    }
  }

  if (!allowed.has(PRESET_PERIODO)) return null;
  return {
    value: PRESET_PERIODO,
    label: labelPeriodoPersonalizado(start, end),
  };
}

export function formatRangeForApi(start: Dayjs, end: Dayjs): { startDate: string; endDate: string } {
  const [from, to] = end.isBefore(start, "day") ? [end, start] : [start, end];
  return {
    startDate: from.format("YYYY-MM-DD"),
    endDate: to.format("YYYY-MM-DD"),
  };
}
