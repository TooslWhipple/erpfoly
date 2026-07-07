import { styled } from "@mui/material/styles";
import { theme } from "@/styles/theme";

export type StatusChipVariant = "default" | "success" | "pending" | "error" | "warning" | "info" | "infoAlt" | "disabled" | "nuevo" | "aumento";

export type StatusChipSize = "default" | "small";

const variantStyles: Record<StatusChipVariant, { background: string; color: string }> = {
  default: theme.palette.app.chip.variants.default,
  success: theme.palette.app.chip.variants.success,
  pending: theme.palette.app.chip.variants.pending,
  error: theme.palette.app.chip.variants.error,
  warning: theme.palette.app.chip.variants.warning,
  info: theme.palette.app.chip.variants.info,
  infoAlt: theme.palette.app.chip.variants.infoAlt,
  disabled: theme.palette.app.chip.variants.disabled,
  nuevo: theme.palette.app.chip.variants.nuevo,
  aumento: theme.palette.app.chip.variants.aumento,
};

const sizeStyles: Record<
  StatusChipSize,
  { height: number; padding: string; fontSize: number; lineHeight: number | string; gap: number; iconFontSize: string; spanFontSize: string; spanLineHeight: string }
> = {
  default: {
    height: 40,
    padding: "8px 16px",
    fontSize: 14,
    lineHeight: 1.5,
    gap: 6,
    iconFontSize: "18",
    spanFontSize: "16px",
    spanLineHeight: "24px",
  },
  small: {
    height: 24,
    padding: "4px 8px",
    fontSize: 12,
    lineHeight: "16px",
    gap: 4,
    iconFontSize: "14",
    spanFontSize: "12px",
    spanLineHeight: "16px",
  },
};

function getGridTemplateColumns(hasStartIcon: boolean, hasEndIcon: boolean): string {
  const labelColumn = "minmax(0, 1fr)";

  if (hasStartIcon && hasEndIcon) {
    return `max-content ${labelColumn} max-content`;
  }
  if (hasStartIcon) {
    return `max-content ${labelColumn}`;
  }
  if (hasEndIcon) {
    return `${labelColumn} max-content`;
  }
  return labelColumn;
}

export interface StyledStatusChipProps {
  variant: StatusChipVariant;
  size?: StatusChipSize;
  backgroundColor?: string;
  color?: string;
  hasStartIcon?: boolean;
  hasEndIcon?: boolean;
}

export const StyledStatusChip = styled("div", {
  shouldForwardProp: (prop) =>
    prop !== "variant" &&
    prop !== "size" &&
    prop !== "backgroundColor" &&
    prop !== "color" &&
    prop !== "hasStartIcon" &&
    prop !== "hasEndIcon",
})<StyledStatusChipProps>(({
  variant,
  size = "default",
  backgroundColor: bgOverride,
  color: colorOverride,
  hasStartIcon = false,
  hasEndIcon = false,
}) => {
  const { background, color } = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return {
    display: "inline-grid",
    gridTemplateColumns: getGridTemplateColumns(hasStartIcon, hasEndIcon),
    alignItems: "center",
    columnGap: sizeStyle.gap,
    borderRadius: "8px",
    height: sizeStyle.height,
    padding: sizeStyle.padding,
    backgroundColor: bgOverride ?? background,
    color: colorOverride ?? color,
    fontSize: sizeStyle.fontSize,
    fontWeight: 500,
    lineHeight: sizeStyle.lineHeight,
    boxSizing: "border-box",
    maxWidth: "100%",
    minWidth: 0,
    width: "auto",
    overflow: "hidden",
    flexShrink: 1,
    verticalAlign: "middle",
    "& .status-chip-icon": {
      display: "inline-flex",
      alignItems: "center",
      flexShrink: 0,
      "& svg": {
        fontSize: sizeStyle.iconFontSize,
      },
    },
    "& .status-chip-label": {
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontSize: sizeStyle.spanFontSize,
      fontWeight: 600,
      lineHeight: sizeStyle.spanLineHeight,
    },
  };
});
