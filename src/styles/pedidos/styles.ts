import { styled } from "@mui/material/styles";
import { Chip } from "@mui/material";

export type OrderStatus = "pending" | "in_progress" | "received";

export const PageContainer = styled('div')(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(3),
    [theme.breakpoints.down("lg")]: {
        flexDirection: "column",
    },
}));

export const MainContent = styled('div')({
    flex: 1,
    minWidth: 0,
});

export const SidePanel = styled('div')(({ theme }) => ({
    width: 280,
    flexShrink: 0,
    [theme.breakpoints.down("lg")]: {
        width: "100%",
        order: -1,
    },
}));

export const HeaderSection = styled('div')(({ theme }) => ({
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

export const TitleSection = styled('div')({
    display: "flex",
    flexDirection: "column",
    gap: 4,
});

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

export const SummaryCard = styled('div')(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "16px",
    gap: "16px",
    padding: "16px",
}));

export const ItemCard = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "12px",
    padding: "16px"
}));

export const ItemImage = styled('img')({
    width: "32px",
    height: "32px",
    backgroundColor: "#e5e7eb",
    borderRadius: "8px",
    flexShrink: 0,
});