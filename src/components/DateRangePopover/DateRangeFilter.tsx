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
}: DateRangeFilterProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const menuOpen = Boolean(menuAnchor);

  const hasActiveRange = Boolean(dateFrom || dateTo);

  const displayLabel = useMemo(() => {
    if (!hasActiveRange) return label;
    const inferred = inferPresetFromDates(dateFrom, dateTo);
    return inferred?.label ?? label;
  }, [dateFrom, dateTo, hasActiveRange, label]);

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

    const range = computePresetRange(presetId);
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
        variant="outlined"
        size="small"
        startIcon={compact ? <Calendar size={16} /> : undefined}
        endIcon={<ChevronDown size={16} />}
        onClick={handleOpenMenu}
        aria-label={label}
        title={displayLabel}
        sx={{
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
        }}
      >
        <Box
          component="span"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            minWidth: 0,
            textAlign: "left",
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
        {OPCIONES_FECHA_PRESET.map((opcion) => (
          <ListItemButton
            key={opcion.value}
            onClick={() => handlePresetSelect(opcion.value as PresetFechaId)}
            selected={
              inferPresetFromDates(dateFrom, dateTo)?.value === opcion.value
            }
          >
            <ListItemText primary={opcion.label} />
          </ListItemButton>
        ))}
        {(dateFrom || dateTo) && (
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
