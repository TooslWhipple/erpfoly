import { styled } from "@mui/material/styles";
import { Box, Typography, Button, IconButton } from "@mui/material";
import { colors } from "@/styles/theme";

// ============================================================================
// MAIN CONTAINER
// ============================================================================

export const SummaryContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: colors.background.sidebar,
    padding: theme.spacing(2.5),
}));

// ============================================================================
// HEADER
// ============================================================================

export const SummaryHeader = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(0.5),
    marginBottom: theme.spacing(3),
}));

// SummaryTitle uses Typography variant="h3" (24px, 600) - using h3 with fontWeight 700 override
// SummarySubtitle uses Typography variant="body2" with textAlign center

// ============================================================================
// CONTENT
// ============================================================================

export const SummaryContent = styled(Box)(({ theme }) => ({
    flex: 1,
    overflowY: "auto",
    marginBottom: theme.spacing(2),
}));

// EmptyStateMessage uses Typography variant="body2" with textAlign center and padding

export const ItemsList = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
}));

export const ItemCard = styled(Box)(({ theme }) => ({
    position: "relative",
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    padding: theme.spacing(1),
}));

export const ItemCardHeader = styled(Box)(({ theme }) => ({
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
}));

export const ItemCardContent = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    paddingRight: theme.spacing(2),
}));

// ItemName uses Typography variant="body2" with fontWeight 600
// ItemModel uses Typography variant="caption"
// ItemSku uses Typography variant="caption" with marginBottom

export const ItemFooter = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing(1),
}));

export const QuantityControls = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    overflow: "hidden",
}));

export const QuantityButton = styled(IconButton)(({ theme }) => ({
    borderRadius: 0,
    padding: theme.spacing(0.75),
    minWidth: 32,
    height: 32,
    "&:hover": {
        backgroundColor: colors.background.sidebar,
    },
}));

// QuantityValue uses Typography variant="body2" with fontWeight 500
// ItemPrice uses Typography variant="subtitle1" with fontWeight 600

export const RemoveButton = styled(IconButton)(({ theme }) => ({
    padding: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    "&:hover": {
        backgroundColor: colors.background.sidebar,
        color: theme.palette.error.main,
    },
}));
// ============================================================================
// FOOTER
// ============================================================================

export const SummaryFooter = styled(Box)(({ theme }) => ({
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${colors.border}`,
}));

// ContinueButton uses Button with fullWidth prop and variant="continue" from theme

export const ContinueButtonContent = styled(Box)({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    "& span": {
        fontSize: 16,
        fontWeight: 600,
    },
});

