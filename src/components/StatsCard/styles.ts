import { styled } from "@mui/material/styles";
import { theme } from "@/styles/theme";

export const CardContainer = styled('div')({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "24px 16px",
  backgroundColor: theme.palette.background.paper,
  borderRadius: "16px",
  border: `1px solid ${theme.palette.app.border}`,
  overflow: "hidden",
});
