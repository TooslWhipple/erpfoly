import { styled } from "@mui/material/styles";
import { IconButton } from "@mui/material";

export const ContentCard = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 16,
}));

export const FinancialSummaryRow = styled("div")(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-end",
  gap: theme.spacing(3),
  width: "100%",
}));

export const FinancialMetric = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  minWidth: 120,
});

export const PaymentProgressWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: theme.spacing(1),
  marginLeft: "auto",
}));

export const PaymentDotsRow = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
}));

export const PaymentDot = styled("span", {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active: boolean }>(({ theme, active }) => ({
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  backgroundColor: active ? theme.palette.primary.main : theme.palette.app.background.lowGray,
}));

export const ReadOnlyField = styled("div")(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: 8,
  backgroundColor: theme.palette.app.background.content,
  border: `1px solid ${theme.palette.app.border}`,
  fontSize: 14,
  fontWeight: 500,
  color: theme.palette.text.primary,
}));
