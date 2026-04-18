import { styled } from "@mui/material/styles";
import { colors } from "@/styles/theme";

export type StatusAlertCardVariant = "default" | "info" | "error" | "success";

const variantStyles: Record<StatusAlertCardVariant, { backgroundColor: string; color: string }> = {
  default: colors.chip.variants.default,
  info: colors.chip.variants.info,
  error: colors.chip.variants.error,
  success: colors.chip.variants.success,
};

interface StatusAlertContainerProps {
  variant: StatusAlertCardVariant;
}

export const StatusAlertContainer = styled("div", {
  shouldForwardProp: (prop) => prop !== "variant",
})<StatusAlertContainerProps>(({ variant }) => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  borderRadius: "8px",
  padding: "12px",
  gap: "12px",
  backgroundColor: variantStyles[variant].background,
  color: variantStyles[variant].color,
}));
