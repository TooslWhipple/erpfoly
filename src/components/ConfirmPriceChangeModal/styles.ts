import { styled } from "@mui/material/styles";
import { Box, Typography, IconButton, DialogContent } from "@mui/material";
import { colors } from "@/styles/theme";

// ============================================================================
// RE-USE MODAL LAYOUT (aligned with ModalForm)
// ============================================================================

export const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  gap: 0,
  "&:first-of-type": {
    paddingTop: theme.spacing(3),
  },
}));

export const ModalHeader = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

export const ModalTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.25rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

export const ModalDescription = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

// ============================================================================
// PRODUCT CARD
// ============================================================================

export const ProductCard = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: 12,
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.background.sidebar,
  marginBottom: theme.spacing(3),
}));

export const ProductRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(1.5),
}));

export const ProductImage = styled(Box)({
  width: 56,
  height: 56,
  borderRadius: 8,
  backgroundColor: "#F3F4F6",
  flexShrink: 0,
});

export const ProductInfo = styled(Box)({
  flex: 1,
  minWidth: 0,
});

export const ProductName = styled(Typography)(({ theme }) => ({
  fontSize: 15,
  fontWeight: 700,
  color: theme.palette.text.primary,
  lineHeight: 1.3,
}));

export const ProductSku = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  color: theme.palette.text.secondary,
  marginTop: 4,
}));

export const PriceComparisonRow = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "baseline",
  gap: theme.spacing(3),
}));

export const PriceBlock = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 2,
});

export const PriceLabel = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  color: theme.palette.text.secondary,
  fontWeight: 500,
}));

export const PriceValue = styled(Typography)(({ theme }) => ({
  fontSize: 18,
  fontWeight: 700,
  color: theme.palette.text.primary,
}));

export const NewPriceWithChange = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "baseline",
  gap: theme.spacing(1),
  flexWrap: "wrap",
}));

export const ChangeIndicator = styled(Box)<{ direction: "up" | "down" }>(({ theme, direction }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: 14,
  fontWeight: 600,
  color: theme.palette.primary.main,
}));
