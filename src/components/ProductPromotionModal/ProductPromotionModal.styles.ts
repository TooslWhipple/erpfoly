import { Box, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";

export const LiquidationNoticeRoot = styled(Box)(({ theme }) => ({
  width: "100%",
  height: 40,
  minHeight: 40,
  boxSizing: "border-box",
  backgroundColor: theme.palette.app.promotionLiquidationBanner,
  padding: "8px 12px",
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

export const LiquidationNoticeLeft = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: theme.spacing(1),
}));
