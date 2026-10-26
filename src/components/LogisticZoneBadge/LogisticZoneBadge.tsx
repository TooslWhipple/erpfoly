import { Chip } from "@mui/material";

const HEX_COLOR = /^#([0-9a-fA-F]{6})$/;

function withAlpha(hex: string, alpha: number): string {
  const value = Number.parseInt(hex.slice(1), 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

interface LogisticZoneBadgeProps {
  label: string;
  color?: string | null;
}

export function LogisticZoneBadge({ label, color }: LogisticZoneBadgeProps) {
  const hex = color && HEX_COLOR.test(color) ? color : null;

  return (
    <Chip
      size="small"
      label={label}
      variant={hex ? "filled" : "outlined"}
      sx={
        hex
          ? {
              backgroundColor: withAlpha(hex, 0.15),
              color: hex,
              border: `1px solid ${withAlpha(hex, 0.45)}`,
              fontWeight: 600,
            }
          : { fontWeight: 600 }
      }
    />
  );
}
