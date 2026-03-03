import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import { colors } from "@/styles/theme";

export type StatusChipVariant = "default" | "success" | "pending" | "error" | "warning";

const variantStyles: Record<StatusChipVariant, { background: string; color: string }> = {
  default: colors.chip.variants.default,
  success: colors.chip.variants.success,
  pending: colors.chip.variants.pending,
  error: colors.chip.variants.error,
  warning: colors.chip.variants.warning,
};

export const StyledStatusChip = styled(Box, {
  shouldForwardProp: (prop) => prop !== "variant",
})<{ variant: StatusChipVariant }>(({ variant }) => {
  const { background, color } = variantStyles[variant];
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 8,
    height: 40,
    padding: "8px 16px",
    backgroundColor: background,
    color,
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.5,
    boxSizing: "border-box",
    "& svg": {
      fontSize: "18",
      flexShrink: 0,
    },
    "& span": {
      fontSize: "16px",
      fontWeight: 600,
      lineHeight: "24px",
    },
  };
});
