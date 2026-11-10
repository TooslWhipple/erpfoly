import { styled } from "@mui/material/styles";

export const LiquidatedCard = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  minWidth: 0,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "12px",
  padding: theme.spacing(2),
}));

export const LiquidatedProductImage = styled("img")(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: 10,
  objectFit: "cover",
  backgroundColor: theme.palette.grey[100],
  flexShrink: 0,
}));

export const LiquidatedImagePlaceholder = styled("div")(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: 10,
  backgroundColor: theme.palette.grey[100],
  flexShrink: 0,
}));

export const LiquidatedPriceRow = styled("div")(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "baseline",
  gap: theme.spacing(1),
}));
