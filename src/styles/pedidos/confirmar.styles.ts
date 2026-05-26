import { styled } from "@mui/material/styles";
import { theme } from "@/styles/theme";

export const PageContainer = styled('div')(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
    marginTop: theme.spacing(2),
}));

export const PageHeader = styled('div')(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
}));

export const SummaryCard = styled('div')({
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.paper,
    borderRadius: 12,
    border: `1px solid ${theme.palette.app.border}`,
    padding: "24px 16px",
    gap: "16px"
});

export const ItemCard = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "12px",
    padding: "16px",
}));

export const ItemImage = styled('div')({
    width: "48px",
    height: "48px",
    backgroundColor: theme.palette.background.lowGray,
    borderRadius: "8px",
    flexShrink: 0,
});
