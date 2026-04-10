import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";
import { colors } from "@/styles/theme";

// ============================================================================
// CARD CONTAINER
// ============================================================================

export const CardRoot = styled('div')({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    padding: "16px",
    borderRadius: "16px",
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
});

export const ProductIconPlaceholder = styled('div')({
    width: 48,
    height: 48,
    minWidth: 48,
    borderRadius: 8,
    backgroundColor: colors.chip.background,
    border: `1px solid ${colors.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
});

export const QuantityValue = styled(Typography)({
    backgroundColor: colors.chip.background,
    borderRadius: "4px",
    padding: "2px 4px",
    width: "32px",
    height: "24px",
    textAlign: "center",
});
