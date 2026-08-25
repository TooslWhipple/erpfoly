import { alpha, type SxProps, type Theme } from "@mui/material/styles";

export function dayOfWeekLabel(date: { format: (pattern: string) => string }): string {
  return date.format("dd").charAt(0).toUpperCase();
}

export const datePopoverPaperSx: SxProps<Theme> = {
  borderRadius: 2,
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  mt: 1,
};

export const dateCalendarSx: SxProps<Theme> = (theme) => ({
  width: "100%",
  maxWidth: "100%",
  "& .MuiPickersCalendarHeader-label": {
    fontWeight: 600,
    textTransform: "capitalize",
  },
  "& .MuiDayCalendar-weekDayLabel": {
    fontWeight: 500,
    color: "text.secondary",
  },
  "& .MuiPickersDay-root": {
    width: 36,
    height: 36,
    fontSize: 13,
  },
  "& .MuiPickersDay-root.MuiPickersDay-today": {
    border: "none",
    fontWeight: 700,
  },
  "& .MuiDayCalendar-slideTransition": {
    minHeight: 240,
  },
  // Highlight color for in-range days (replaces primary.10 from source project)
  "--date-range-highlight": alpha(theme.palette.primary.main, 0.12),
});

export const dateRangeHighlightBg = "var(--date-range-highlight)";
