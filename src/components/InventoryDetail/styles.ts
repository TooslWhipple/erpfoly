import { styled } from "@mui/material/styles";
import { Box, Typography, Button, Chip } from "@mui/material";
import { colors } from "@/styles/theme";

// ============================================================================
// SALES CHART STYLES
// ============================================================================

export const SalesChartContainer = styled(Box)(({ theme }) => ({
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
}));

export const SalesHeader = styled(Box)({
    display: "flex",
    flexDirection: "row",
    gap: "16px",
    alignItems: "flex-start",
    marginBottom: "24px",
});

export const SalesIcon = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    borderRadius: "6px",
    backgroundColor: "#DCFCE7",
    color: "#16A34A",
    "& svg": {
        fontSize: 18,
    },
}));

export const SalesMetric = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginBottom: 24,
});

export const ChartContainer = styled(Box)({
    position: "relative",
    width: "100%",
    height: 200,
    marginTop: 0,
});

// ============================================================================
// ACTIVITY LOG STYLES
// ============================================================================

export const ActivityLogContainer = styled(Box)(({ theme }) => ({
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3),
}));

export const ActivityLogHeader = styled(Box)({
    marginBottom: 24,
});


export const ActivityList = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 0,
});

export const ActivityItem = styled(Box)({
    display: "flex",
    gap: 16,
    position: "relative",
    paddingBottom: 24,
});

export const ActivityDot = styled(Box)<{ isLast?: boolean }>(({ isLast }) => ({
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: colors.border,
    marginTop: 6,
    flexShrink: 0,
    position: "relative",
    "&::after": isLast
        ? {}
        : {
            content: '""',
            position: "absolute",
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            width: 1,
            height: "calc(100% + 16px)",
            backgroundColor: colors.border,
        },
}));

export const ActivityContent = styled(Box)({
    flex: 1,
});


// ============================================================================
// PRODUCT INFO CARD STYLES
// ============================================================================

export const InfoCardContainer = styled(Box)(({ theme }) => ({
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    display: "flex",
    flexDirection: "column",
}));

export const InfoCardHeader = styled(Box)({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
});


export const EditButton = styled(Button)(({ theme }) => ({
    textTransform: "none",
    fontSize: "14px",
    fontWeight: 600,
    minWidth: "auto",
    padding: "6px 16px",
}));

export const InfoCardContent = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 20,
});

export const InfoField = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 6,
});
