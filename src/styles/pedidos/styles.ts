import { styled } from "@mui/material/styles";
import { Box, Button, Chip, Typography } from "@mui/material";
import { colors } from "@/styles/theme";

// ============================================================================
// TYPES
// ============================================================================

export type OrderStatus = "pending" | "in_progress" | "received";

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export const PageContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(3),
    [theme.breakpoints.down("lg")]: {
        flexDirection: "column",
    },
}));

export const MainContent = styled(Box)({
    flex: 1,
    minWidth: 0,
});

export const SidePanel = styled(Box)(({ theme }) => ({
    width: 280,
    flexShrink: 0,
    [theme.breakpoints.down("lg")]: {
        width: "100%",
        order: -1,
    },
}));

// ============================================================================
// HEADER COMPONENTS
// ============================================================================

export const HeaderSection = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing(3),
    gap: theme.spacing(2),
    flexWrap: "wrap",
    [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
        alignItems: "stretch",
    },
}));

export const TitleSection = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 4,
});

export const TitleRow = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "baseline",
    gap: theme.spacing(1.5),
    flexWrap: "wrap",
}));

export const PageTitle = styled(Typography)(({ theme }) => ({
    fontSize: 28,
    fontWeight: 700,
    color: "#232325",
    [theme.breakpoints.down("sm")]: {
        fontSize: 24,
    },
}));

export const DateText = styled(Typography)({
    fontSize: 14,
    color: "#71717A",
});

export const ActionsSection = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    flexWrap: "wrap",
    [theme.breakpoints.down("sm")]: {
        width: "100%",
        justifyContent: "flex-start",
    },
}));

export const ActionButton = styled(Button)(({ theme }) => ({
    height: 40,
    textTransform: "none",
    fontWeight: 500,
    [theme.breakpoints.down("sm")]: {
        flex: "1 1 auto",
        minWidth: 0,
    },
}));

export const StatusChip = styled(Chip)<{ statusType: OrderStatus }>(({ statusType }) => {
    const statusStyles: Record<OrderStatus, { bg: string; text: string }> = {
        received: { bg: "#dcfce7", text: "#16a34a" },
        in_progress: { bg: "#dbeafe", text: "#2563eb" },
        pending: { bg: "#ffedd5", text: "#ea580c" },
    };
    const style = statusStyles[statusType];
    return {
        backgroundColor: style.bg,
        color: style.text,
        fontWeight: 500,
        fontSize: 13,
        borderRadius: 6,
        height: 24,
    };
});

// ============================================================================
// SUMMARY PANEL COMPONENTS
// ============================================================================

export const SummaryCard = styled(Box)(({ theme }) => ({
    position: "sticky",
    top: theme.spacing(2),
}));

export const SummaryRow = styled(Box)({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
});

export const SummaryLabel = styled(Typography)({
    fontSize: 14,
    color: "#71717A",
});

export const SummaryValue = styled(Typography)({
    fontSize: 14,
    fontWeight: 500,
    color: "#232325",
    textAlign: "right",
});

export const TotalRow = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${colors.border}`,
    marginTop: theme.spacing(1),
}));

export const TotalLabel = styled(Typography)({
    fontSize: 16,
    fontWeight: 600,
    color: "#232325",
});

export const TotalValue = styled(Typography)({
    fontSize: 28,
    fontWeight: 700,
    color: "#232325",
});

// ============================================================================
// ORDER ITEM CARD COMPONENTS
// ============================================================================

export const ItemsList = styled(Box)({
    display: "flex",
    flexDirection: "column",
});

export const ItemCard = styled(Box)(({ theme }) => ({
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: theme.spacing(2.5),
    marginBottom: theme.spacing(2),
}));

export const ItemHeader = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));

export const ItemImage = styled(Box)({
    width: 64,
    height: 64,
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    flexShrink: 0,
});

export const ItemInfo = styled(Box)({
    flex: 1,
    minWidth: 0,
});

export const ItemCode = styled(Typography)({
    fontSize: 13,
    color: "#71717A",
    marginBottom: 4,
});

export const ItemName = styled(Typography)({
    fontSize: 15,
    fontWeight: 500,
    color: "#232325",
});

export const ItemPriceRow = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(4),
    marginBottom: theme.spacing(1.5),
    flexWrap: "wrap",
}));

export const PriceColumn = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 4,
});

export const PriceLabel = styled(Typography)({
    fontSize: 13,
    color: "#71717A",
});

export const PriceValue = styled(Typography)({
    fontSize: 15,
    fontWeight: 600,
    color: "#232325",
});

export const ComparisonRow = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    flexWrap: "wrap",
}));

export const InternetPriceTag = styled(Box)({
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#71717A",
    fontSize: 13,
});

export const ComparisonLink = styled(Box)({
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 13,
    color: "#71717A",
    cursor: "pointer",
    "&:hover": {
        color: "#232325",
    },
});
