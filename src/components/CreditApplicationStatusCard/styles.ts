import { styled } from "@mui/material/styles";
import { Box, Stack } from "@mui/material";
import { colors } from "@/styles/theme";

export type CreditApplicationStatusCardVariant = "approved" | "rejected";

const CARD_VARIANT_STYLES: Record<
  CreditApplicationStatusCardVariant,
  { backgroundColor: string; borderColor: string; iconColor: string }
> = {
  approved: {
    backgroundColor: colors.chip.variants.success.background,
    borderColor: colors.chip.variants.success.background,
    iconColor: colors.chip.variants.success.color,
  },
  rejected: {
    backgroundColor: colors.chip.variants.error.background,
    borderColor: colors.chip.variants.error.background,
    iconColor: colors.chip.variants.error.color,
  },
};

interface StatusCardContainerProps {
  variant: CreditApplicationStatusCardVariant;
}

export const StatusCardContainer = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "variant",
})<StatusCardContainerProps>(({ variant }) => ({
  width: "100%",
  borderRadius: 12,
  border: `1px solid ${CARD_VARIANT_STYLES[variant].borderColor}`,
  backgroundColor: CARD_VARIANT_STYLES[variant].backgroundColor,
  padding: "12px 16px",
}));

export const StatusCardContent = styled(Stack)({
  width: "100%",
  gap: 12,
  alignItems: "center",
  justifyContent: "space-between",
});

export const StatusCardTextContainer = styled(Stack)({
  gap: 2,
  flex: 1,
  minWidth: 0,
});

interface StatusIconContainerProps {
  variant: CreditApplicationStatusCardVariant;
}

export const StatusIconContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "variant",
})<StatusIconContainerProps>(({ variant }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  color: CARD_VARIANT_STYLES[variant].iconColor,
}));
