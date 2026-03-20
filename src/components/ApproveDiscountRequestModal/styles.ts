import { styled } from "@mui/material/styles";
import { colors } from "@/styles/theme";

export const PriceComparisonPanel = styled('div')({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  gap: "12px",
  padding: "8px 12px",
  borderRadius: "12px",
  backgroundColor: colors.background.content
});
