import { styled } from "@mui/material/styles";
import { theme } from "@/styles/theme";

export const SummaryCard = styled('div')({
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.paper,
    borderRadius: "16px",
    border: `1px solid ${theme.palette.app.border}`,
    padding: "16px",
    gap: "16px"
});
