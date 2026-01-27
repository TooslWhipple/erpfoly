import { styled } from "@mui/material/styles";
import { Box, Button, TextField, Select, Chip, Typography, IconButton } from "@mui/material";
import { colors } from "@/styles/theme";

// ============================================================================
// SEARCH PAGE STYLES
// ============================================================================

export const SearchPageContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "calc(100vh - 200px)",
    padding: theme.spacing(4),
    gap: theme.spacing(4),
}));

export const LogoContainer = styled(Box)({
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
});

export const LogoText = styled(Typography)({
    fontSize: 32,
    fontWeight: 700,
    lineHeight: 1.2,
    "& .foly": {
        color: "#DC2626", // Red
    },
    "& .soft": {
        color: "#232325", // Dark gray
    },
});

export const VersionText = styled(Typography)(({ theme }) => ({
    fontSize: 14,
    color: theme.palette.text.secondary,
    marginLeft: 8,
}));

export const SearchBarContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    width: "100%",
    maxWidth: 800,
    backgroundColor: colors.background.sidebar,
    borderRadius: 8,
    padding: theme.spacing(1),
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
}));

export const SearchTypeSelect = styled(Select)(({ theme }) => ({
    minWidth: 140,
    backgroundColor: colors.background.sidebar,
    "& .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.border,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.border,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
    },
})) as unknown as typeof Select;

export const SearchInput = styled(TextField)(({ theme }) => ({
    flex: 1,
    "& .MuiOutlinedInput-root": {
        backgroundColor: colors.background.sidebar,
        "& fieldset": {
            borderColor: colors.border,
        },
        "&:hover fieldset": {
            borderColor: colors.border,
        },
        "&.Mui-focused fieldset": {
            borderColor: theme.palette.primary.main,
        },
    },
}));

export const SearchButton = styled(Button)(({ theme }) => ({
    minWidth: 120,
    height: 40,
    textTransform: "none",
    fontWeight: 600,
    borderRadius: 8,
}));

// ============================================================================
// DETAIL PAGE STYLES
// ============================================================================

export const DetailPageContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
}));

export const HeaderSection = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing(2),
    gap: theme.spacing(2),
    flexWrap: "wrap",
}));

export const TitleSection = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 8,
});

export const InvoiceTitle = styled(Typography)(({ theme }) => ({
    fontSize: 20,
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: 4,
}));

export const InvoiceNumber = styled(Typography)(({ theme }) => ({
    fontSize: 32,
    fontWeight: 700,
    color: theme.palette.text.primary,
    marginBottom: 4,
}));

export const PurchaseDate = styled(Typography)(({ theme }) => ({
    fontSize: 14,
    color: theme.palette.text.secondary,
}));

export const HeaderRightSection = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
}));

export const StatusChip = styled(Chip)<{ statusType: "activo" | "cancelado" | "pagado" }>(({ statusType }) => {
    const statusStyles: Record<string, { bg: string; text: string }> = {
        activo: { bg: "#dcfce7", text: "#16a34a" },
        cancelado: { bg: "#fee2e2", text: "#dc2626" },
        pagado: { bg: "#dbeafe", text: "#2563eb" },
    };
    const style = statusStyles[statusType] || statusStyles.activo;
    return {
        backgroundColor: style.bg,
        color: style.text,
        fontWeight: 500,
        fontSize: 13,
        borderRadius: 6,
        height: 28,
    };
});

export const MoreOptionsButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.text.secondary,
    padding: 8,
}));

export const FinancialSummary = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(3),
    flexWrap: "wrap",
    padding: theme.spacing(2),
    backgroundColor: colors.background.sidebar,
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
}));

export const FinancialItem = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 120,
});

export const FinancialLabel = styled(Typography)(({ theme }) => ({
    fontSize: 12,
    color: theme.palette.text.secondary,
}));

export const FinancialValue = styled(Typography)(({ theme }) => ({
    fontSize: 16,
    fontWeight: 600,
    color: theme.palette.text.primary,
}));

