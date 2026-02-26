import { styled } from "@mui/material/styles";
import { colors } from "@/styles/theme";

interface CardContainerProps {
  borderColor?: string;
}

export const CardContainer = styled('div', {
  shouldForwardProp: (prop) => prop !== "borderColor",
})<CardContainerProps>(({ borderColor }) => ({
  padding: "24px",
  backgroundColor: colors.background.sidebar,
  borderRadius: "16px",
  border: `1px solid ${borderColor || colors.border}`,
  boxShadow: "none",
  display: "flex",
  flexDirection: "column",
  minWidth: "200px",
  flex: 1,
}));

export const CardHeader = styled('div')({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

export const IconWrapper = styled('div')({
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

interface StatsCardGroupContainerProps {
  columns?: number;
}

export const StatsCardGroupContainer = styled('div', {
  shouldForwardProp: (prop) => prop !== "columns",
})<StatsCardGroupContainerProps>(({ columns = 4 }) => ({
  display: "grid",
  gridTemplateColumns: `repeat(${columns}, 1fr)`,
  gap: "8px"
}));
