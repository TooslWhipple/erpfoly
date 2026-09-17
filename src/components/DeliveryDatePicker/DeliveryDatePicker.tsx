"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Grid, Skeleton, Stack, Typography } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay, type PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import type { Dayjs } from "dayjs";
import dayjs from "@/lib/dayjs";
import { useQuery } from "@tanstack/react-query";
import { getDeliveryAvailability } from "@/services/ventas.service";
import type { DeliveryAvailability } from "@/types/ventas.types";
import { SideModal } from "@/components/SideModal/SideModal";
import { useSnackbarStore } from "@/store/useSnackbarStore";

export interface DeliveryDatePickerProps {
  open: boolean;
  onClose: () => void;
  /** Sucursal usada para consultar disponibilidad de entrega. */
  branchId?: number;
  /** Fecha ya persistida (YYYY-MM-DD), si existe; se usa como selección inicial. */
  value: string | null;
  onConfirm: (date: string) => void;
  /** Omitir cuando no hay fecha persistida que quitar. */
  onRemove?: () => void;
  confirmLoading?: boolean;
  removeLoading?: boolean;
  title?: string;
}

export function DeliveryDatePicker({
  open,
  onClose,
  branchId,
  value,
  onConfirm,
  onRemove,
  confirmLoading = false,
  removeLoading = false,
  title = "Selecciona un día de entrega",
}: DeliveryDatePickerProps) {
  const [modalDate, setModalDate] = useState<Dayjs | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Dayjs>(dayjs());
  const snackbar = useSnackbarStore();

  // Reinicializa la selección cada vez que el modal se abre (patrón "adjusting
  // state during render" de React, en vez de un efecto, para evitar el
  // render en cascada de un setState síncrono dentro de useEffect).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setModalDate(value ? dayjs(value) : dayjs());
    }
  }

  const {
    data: availabilityData,
    isLoading: availabilityLoading,
    isError: availabilityError,
  } = useQuery({
    queryKey: [
      "delivery-availability",
      calendarMonth.month() + 1,
      calendarMonth.year(),
      branchId,
    ],
    queryFn: async () => {
      return getDeliveryAvailability(
        calendarMonth.month() + 1,
        calendarMonth.year(),
        branchId
      );
    },
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (availabilityError) {
      snackbar.showError("No se pudo cargar la disponibilidad");
    }
  }, [availabilityError, snackbar]);

  const availabilityMap = useMemo(() => {
    const map: Record<string, DeliveryAvailability> = {};
    if (availabilityData) {
      for (const item of availabilityData) {
        map[item.date] = item.availability;
      }
    }
    return map;
  }, [availabilityData]);

  // Si el modal abre en "hoy" y el cutoff ya cerró (availability none),
  // saltar a mañana para no confirmar un día que el API va a rechazar.
  if (
    open &&
    !value &&
    !availabilityLoading &&
    modalDate?.isSame(dayjs(), "day") &&
    isTodayClosed(availabilityMap)
  ) {
    const nextOpenDay = dayjs().add(1, "day");
    setModalDate(nextOpenDay);
    if (!nextOpenDay.isSame(calendarMonth, "month")) {
      setCalendarMonth(nextOpenDay);
    }
  }

  // Debounce month changes to avoid rapid refetch on << >> clicks
  const monthChangeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleMonthChange = (newMonth: Dayjs) => {
    if (monthChangeTimer.current) clearTimeout(monthChangeTimer.current);
    monthChangeTimer.current = setTimeout(() => {
      setCalendarMonth(newMonth);
    }, 300);
  };

  const handleDateChange = (val: Dayjs | null) => {
    if (!val) return;
    setModalDate(val);
    // Auto-navigate month if user clicks a day shown from adjacent month
    if (!val.isSame(calendarMonth, "month")) {
      setCalendarMonth(val);
    }
  };

  return (
    <SideModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="xl"
      contentSx={{ bgcolor: "#F8FAFC", overflow: "visible" }}
      paperSx={{ overflow: "visible", height: "auto", maxHeight: "none" }}
    >
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }} sx={{ position: "relative" }}>
          {availabilityLoading && (
            <Box sx={{ position: "absolute", inset: 0, zIndex: 1, bgcolor: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Skeleton variant="rectangular" width="100%" height="100%" />
            </Box>
          )}
          <DateCalendar
            value={modalDate}
            onChange={handleDateChange}
            onMonthChange={handleMonthChange}
            shouldDisableDate={(day) => isDeliveryDayClosed(day, availabilityMap)}
            slots={{ day: CalendarDay }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            slotProps={{ day: { availabilityMap } as any }}
            fixedWeekNumber={6}
            showDaysOutsideCurrentMonth
            sx={{
              // Let the calendar fill width and grow in height naturally
              width: "100%",
              maxWidth: "100%",
              height: "auto !important",
              maxHeight: "none !important",
              overflow: "visible !important",
              bgcolor: "#fff",
              borderRadius: 1.25,
              p: 2,
              border: "1px solid rgba(0,0,0,0.05)",
              // Root container
              "&.MuiDateCalendar-root": {
                width: "100%",
                height: "auto !important",
                maxHeight: "none !important",
                overflow: "visible !important",
              },
              // Give slideTransition a stable minHeight for 6 weeks.
              // Keep overflow: hidden (MUI default) so the slide
              // animation clips correctly and doesn't show outside.
              "& .MuiDayCalendar-slideTransition": {
                minHeight: "300px !important",
              },
              // Week rows
              "& .MuiDayCalendar-header": {
                justifyContent: "space-around",
              },
              "& .MuiDayCalendar-weekContainer": {
                justifyContent: "space-around",
                margin: "2px 0",
              },
              // Header
              "& .MuiPickersCalendarHeader-root": {
                pl: 1,
                pr: 1,
              },
              "& .MuiPickersCalendarHeader-label": {
                fontWeight: 600,
                fontSize: "1.1rem",
                textTransform: "capitalize",
              },
              // Day labels row
              "& .MuiDayCalendar-weekDayLabel": {
                fontWeight: 500,
                color: "text.secondary",
                flex: 1,
                textAlign: "center",
                margin: 0,
              },
              // Day cells
              "& .MuiPickersDay-root": {
                borderRadius: "50%",
                fontSize: "0.95rem",
                flex: "0 0 auto",
                width: "2.4rem",
                height: "2.4rem",
                margin: "2px auto",
              },
              "& .MuiPickersDay-root.Mui-selected": {
                bgcolor: "#2563EB",
                color: "#fff",
                "&:hover, &:focus": { bgcolor: "#2563EB" },
              },
              "& .MuiPickersDay-root.MuiPickersDay-today": {
                bgcolor: "rgba(37, 99, 235, 0.08)",
                color: "#2563EB",
                fontWeight: 700,
                border: "none",
              },
              "& .MuiPickersDay-root:focus.Mui-selected": {
                bgcolor: "#2563EB",
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Tu selección:
            </Typography>

            {modalDate && (
              <>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  {(() => {
                    const modalAvailability = availabilityLoading
                      ? undefined
                      : availabilityMap[modalDate.format("YYYY-MM-DD")];
                    const colors = availabilityLoading
                      ? getSelectionBoxColors(undefined)
                      : getSelectionBoxColors(modalAvailability);
                    return (
                      <Box
                        sx={{
                          bgcolor: colors.boxBg,
                          borderRadius: 1,
                          width: 57,
                          height: 68,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                          py: 1,
                          px: 2,
                          opacity: availabilityLoading ? 0.5 : 1,
                          transition: "opacity 0.2s",
                        }}
                      >
                        <span
                          style={{
                            color: colors.dayColor,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            lineHeight: 1,
                            textTransform: "uppercase",
                          }}
                        >
                          {modalDate.format("ddd")}
                        </span>
                        <span
                          style={{
                            color: colors.numberColor,
                            fontWeight: 600,
                            fontSize: "1.1rem",
                            lineHeight: 1,
                          }}
                        >
                          {modalDate.date()}
                        </span>
                      </Box>
                    );
                  })()}
                  <Stack spacing={0.25}>
                    <Typography variant="body2" fontWeight={600}>
                      {modalDate
                        .format("dddd D [de] MMMM")
                        .replace(/^\w/, (c) => c.toUpperCase())}
                    </Typography>
                    {availabilityLoading ? (
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Skeleton variant="circular" width={10} height={10} />
                        <Skeleton variant="text" width={120} height={16} />
                      </Stack>
                    ) : (
                      (() => {
                        const modalAvailability = availabilityMap[modalDate.format("YYYY-MM-DD")];
                        const colors = getSelectionBoxColors(modalAvailability);
                        return (
                          <Typography variant="caption" sx={{ color: colors.labelColor, fontWeight: 500 }}>
                            {getAvailabilityLabel(modalAvailability)}
                          </Typography>
                        );
                      })()
                    )}
                  </Stack>
                </Stack>

                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  Al confirmar la entrega será programada para esta fecha, hay una
                  posibilidad que se reagende por la poca disponibilidad del día.
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    textTransform: "none",
                    borderRadius: 1.5,
                    py: 1,
                    mt: 1,
                  }}
                  disabled={
                    confirmLoading ||
                    availabilityLoading ||
                    (modalDate != null &&
                      isDeliveryDayClosed(modalDate, availabilityMap))
                  }
                  onClick={() => {
                    if (modalDate) {
                      onConfirm(modalDate.format("YYYY-MM-DD"));
                    }
                  }}
                >
                  {confirmLoading ? "Guardando..." : "Confirmar"}
                </Button>
                {onRemove && (
                  <Button
                    variant="text"
                    fullWidth
                    sx={{ textTransform: "none", color: "error.main" }}
                    disabled={removeLoading || availabilityLoading}
                    onClick={onRemove}
                  >
                    Quitar fecha
                  </Button>
                )}
              </>
            )}
          </Stack>
        </Grid>
      </Grid>
    </SideModal>
  );
}

function isTodayClosed(
  availabilityMap: Record<string, DeliveryAvailability>,
): boolean {
  return availabilityMap[dayjs().format("YYYY-MM-DD")] === "none";
}

function isDeliveryDayClosed(
  day: Dayjs,
  availabilityMap: Record<string, DeliveryAvailability>,
): boolean {
  if (day.startOf("day").isBefore(dayjs().startOf("day"))) return true;
  return (
    day.isSame(dayjs(), "day") &&
    availabilityMap[day.format("YYYY-MM-DD")] === "none"
  );
}

function getAvailabilityColor(availability: DeliveryAvailability | undefined): string {
  if (availability === "available") return "#16A34A";
  if (availability === "low") return "#F97316";
  if (availability === "none") return "#E5E7EB";
  return "#E5E7EB";
}

function getAvailabilityLabel(availability: DeliveryAvailability | undefined): string {
  const color = getAvailabilityColor(availability);
  if (color === "#16A34A") return "Alta disponibilidad";
  if (color === "#F97316") return "Poca disponibilidad";
  return "Sin disponibilidad";
}

function getSelectionBoxColors(availability: DeliveryAvailability | undefined) {
  const color = getAvailabilityColor(availability);
  switch (color) {
    case "#16A34A":
      return {
        boxBg: "#DCFCE7",
        numberColor: "#16A34A",
        dayColor: "#4ADE80",
        labelColor: "#16A34A",
      };
    case "#F97316":
      return {
        boxBg: "#FFF7ED",
        numberColor: "#EA580C",
        dayColor: "#FDBA74",
        labelColor: "#EA580C",
      };
    default:
      return {
        boxBg: "#E5E7EB",
        numberColor: "#6B7280",
        dayColor: "#9CA3AF",
        labelColor: "#9CA3AF",
      };
  }
}

function CalendarDay(props: PickersDayProps<Dayjs> & { availabilityMap?: Record<string, DeliveryAvailability> }) {
  const { day, outsideCurrentMonth, availabilityMap, selected, today, ...other } = props;

  const dateStr = day.format("YYYY-MM-DD");
  const availability = availabilityMap?.[dateStr];
  const isPastDay = day.startOf("day").isBefore(dayjs().startOf("day"));

  const color = outsideCurrentMonth
    ? null
    : isPastDay
    ? "#E5E7EB"
    : availability === "available"
    ? "#16A34A"
    : availability === "low"
    ? "#F97316"
    : availability === "none"
    ? "#E5E7EB"
    : null;

  return (
    <Box sx={{ position: "relative" }}>
      <PickersDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        selected={selected}
        today={today}
        disabled={isDeliveryDayClosed(day, availabilityMap ?? {})}
        sx={{
          // Días deshabilitados (pasados o hoy con cutoff cerrado)
          "&.Mui-disabled": {
            color: "#9CA3AF",
            opacity: 0.6,
            pointerEvents: "none",
            "&:hover": {
              bgcolor: "transparent",
            },
          },
          // Días fuera del mes (debe ir primero para que otros estilos lo sobrescriban)
          "&.MuiPickersDay-dayOutsideMonth": {
            color: "rgba(0, 0, 0, 0.26)",
            opacity: 0.5,
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.04)",
            },
          },
          // Día seleccionado
          "&.Mui-selected": {
            bgcolor: "primary.main",
            color: "#fff",
            fontWeight: 600,
            opacity: 1,
            "&:hover": {
              bgcolor: "primary.dark",
            },
            "&:focus": {
              bgcolor: "primary.main",
            },
          },
          // Día actual (no seleccionado)
          "&.MuiPickersDay-today:not(.Mui-selected)": {
            border: "2px solid",
            borderColor: "primary.main",
            color: "primary.main",
            fontWeight: 600,
            bgcolor: "transparent",
            opacity: 1,
          },
          // Día actual Y seleccionado
          "&.MuiPickersDay-today.Mui-selected": {
            bgcolor: "primary.main",
            color: "#fff",
            fontWeight: 600,
            border: "2px solid",
            borderColor: "primary.dark",
            opacity: 1,
          },
          // Días normales del mes actual
          "&:not(.Mui-selected):not(.MuiPickersDay-today):not(.MuiPickersDay-dayOutsideMonth)": {
            color: "text.primary",
            opacity: 1,
            "&:hover": {
              bgcolor: "action.hover",
            },
          },
        }}
      />
      {color && (
        <Box
          sx={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            bgcolor: color,
            position: "absolute",
            bottom: 2,
            left: "50%",
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        />
      )}
    </Box>
  );
}
