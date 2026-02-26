import { styled } from "@mui/material/styles";
import { colors } from "@/styles/theme";

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
    backgroundColor: colors.background.sidebar,
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    padding: "24px 16px",
    gap: "16px"
});
