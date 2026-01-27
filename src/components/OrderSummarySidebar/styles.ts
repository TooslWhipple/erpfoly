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

export const SummaryTitle = styled(Typography)(({ theme }) => ({
    fontSize: 24,
    fontWeight: 700,
    color: theme.palette.text.primary,
    textAlign: "center",
}));

export const SummarySubtitle = styled(Typography)(({ theme }) => ({
    fontSize: 14,
    color: theme.palette.text.secondary,
    textAlign: "center",
}));

// ============================================================================
// CONTENT
// ============================================================================

export const SummaryContent = styled(Box)(({ theme }) => ({
    flex: 1,
    overflowY: "auto",
    marginBottom: theme.spacing(2),
}));

export const EmptyStateMessage = styled(Typography)(({ theme }) => ({
    fontSize: 14,
    color: theme.palette.text.secondary,
    textAlign: "center",
    padding: theme.spacing(4, 2),
}));

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

export const ItemName = styled(Typography)(({ theme }) => ({
    fontSize: 14,
    fontWeight: 600,
    color: theme.palette.text.primary,
    lineHeight: 1.4,
}));

export const ItemModel = styled(Typography)(({ theme }) => ({
    fontSize: 12,
    color: theme.palette.text.secondary,
}));

export const ItemSku = styled(Typography)(({ theme }) => ({
    fontSize: 12,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1.5),
}));

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

export const QuantityValue = styled(Typography)(({ theme }) => ({
    fontSize: 14,
    fontWeight: 500,
    color: theme.palette.text.primary,
    minWidth: 24,
    textAlign: "center",
    padding: `0 ${theme.spacing(1)}`,
}));

export const ItemPrice = styled(Typography)(({ theme }) => ({
    fontSize: 16,
    fontWeight: 600,
    color: theme.palette.text.primary,
}));

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

export const ContinueButton = styled(Button)(({ theme }) => ({
    textTransform: "none",
    fontWeight: 600,
    borderRadius: 8,
    padding: theme.spacing(1.5, 2),
    width: "100%",
}));

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
