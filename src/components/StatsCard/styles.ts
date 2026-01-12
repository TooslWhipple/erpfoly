import { styled } from "@mui/material/styles";
import { Box, Paper, Typography } from "@mui/material";
import { colors } from "@/styles/theme";

export const CardContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 8,
  border: `1px solid ${colors.border}`,
  boxShadow: "none",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  minWidth: 200,
  flex: 1,
}));

export const CardHeader = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

export const CardLabel = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 500,
  color: theme.palette.text.secondary,
}));

export const IconWrapper = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
  "& svg": {
    width: 20,
    height: 20,
  },
}));

export const CardValue = styled(Typography)(({ theme }) => ({
  fontSize: 36,
  fontWeight: 700,
  lineHeight: 1.2,
  color: theme.palette.text.primary,
}));

interface ComparisonTextProps {
  trend: "positive" | "negative" | "neutral";
}

export const ComparisonText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "trend",
})<ComparisonTextProps>(({ theme, trend }) => ({
  fontSize: 13,
  color:
    trend === "positive"
      ? "#16a34a"
      : trend === "negative"
      ? "#dc2626"
      : theme.palette.text.secondary,
}));

export const StatsCardGroupContainer = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down("lg")]: {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "1fr",
  },
}));
