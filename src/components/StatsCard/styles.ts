import { styled } from "@mui/material/styles";
import { Box, Paper, Typography } from "@mui/material";
import { colors } from "@/styles/theme";

interface CardContainerProps {
  borderColor?: string;
}

export const CardContainer = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "borderColor",
})<CardContainerProps>(({ theme, borderColor }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 8,
  border: `1px solid ${borderColor || colors.border}`,
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

export const IconWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  backgroundColor: colors.border,
  borderRadius: 4,
  color: "#71717A",
  "& svg": {
    width: 18,
    height: 18,
  },
});

interface CardValueProps {
  valueColor?: string;
}

export const CardValue = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "valueColor",
})<CardValueProps>(({ theme, valueColor }) => ({
  fontSize: 36,
  fontWeight: 700,
  lineHeight: 1.2,
  color: valueColor || theme.palette.text.primary,
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

interface StatsCardGroupContainerProps {
  columns?: number;
}

export const StatsCardGroupContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "columns",
})<StatsCardGroupContainerProps>(({ theme, columns = 4 }) => ({
  display: "grid",
  gridTemplateColumns: `repeat(${columns}, 1fr)`,
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down("lg")]: {
    gridTemplateColumns: columns >= 3 ? "repeat(2, 1fr)" : `repeat(${columns}, 1fr)`,
  },
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "1fr",
  },
}));
