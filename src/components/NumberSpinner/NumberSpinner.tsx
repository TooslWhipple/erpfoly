import { useState, useCallback } from "react";
import { Box, IconButton } from "@mui/material";
import { Minus, Plus } from "lucide-react";

export interface NumberSpinnerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: "small" | "medium";
  iconSize?: number;
  inputWidth?: number;
}

export default function NumberSpinner({
  value,
  onChange,
  min = 0,
  max,
  disabled = false,
  size = "small",
  iconSize = 14,
  inputWidth = 40,
}: NumberSpinnerProps) {
  const [draftValue, setDraftValue] = useState<string | null>(null);
  const displayValue = draftValue !== null ? draftValue : String(value);

  const canDecrement = value > min && !disabled;
  const canIncrement = (max === undefined || value < max) && !disabled;

  const handleDecrement = () => {
    if (canDecrement) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (canIncrement) onChange(value + 1);
  };

  const commitValue = useCallback(
    (raw: string) => {
      const numeric = Number(raw.replace(/\D/g, ""));
      if (Number.isNaN(numeric)) {
        setDraftValue(null);
        return;
      }
      let clamped = numeric;
      if (clamped < min) clamped = min;
      if (max !== undefined && clamped > max) clamped = max;
      onChange(clamped);
      setDraftValue(null);
    },
    [min, max, onChange]
  );

  const handleFocus = () => {
    setDraftValue(String(value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === "" || /^\d*$/.test(v)) {
      setDraftValue(v);
    }
  };

  const handleBlur = () => {
    commitValue(draftValue ?? String(value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      commitValue(draftValue ?? String(value));
      (e.target as HTMLInputElement).blur();
    }
  };

  const btnSize = size === "small" ? 28 : 32;
  const fontSize = size === "small" ? "0.875rem" : "1rem";

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      <IconButton
        size="small"
        onClick={handleDecrement}
        disabled={!canDecrement}
        sx={{
          borderRadius: 0,
          width: btnSize,
          height: btnSize,
          p: 0,
        }}
      >
        <Minus size={iconSize} />
      </IconButton>

      <Box
        component="input"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        sx={{
          width: inputWidth,
          height: btnSize,
          border: "none",
          outline: "none",
          textAlign: "center",
          fontSize,
          fontWeight: 600,
          fontFamily: (theme) => theme.typography.fontFamily,
          color: "text.primary",
          bgcolor: "transparent",
          p: 0,
          userSelect: "none",
          "&:disabled": {
            color: "text.disabled",
            cursor: "not-allowed",
          },
        }}
      />

      <IconButton
        size="small"
        onClick={handleIncrement}
        disabled={!canIncrement}
        sx={{
          borderRadius: 0,
          width: btnSize,
          height: btnSize,
          p: 0,
        }}
      >
        <Plus size={iconSize} />
      </IconButton>
    </Box>
  );
}
