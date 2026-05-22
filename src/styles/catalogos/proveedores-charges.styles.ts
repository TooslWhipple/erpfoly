import { styled } from "@mui/material/styles";
import { Stack } from "@mui/material";

export const TabActionsRow = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  flexWrap: "wrap",
  gap: theme.spacing(2),
}));

export const TabSelectionToolbar = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: theme.spacing(2),
}));

export const ChargeSummaryFooter = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1.5, 2),
  borderRadius: 8,
  backgroundColor: theme.palette.app.background.content,
  border: `1px solid ${theme.palette.app.border}`,
}));

export const VatToggleRow = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  marginTop: theme.spacing(0.5),
}));
