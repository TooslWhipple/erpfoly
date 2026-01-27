import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
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

export const ProductImage = styled(Box)({
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: colors.background.main,
    border: `1px solid ${colors.border}`,
    flexShrink: 0,
});

// ProductName uses Typography variant="h5"
// ProductSku uses Typography variant="caption"

// ============================================================================
// COST INPUT SECTION
// ============================================================================

export const CostInputSection = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(1.5),
    alignItems: "center",
}));

// AddCostButton uses Button with inline styles

// ============================================================================
// HISTORY SECTION
// ============================================================================

export const HistorySection = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
}));

// HistoryTitle uses Typography variant="h6"

export const HistoryTimeline = styled(Box)(({ theme }) => ({
    position: "relative",
    paddingLeft: theme.spacing(3),
    display: "flex",
    flexDirection: "column",
    gap: 0,
}));

export const TimelineLine = styled(Box)({
    position: "absolute",
    left: 11,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#E4E4E7",
});

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

export const TimelineDot = styled(Box)({
    width: 12,
    height: 12,
    borderRadius: "50%",
    backgroundColor: "#F3F4F6",
    border: `1px solid #E4E4E7`,
    flexShrink: 0,
    zIndex: 1,
    marginTop: 4,
});

export const TimelineContent = styled(Box)(({ theme }) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.5),
    width: "100%",
}));

// TimelineDate uses Typography variant="body2" with color #71717A
// TimelinePrice uses Typography variant="h5"

export const TimelineChange = styled(Box)({
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 14,
    fontWeight: 500,
    color: "#16A34A",
    "& svg": {
        fontSize: 14,
    },
});

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


