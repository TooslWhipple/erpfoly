import { styled } from "@mui/material/styles";
import { Stack } from "@mui/material";

export const AmountSummaryCard = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.app.background.lowerBlue,
  border: `1px solid ${theme.palette.app.border}`,
}));

export const AmountSummaryRow = styled(Stack)(() => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}));

export const SupplierToggleRow = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
}));
