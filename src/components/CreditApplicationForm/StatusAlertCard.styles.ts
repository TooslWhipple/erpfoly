import { styled } from "@mui/material/styles";
import { theme } from "@/styles/theme";

export type StatusAlertCardVariant = "default" | "info" | "error" | "success";

const variantStyles: Record<StatusAlertCardVariant, { background: string; color: string }> = {
  default: theme.palette.app.chip.variants.default,
  info: theme.palette.app.chip.variants.info,
  error: theme.palette.app.chip.variants.error,
  success: theme.palette.app.chip.variants.success,
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
