import { styled } from "@mui/material/styles";
import { colors } from "@/styles/theme";

export const CardContainer = styled('div')({
  display: "flex",
  flexDirection: "column",
  padding: "24px",
  backgroundColor: colors.background.sidebar,
  borderRadius: "16px",
  border: `1px solid ${colors.border}`
});
