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

function etiquetaPreset(id: PresetFechaId): string {
  return OPCIONES_FECHA_PRESET.find((opcion) => opcion.value === id)?.label ?? id;
}

export function labelPeriodoPersonalizado(start: Dayjs, end: Dayjs): string {
  return `${start.format("DD/MM/YYYY")} – ${end.format("DD/MM/YYYY")}`;
}

export function computePresetRange(
  id: Exclude<PresetFechaId, typeof PRESET_PERIODO>,
): { startDate: Dayjs; endDate: Dayjs } {
  const hoy = dayjs().startOf("day");

  switch (id) {
    case PRESET_HOY:
      return { startDate: hoy, endDate: hoy };
    case PRESET_AYER: {
      const ayer = hoy.subtract(1, "day");
      return { startDate: ayer, endDate: ayer };
    }
    case PRESET_SEMANA:
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
): DateRangeSelectOption | null {
  const start = leerDia(startValue);
  const end = leerDia(endValue);
  if (!start || !end) return null;

  const fijos: Exclude<PresetFechaId, typeof PRESET_PERIODO>[] = [
    PRESET_HOY,
    PRESET_AYER,
    PRESET_SEMANA,
    PRESET_MES,
  ];

  for (const id of fijos) {
    const rango = computePresetRange(id);
    if (start.isSame(rango.startDate, "day") && end.isSame(rango.endDate, "day")) {
      return { value: id, label: etiquetaPreset(id) };
    }
  }

  return {
    value: PRESET_PERIODO,
    label: labelPeriodoPersonalizado(start, end),
  };
}

export function formatRangeForApi(start: Dayjs, end: Dayjs): { startDate: string; endDate: string } {
  return {
    startDate: start.format("YYYY-MM-DD"),
    endDate: end.format("YYYY-MM-DD"),
  };
}
