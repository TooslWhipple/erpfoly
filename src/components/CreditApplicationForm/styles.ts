import { styled } from "@mui/material/styles";
import { colors } from "@/styles/theme";

export const Card = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  backgroundColor: colors.background.sidebar,
  border: `1px solid ${colors.border}`,
  borderRadius: "16px",
  padding: "24px",
  gap: "24px",
}));
