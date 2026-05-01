import { styled } from "@mui/material/styles";
import { theme } from "@/styles/theme";

export const CardContainer = styled('div')({
  display: "flex",
  flexDirection: "column",
  padding: "24px",
  backgroundColor: theme.palette.background.paper,
  borderRadius: "16px",
  border: `1px solid ${theme.palette.app.border}`
});
