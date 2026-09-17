"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay, type PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import type { Dayjs } from "dayjs";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import dayjs from "@/lib/dayjs";
import {
  dateCalendarSx,
  datePopoverPaperSx,
  dateRangeHighlightBg,
  dayOfWeekLabel,
} from "./datePickerStyles";
import type { DateRangeInitialValues, DateRangePopoverProps } from "./types";

type Rango = {
  start: Dayjs | null;
  end: Dayjs | null;
};

type RangoUiContext = {
  rango: Rango;
  hover: Dayjs | null;
  setHover: Dispatch<SetStateAction<Dayjs | null>>;
};

const RangoUi = createContext<RangoUiContext | null>(null);

function leerFecha(
  initialRange: DateRangeInitialValues | undefined,
  clave: "startDate" | "endDate",
): Dayjs | null {
  const valor = initialRange?.[clave];
  if (!valor) return null;
  const fecha = dayjs(valor);
  return fecha.isValid() ? fecha.startOf("day") : null;
}

function estaEnRango(dia: Dayjs, inicio: Dayjs, fin: Dayjs): boolean {
  return (
    (dia.isAfter(inicio, "day") || dia.isSame(inicio, "day")) &&
    (dia.isBefore(fin, "day") || dia.isSame(fin, "day"))
  );
}

function DayRange(props: PickersDayProps<Dayjs>) {
  const ctx = useContext(RangoUi);
  const { day, outsideCurrentMonth, sx, ...rest } = props;
  const dia = day.startOf("day");

  let inicio = ctx?.rango.start ?? null;
  let fin = ctx?.rango.end ?? null;
  const hover = ctx?.hover ?? null;

  if (inicio && !fin && hover) {
    if (hover.isBefore(inicio, "day")) {
      fin = inicio;
      inicio = hover;
    } else {
      fin = hover;
    }
  }

  const esInicio = Boolean(inicio && dia.isSame(inicio, "day"));
  const esFin = Boolean(fin && dia.isSame(fin, "day"));
  const enMedio =
    Boolean(inicio && fin) && estaEnRango(dia, inicio!, fin!) && !esInicio && !esFin;
  const esExtremo = esInicio || esFin;

  return (
    <Box
      onMouseEnter={() => {
        if (ctx?.rango.start && !ctx.rango.end) {
          ctx.setHover(dia);
        }
      }}
      sx={{
        position: "relative",
        width: 40,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...(enMedio &&
          !outsideCurrentMonth && {
            "&::before": {
              content: '""',
              position: "absolute",
              inset: "4px 0",
              bgcolor: dateRangeHighlightBg,
              zIndex: 0,
            },
          }),
        ...(esInicio &&
          fin &&
          !outsideCurrentMonth && {
            "&::before": {
              content: '""',
              position: "absolute",
              top: 4,
              bottom: 4,
              left: "50%",
              right: 0,
              bgcolor: dateRangeHighlightBg,
              zIndex: 0,
            },
          }),
        ...(esFin &&
          inicio &&
          !esInicio &&
          !outsideCurrentMonth && {
            "&::before": {
              content: '""',
              position: "absolute",
              top: 4,
              bottom: 4,
              left: 0,
              right: "50%",
              bgcolor: dateRangeHighlightBg,
              zIndex: 0,
            },
          }),
      }}
    >
      <PickersDay
        {...rest}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        selected={false}
        disableHighlightToday={esExtremo}
        sx={[
          {
            position: "relative",
            zIndex: 1,
            borderRadius: 1.5,
            fontSize: 13,
            ...(esExtremo &&
              !outsideCurrentMonth && {
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontWeight: 600,
                "&:hover, &:focus": {
                  bgcolor: "primary.dark",
                  color: "primary.contrastText",
                },
              }),
            ...(enMedio &&
              !outsideCurrentMonth && {
                bgcolor: "transparent",
                "&:hover": { bgcolor: dateRangeHighlightBg },
              }),
          },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
      />
    </Box>
  );
}

type ContentProps = {
  initialRange?: DateRangeInitialValues;
  title?: string;
  description?: string;
  onClose: () => void;
  onConfirm: (range: { startDate: Dayjs; endDate: Dayjs }) => void;
  onClear: () => void;
};

function DateRangeFilterContent({
  initialRange,
  title,
  description,
  onClose,
  onConfirm,
  onClear,
}: ContentProps) {
  const [rango, setRango] = useState<Rango>(() => ({
    start: leerFecha(initialRange, "startDate"),
    end: leerFecha(initialRange, "endDate"),
  }));
  const [hover, setHover] = useState<Dayjs | null>(null);

  const handleDaySelect = useCallback((value: Dayjs | null) => {
    if (!value) return;
    const dia = value.startOf("day");

    setRango((prev) => {
      if (!prev.start || (prev.start && prev.end)) {
        return { start: dia, end: null };
      }

      if (dia.isBefore(prev.start, "day")) {
        return { start: dia, end: prev.start };
      }

      return { start: prev.start, end: dia };
    });
    setHover(null);
  }, []);

  function handleLimpiar() {
    setRango({ start: null, end: null });
    setHover(null);
    onClear();
  }

  function handleConfirm() {
    if (!rango.start || !rango.end) return;
    onConfirm({ startDate: rango.start, endDate: rango.end });
    onClose();
  }

  const puedeAplicar = Boolean(rango.start && rango.end);
  const uiValue = useMemo(() => ({ rango, hover, setHover }), [rango, hover]);

  return (
    <Box sx={{ p: 2, width: 320 }}>
      {(title || description) && (
        <Stack spacing={0.25} sx={{ mb: 1.5 }}>
          {title && <Typography variant="subtitle2">{title}</Typography>}
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Stack>
      )}

      <RangoUi.Provider value={uiValue}>
        <DateCalendar
          value={rango.end ?? rango.start}
          onChange={handleDaySelect}
          showDaysOutsideCurrentMonth
          slots={{ day: DayRange }}
          dayOfWeekFormatter={(date) => dayOfWeekLabel(dayjs(date))}
          sx={dateCalendarSx}
        />
      </RangoUi.Provider>

      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
        <Button variant="text" size="small" onClick={handleLimpiar}>
          Limpiar
        </Button>
        <Button
          variant="contained"
          size="small"
          disabled={!puedeAplicar}
          onClick={handleConfirm}
        >
          Aplicar
        </Button>
      </Stack>
    </Box>
  );
}

export function DateRangeFilterPopover({
  open,
  anchorEl,
  onClose,
  onConfirm,
  onClear,
  initialRange,
  title,
  description,
}: DateRangePopoverProps) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      slotProps={{
        paper: {
          sx: datePopoverPaperSx,
        },
      }}
    >
      {open && (
        <DateRangeFilterContent
          initialRange={initialRange}
          title={title}
          description={description}
          onClose={onClose}
          onConfirm={onConfirm}
          onClear={onClear}
        />
      )}
    </Popover>
  );
}

export default DateRangeFilterPopover;
