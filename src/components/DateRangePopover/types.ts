import type { Dayjs } from "dayjs";

export type DateRangeSelectOption = {
  value: string;
  label: string;
};

export type DateRangeValue = {
  startDate: string;
  endDate: string;
};

export type DateRangeInitialValues = {
  startDate?: string | Date | null;
  endDate?: string | Date | null;
};

export type DateRangePopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onConfirm: (range: { startDate: Dayjs; endDate: Dayjs }) => void;
  onClear: () => void;
  initialRange?: DateRangeInitialValues;
  title?: string;
  description?: string;
};

export type DateRangeFilterProps = {
  dateFrom: string;
  dateTo: string;
  onChange: (range: DateRangeValue) => void;
  /** Texto por defecto del botón cuando no hay filtro activo. */
  label?: string;
  /** Oculta la etiqueta externa; solo muestra el botón selector. */
  compact?: boolean;
  /**
   * `title` hereda tipografía del encabezado (selector inline).
   * `button` es el control outlined de toolbar (default).
   */
  variant?: "button" | "title";
  /** Si se omite, se usan todos los presets actuales. */
  options?: DateRangeSelectOption[];
  /** Zona IANA para calcular Hoy / Esta semana. Sin valor, usa la zona local. */
  timeZone?: string;
};
