import { styled } from "@mui/material/styles";
import { colors } from "@/styles/theme";

export const Card = styled('div')(({ padding }: { padding?: string }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  backgroundColor: colors.background.sidebar,
  border: `1px solid ${colors.border}`,
  borderRadius: "12px",
  gap: "16px",
  padding: padding || "16px"
}));

export const ChartWrapper = styled('div')(({ theme }) => ({
  width: "100%",
  height: 320,
  [theme.breakpoints.down("sm")]: {
    height: 280,
  },
}));
