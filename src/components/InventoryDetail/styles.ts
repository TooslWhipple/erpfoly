import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import { colors } from "@/styles/theme";

export const SalesChartContainer = styled('div')({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: "8px",
    padding: "16px"
});

export const SalesIcon = styled('div')({
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
});

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

export const CardContainer = styled('div')({
    display: "flex",
    flexDirection: "column",
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: "16px",
    padding: "24px",
    gap: "24px"
});