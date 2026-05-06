import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";
import { theme } from "@/styles/theme";

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
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
});

export const ProductIconPlaceholder = styled('div')({
    width: 48,
    height: 48,
    minWidth: 48,
    borderRadius: 8,
    backgroundColor: theme.palette.app.chip.background,
    border: `1px solid ${theme.palette.app.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
});

export const QuantityValue = styled(Typography)({
    backgroundColor: theme.palette.app.chip.background,
    borderRadius: "4px",
    padding: "2px 4px",
    width: "32px",
    height: "24px",
    textAlign: "center",
});
