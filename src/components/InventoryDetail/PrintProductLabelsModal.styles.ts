import { styled } from "@mui/material/styles";
import { Box, Button, Chip, IconButton, Typography } from "@mui/material";

export const PrintButton = styled(Button)({
  textTransform: "none",
  fontWeight: 600,
  borderRadius: 8,
  paddingInline: 16,
});

export const ProductCard = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 12,
  backgroundColor: theme.palette.background.paper,
}));

export const ProductThumb = styled("div")(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: 8,
  overflow: "hidden",
  flexShrink: 0,
  backgroundColor: theme.palette.background.lowGray,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
}));

export const QuantityRow = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
});

export const StepperControl = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
}));

export const StepperButton = styled(IconButton)(({ theme }) => ({
  width: 36,
  height: 36,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "50%",
  color: theme.palette.text.primary,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "&.Mui-disabled": {
    borderColor: theme.palette.action.disabledBackground,
  },
}));

export const QuantityValue = styled(Typography)({
  minWidth: 40,
  textAlign: "center",
  fontWeight: 700,
  fontSize: "1.5rem",
  lineHeight: 1.2,
});

export const PromosHeader = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
});

export const ActiveBadge = styled(Chip)(({ theme }) => ({
  height: 24,
  fontSize: 12,
  fontWeight: 500,
  backgroundColor: theme.palette.background.lowGray,
  color: theme.palette.text.secondary,
}));

export const PromoCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  borderRadius: 12,
  cursor: "pointer",
  border: `1.5px solid ${
    selected ? theme.palette.primary.main : "transparent"
  }`,
  backgroundColor: theme.palette.background.lowerGray,
  transition: "border-color 0.15s ease, background-color 0.15s ease",
  "&:hover": {
    backgroundColor: theme.palette.background.lowGray,
  },
}));

export const DiscountBadge = styled(Chip)(({ theme }) => ({
  height: 22,
  fontSize: 12,
  fontWeight: 600,
  backgroundColor: theme.palette.background.lowerBlue,
  color: theme.palette.primary.main,
}));

export const SummarySection = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  paddingTop: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.app.border}`,
}));

export const SummaryRow = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
});

export const DiscountAmount = styled(Typography)(({ theme }) => ({
  color: theme.palette.warning.main,
  fontWeight: 600,
}));

export const FinalPriceRow = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  paddingTop: theme.spacing(1.5),
  borderTop: `1px solid ${theme.palette.app.border}`,
}));
