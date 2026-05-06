import { styled } from "@mui/material/styles";
import { theme } from "@/styles/theme";

export const FormCard = styled('div')({
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "16px",
    padding: "24px",
    gap: "16px"
});
