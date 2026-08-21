import { styled } from "@mui/material/styles";
import { theme } from "@/styles/theme";

export const SalesChartContainer = styled('div')({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "8px",
    padding: "16px",
    [theme.breakpoints.down("md")]: {
        flexDirection: "column",
        alignItems: "stretch",
        gap: "16px",
    },
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

export const ActivityLogContainer = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3),
}));

export const ActivityLogHeader = styled('div')({
    marginBottom: 24,
});


export const ActivityList = styled('div')({
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    position: "relative",
});

export const ActivityTimeLine = styled('div')({
    position: "absolute",
    top: "8px",
    left: "4px",
    bottom: "56px",
    width: "1px",
    backgroundColor: theme.palette.app.border,
});

export const ActivityItem = styled('div')({
    display: "flex",
    gap: "8px",
    position: "relative"
});

export const ActivityDot = styled('div')({
    width: "9px",
    height: "9px",
    marginTop: "8px",
    borderRadius: "50%",
    backgroundColor: theme.palette.app.border
});

export const CardContainer = styled('div')({
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "16px",
    padding: "24px",
    gap: "24px"
});