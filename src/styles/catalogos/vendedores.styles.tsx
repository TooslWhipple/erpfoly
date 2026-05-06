import { styled } from "@mui/material/styles";
import { theme } from "@/styles/theme";

export const PageHeaderRow = styled("div")(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: theme.spacing(2),
}));

export const SectionCard = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 16,
  padding: theme.spacing(3),
}));

export const MetricCard = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(0.5),
  padding: theme.spacing(2.5),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 16,
  minHeight: 104,
}));

export const ChartCard = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "12px",
  gap: "16px",
  padding: "16px",
  height: "100%",
}));

export const SectionCardHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

export const LegendRow = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

export const LegendItem = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.75),
  fontSize: "0.8125rem",
  color: theme.palette.text.secondary,
}));

export const LegendSwatch = styled("span")<{ color: string; dashed?: boolean }>(
  ({ color: swatchColor, dashed }) => ({
    width: 14,
    height: 14,
    borderRadius: 2,
    backgroundColor: dashed ? "transparent" : swatchColor,
    border: dashed ? `2px dashed ${swatchColor}` : "none",
  })
);
