import { styled } from "@mui/material/styles";

export const SummaryCard = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.paper,
  borderRadius: "16px",
  border: `1px solid ${theme.palette.app.border}`,
  padding: "16px",
  gap: "16px",
}));

export const ItemCard = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "12px",
  gap: "16px",
  padding: "16px",
}));

export const ImageWrapper = styled("div")(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: Number(theme.shape.borderRadius) * 2,
  overflow: "hidden",
  flexShrink: 0,
  backgroundColor: theme.palette.background.lowGray,
  border: `1px solid ${theme.palette.app.border}`,
}));

export const ProductImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

export const ImagePlaceholder = styled("div")(({ theme }) => ({
  width: "100%",
  height: "100%",
  backgroundColor: theme.palette.background.lowGray,
}));
