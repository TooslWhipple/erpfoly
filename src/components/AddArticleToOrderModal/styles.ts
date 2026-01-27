import { styled } from "@mui/material/styles";
import { Box, TextField, Button, Typography } from "@mui/material";
import { colors } from "@/styles/theme";

// ============================================================================
// MAIN CONTAINER
// ============================================================================

export const AddArticleModalContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
    marginTop: theme.spacing(2),
}));

// ============================================================================
// PRODUCT INFO
// ============================================================================

export const ProductInfo = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(1.5),
    alignItems: "flex-start",
}));

export const ProductImage = styled(Box)(({ theme }) => ({
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: colors.background.main,
    border: `1px solid ${colors.border}`,
    flexShrink: 0,
}));

export const ProductName = styled(Typography)(({ theme }) => ({
    fontSize: 18,
    fontWeight: 600,
    color: theme.palette.text.primary,
    lineHeight: 1.4,
}));

export const ProductSku = styled(Typography)(({ theme }) => ({
    fontSize: 14,
    color: theme.palette.text.secondary,
}));

// ============================================================================
// COST INPUT SECTION
// ============================================================================

export const CostInputSection = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(1.5),
    alignItems: "center",
}));

export const AddCostButton = styled(Button)(({ theme }) => ({
    textTransform: "none",
    fontWeight: 600,
    borderRadius: 6,
    padding: theme.spacing(1.25, 2.5),
    whiteSpace: "nowrap",
}));

// ============================================================================
// HISTORY SECTION
// ============================================================================

export const HistorySection = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
}));

export const HistoryTitle = styled(Typography)(({ theme }) => ({
    fontSize: 16,
    fontWeight: 600,
    color: theme.palette.text.primary,
}));

export const HistoryTimeline = styled(Box)(({ theme }) => ({
    position: "relative",
    paddingLeft: theme.spacing(3),
    display: "flex",
    flexDirection: "column",
    gap: 0,
}));

export const TimelineLine = styled(Box)(({ theme }) => ({
    position: "absolute",
    left: 11,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#E4E4E7",
}));

export const TimelineItem = styled(Box)(({ theme }) => ({
    position: "relative",
    display: "flex",
    gap: theme.spacing(2),
    alignItems: "flex-start",
    paddingBottom: theme.spacing(2.5),
    "&:last-child": {
        paddingBottom: 0,
    },
}));

export const TimelineDot = styled(Box)(({ theme }) => ({
    width: 12,
    height: 12,
    borderRadius: "50%",
    backgroundColor: "#F3F4F6",
    border: `1px solid #E4E4E7`,
    flexShrink: 0,
    zIndex: 1,
    marginTop: 4,
}));

export const TimelineContent = styled(Box)(({ theme }) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.5),
    width: "100%",
}));

export const TimelineDate = styled(Typography)(({ theme }) => ({
    fontSize: 14,
    color: "#71717A",
    fontWeight: 400,
}));

export const TimelinePriceRow = styled(Box)({
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
});

export const TimelinePrice = styled(Typography)(({ theme }) => ({
    fontSize: 18,
    fontWeight: 600,
    color: "#232325",
    lineHeight: 1.2,
}));

export const TimelineChange = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 14,
    fontWeight: 500,
    color: "#16A34A",
    "& svg": {
        fontSize: 14,
    },
}));

export const TimelineOrderLink = styled("a")(({ theme }) => ({
    fontSize: 14,
    color: "#71717A",
    textDecoration: "underline",
    cursor: "pointer",
    whiteSpace: "nowrap",
    "&:hover": {
        color: theme.palette.primary.main,
    },
}));

// ============================================================================
// QUANTITY SECTION
// ============================================================================


