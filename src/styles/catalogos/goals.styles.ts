import { styled } from "@mui/material/styles";
import { colors } from "@/styles/theme";

export const Card = styled('div')(({ padding }: { padding?: string }) => ({
  display: "flex",
  flexDirection: "column",
  backgroundColor: colors.background.sidebar,
  border: `1px solid ${colors.border}`,
  borderRadius: "16px",
  padding: padding || "24px",
  height: "100%",
}));

export const ChartWrapper = styled('div')(({ theme }) => ({
  width: "100%",
  height: 320,
  [theme.breakpoints.down("sm")]: {
    height: 280,
  },
}));
