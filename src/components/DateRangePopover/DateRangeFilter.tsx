"use client";

import { useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  ListItemButton,
  ListItemText,
  Menu,
} from "@mui/material";
import { Calendar, ChevronDown } from "lucide-react";
import type { Dayjs } from "dayjs";
import { DateRangeFilterPopover } from "./DateRangePopover";
import {
  OPCIONES_FECHA_PRESET,
  PRESET_PERIODO,
  computePresetRange,
  formatRangeForApi,
  inferPresetFromDates,
  type PresetFechaId,
} from "./dateRangePresets";
import type { DateRangeFilterProps } from "./types";


export function DateRangeFilter({
  dateFrom,
  dateTo,
  onChange,
  label = "Fecha",
  compact = false,
  variant = "button",
  options = OPCIONES_FECHA_PRESET,
  timeZone,
}: DateRangeFilterProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const menuOpen = Boolean(menuAnchor);
  const isTitle = variant === "title";

  const hasActiveRange = Boolean(dateFrom || dateTo);

  const displayLabel = useMemo(() => {
    if (!hasActiveRange) return label;
    const inferred = inferPresetFromDates(dateFrom, dateTo, options, timeZone);
    return inferred?.label ?? label;
  }, [dateFrom, dateTo, hasActiveRange, label, options, timeZone]);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handlePresetSelect = (presetId: PresetFechaId) => {
    handleCloseMenu();

    if (presetId === PRESET_PERIODO) {
      setPopoverOpen(true);
      return;
    }

    const range = computePresetRange(presetId, timeZone);
    onChange(formatRangeForApi(range.startDate, range.endDate));
  };

  const handlePopoverConfirm = (range: { startDate: Dayjs; endDate: Dayjs }) => {
    onChange(formatRangeForApi(range.startDate, range.endDate));
    setPopoverOpen(false);
  };

  const handlePopoverClear = () => {
    onChange({ startDate: "", endDate: "" });
    setPopoverOpen(false);
  };

  const handleClearFromMenu = () => {
    onChange({ startDate: "", endDate: "" });
    handleCloseMenu();
  };

  return (
    <>
      <Button
        ref={buttonRef}
        variant={isTitle ? "text" : "outlined"}
        size="small"
        disableRipple={isTitle}
        startIcon={!isTitle && compact ? <Calendar size={16} /> : undefined}
        endIcon={<ChevronDown size={isTitle ? 18 : 16} />}
        onClick={handleOpenMenu}
        aria-label={`Periodo: ${displayLabel}`}
        aria-haspopup="listbox"
        aria-expanded={menuOpen}
        title={displayLabel}
        sx={
          isTitle
            ? {
                textTransform: "none",
                font: "inherit",
                fontWeight: 700,
                lineHeight: 1.2,
                color: "text.primary",
                minWidth: 0,
                minHeight: "unset",
                py: 0,
                px: 0.25,
                borderRadius: 1,
                "&:hover": {
                  bgcolor: "transparent",
                  color: "primary.main",
                  "& .date-range-period": {
                    borderColor: "primary.main",
                  },
                  "& .MuiButton-endIcon": { color: "primary.main" },
                },
                "&:focus-visible": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: 3,
                },
                "& .MuiButton-endIcon": {
                  ml: 0.5,
                  mr: 0,
                  color: "text.secondary",
                },
              }
            : {
                textTransform: "none",
                color: hasActiveRange ? "text.primary" : "text.secondary",
                fontWeight: hasActiveRange ? 500 : 400,
                ...(compact && {
                  width: "160px",
                  minWidth: "160px",
                  maxWidth: "160px",
                  justifyContent: "flex-start",
                  "& .MuiButton-startIcon": { flexShrink: 0, mr: "8px" },
                  "& .MuiButton-endIcon": { flexShrink: 0, ml: "auto" },
                }),
              }
        }
      >
        <Box
          component="span"
          className="date-range-period"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            minWidth: 0,
            textAlign: "left",
            ...(isTitle && {
              borderBottom: "2px dashed",
              borderColor: "divider",
              pb: "1px",
            }),
          }}
        >
          {displayLabel}
        </Box>
      </Button>

      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: { minWidth: 220, mt: 0.5 },
          },
        }}
      >
        {options.map((opcion) => (
          <ListItemButton
            key={opcion.value}
            onClick={() => handlePresetSelect(opcion.value as PresetFechaId)}
            selected={
              inferPresetFromDates(dateFrom, dateTo, options, timeZone)?.value ===
              opcion.value
            }
          >
            <ListItemText primary={opcion.label} />
          </ListItemButton>
        ))}
        {!isTitle && (dateFrom || dateTo) && (
          <ListItemButton onClick={handleClearFromMenu} sx={{ color: "error.main" }}>
            <ListItemText primary="Limpiar filtro" />
          </ListItemButton>
        )}
      </Menu>

      <DateRangeFilterPopover
        open={popoverOpen}
        anchorEl={buttonRef.current}
        onClose={() => setPopoverOpen(false)}
        onConfirm={handlePopoverConfirm}
        onClear={handlePopoverClear}
        initialRange={{ startDate: dateFrom || null, endDate: dateTo || null }}
        title="Seleccionar periodo"
        description="Elige la fecha de inicio y fin del rango."
      />
    </>
  );
}