export const PaymentIndicator = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginLeft: "auto",
}));

export const PaymentDots = styled(Box)({
    display: "flex",
    gap: 4,
    alignItems: "center",
});

export const PaymentDot = styled(Box)<{ active: boolean }>(({ active }) => ({
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: active ? "#2663EB" : "#E4E4E7",
}));

export const PaymentText = styled(Typography)(({ theme }) => ({
    fontSize: 14,
    color: theme.palette.text.secondary,
}));

export const TabsContainer = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

export const TabContent = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(3),
    minHeight: 200,
}));

export const EmptyState = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(6),
    color: theme.palette.text.secondary,
    fontSize: 14,
}));

export const ArticlesList = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 16,
});

export const ArticleCard = styled(Box)(({ theme }) => ({
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: theme.spacing(2.5),
}));

export const ArticleHeader = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing(2),
}));

export const ArticleInfo = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 4,
});

export const ArticleCode = styled(Typography)(({ theme }) => ({
    fontSize: 13,
    color: theme.palette.text.secondary,
}));

export const ArticleDescription = styled(Typography)(({ theme }) => ({
    fontSize: 15,
    fontWeight: 500,
    color: theme.palette.text.primary,
}));

export const ArticleStatusChip = styled(Chip)<{ statusType: string }>(({ statusType }) => {
    const statusStyles: Record<string, { bg: string; text: string }> = {
        entregado: { bg: "#dcfce7", text: "#16a34a" },
        reparacion: { bg: "#ffedd5", text: "#ea580c" },
        pendiente: { bg: "#dbeafe", text: "#2563eb" },
        cancelado: { bg: "#fee2e2", text: "#dc2626" },
    };
    const style = statusStyles[statusType] || statusStyles.pendiente;
    return {
        backgroundColor: style.bg,
        color: style.text,
        fontWeight: 500,
        fontSize: 12,
        borderRadius: 6,
        height: 24,
    };
});

export const ArticleDetails = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(4),
    flexWrap: "wrap",
    marginTop: theme.spacing(1),
}));

export const ArticleDetailItem = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 4,
});

export const ArticleDetailLabel = styled(Typography)(({ theme }) => ({
    fontSize: 13,
    color: theme.palette.text.secondary,
}));

export const ArticleDetailValue = styled(Typography)(({ theme }) => ({
    fontSize: 15,
    fontWeight: 600,
    color: theme.palette.text.primary,
}));

export const SummaryPanel = styled(Box)(({ theme }) => ({
    width: 280,
    flexShrink: 0,
    position: "sticky",
    top: theme.spacing(2),
    alignSelf: "flex-start",
    [theme.breakpoints.down("lg")]: {
        width: "100%",
        position: "relative",
        top: 0,
    },
}));

export const SummaryCard = styled(Box)(({ theme }) => ({
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: theme.spacing(2.5),
}));

export const SummaryTitle = styled(Typography)(({ theme }) => ({
    fontSize: 16,
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(2),
}));

export const SummaryRow = styled(Box)({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
});

export const SummaryLabel = styled(Typography)(({ theme }) => ({
    fontSize: 14,
    color: theme.palette.text.secondary,
}));

export const SummaryValue = styled(Typography)(({ theme }) => ({
    fontSize: 14,
    fontWeight: 500,
    color: theme.palette.text.primary,
    textAlign: "right",
}));

export const SummaryTotalRow = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${colors.border}`,
    marginTop: theme.spacing(1),
}));

export const SummaryTotalLabel = styled(Typography)(({ theme }) => ({
    fontSize: 16,
    fontWeight: 600,
    color: theme.palette.text.primary,
}));

export const SummaryTotalValue = styled(Typography)(({ theme }) => ({
    fontSize: 20,
    fontWeight: 700,
    color: theme.palette.text.primary,
}));

export const ContentLayout = styled(Box)(({ theme }) => ({
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
