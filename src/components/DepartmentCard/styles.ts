import { styled } from "@mui/material/styles";
import { colors } from "@/styles/theme";


export const Card = styled("div")({
  display: "block",
  padding: "24px",
  borderRadius: "16px",
  border: `1px solid ${colors.border}`,
  background: "white",
  transition: "border-color 0.15s ease",
});
