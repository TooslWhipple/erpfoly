import { styled } from "@mui/material/styles";
import { Box, Button, Typography } from "@mui/material";
import { colors } from "@/styles/theme";

// ============================================================================
// CARD
// ============================================================================

export const CardContainer = styled(Box)(({ theme }) => ({
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${colors.border}`,
  "&:last-child": {
    borderBottom: "none",
    paddingBottom: 0,
  },
}));

export const ProductRow = styled(Box)({
  display: "flex",
  gap: 12,
  marginBottom: 12,
});

export const ProductImage = styled(Box)({
  width: 48,
  height: 48,
  borderRadius: 6,
  backgroundColor: "#F3F4F6",
  flexShrink: 0,
});

export const ProductInfo = styled(Box)({
  flex: 1,
  minWidth: 0,
});

export const ProductName = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 500,
  color: theme.palette.text.primary,
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
}));

export const ProductSku = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  color: theme.palette.text.secondary,
  marginTop: 2,
}));

// ============================================================================
// SUGGESTED PRICE BLOCK
// ============================================================================

export const SuggestedPriceBlock = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(1.5),
  flexWrap: "wrap",
  marginBottom: theme.spacing(1),
}));

export const SuggestedPriceLabel = styled(Typography)(({ theme }) => ({
  fontSize: 11,
  fontWeight: 500,
  color: theme.palette.text.secondary,
  textTransform: "uppercase",
  letterSpacing: "0.02em",
  marginBottom: 2,
}));

export const SuggestedPriceValue = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "baseline",
  gap: 6,
  "& .price": {
    fontSize: 16,
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
  "& .change": {
    fontSize: 13,
    fontWeight: 500,
  },
  "& .change-down": {
    color: "#16a34a",
  },
  "& .change-up": {
    color: "#dc2626",
  },
}));

export const ApplyButton = styled(Button)(({ theme }) => ({
  flexShrink: 0,
  textTransform: "none",
  fontWeight: 600,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}));

// ============================================================================
// ALTERNATIVE PRICES
// ============================================================================

export const AlternativePrices = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1.5),
  fontSize: 12,
  color: theme.palette.text.secondary,
}));

export const AlternativePriceItem = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  color: theme.palette.text.secondary,
  "& .price": {
    fontWeight: 500,
  },
  "& .down": {
    color: "#16a34a",
  },
  "& .up": {
    color: "#dc2626",
  },
}));
